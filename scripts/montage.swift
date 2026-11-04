// Monte un reel vertical (1080 × 1920) à partir de clips vidéo et d'images, sans ffmpeg.
//
// Écrit le 20/09/2026 : le Mac de Soumia n'a ni ffmpeg ni Homebrew (installer Homebrew demande un
// mot de passe administrateur). Tout passe donc par AVFoundation, fourni avec macOS.
//
// Compilation :  swiftc -O scripts/montage.swift -o scripts/montage
// Usage       :  scripts/montage <spec.json> <sortie.mp4>
//
// Le fichier de spec :
// {
//   "fps": 30,
//   "segments": [
//     { "type": "image", "fichier": "/chemin/carton-7h10.png", "duree": 1.6 },
//     { "type": "video", "fichier": "/chemin/VID_xxx.mp4", "debut": 2.0, "duree": 4.0 }
//     ("miroir": true remet à l'endroit un plan selfie filmé en miroir)
//   ]
// }
//
// La vidéo sort SANS SON, comme le reel Sans filtre : Soumia ajoute une musique tendance dans
// Instagram. Chaque plan est recadré en remplissage (aspect fill) sur 1080 × 1920, jamais déformé.
import AVFoundation
import AppKit
import CoreText

// Légende posée sur le plan en cours (04/11/2026) : petite, blanche, minuscule, centrée, façon
// « journée de » (@mademoisellesoph). Une ombre douce sur les lettres, jamais de voile sur l'image.
var legendeCourante: String? = nil
// Police des légendes : Cormorant Garamond italique (celle du site), chargée depuis scripts/polices.
// Avenir essayé en premier, jugé pas joli par Soumia le 04/11/2026.
let dossierPolices = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent().appendingPathComponent("polices")
for f in ["CormorantGaramond-Italic.ttf", "CormorantGaramond.ttf"] {
    CTFontManagerRegisterFontsForURL(dossierPolices.appendingPathComponent(f) as CFURL, .process, nil)
}
var policeLegende = "CormorantGaramond-MediumItalic"
var tailleLegende = 72.0
func dessinerLegende(_ texte: String, ctx: CGContext) {
    let police = CTFontCreateWithName(policeLegende as CFString, tailleLegende, nil)
    let attrs: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): police,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): CGColor(red: 1, green: 1, blue: 1, alpha: 1),
        NSAttributedString.Key(kCTKernAttributeName as String): 0.3,
    ]
    let ligne = CTLineCreateWithAttributedString(NSAttributedString(string: texte, attributes: attrs))
    let largeur = CTLineGetTypographicBounds(ligne, nil, nil, nil)
    ctx.saveGState()
    ctx.setShadow(offset: CGSize(width: 0, height: -2), blur: 10, color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.55))
    ctx.textPosition = CGPoint(x: (Double(LARGEUR) - largeur) / 2, y: Double(HAUTEUR) * 0.47)
    CTLineDraw(ligne, ctx)
    ctx.restoreGState()
}

struct Segment: Decodable {
    let type: String
    let fichier: String
    let duree: Double
    let debut: Double?
    let miroir: Bool?
    let legende: String?   // petite légende minuscule centrée (04/11/2026, vlog du vendredi)
}
struct Spec: Decodable {
    let fps: Int?
    let policeLegende: String?
    let tailleLegende: Double?
    let segments: [Segment]
}

let LARGEUR = 1080, HAUTEUR = 1920

func pixelBuffer(_ image: CGImage, pool: CVPixelBufferPool) -> CVPixelBuffer? {
    var buffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &buffer)
    guard let buffer else { return nil }
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }
    guard let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buffer), width: LARGEUR, height: HAUTEUR,
                              bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
                              space: CGColorSpaceCreateDeviceRGB(),
                              bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)
    else { return nil }
    ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: LARGEUR, height: HAUTEUR))
    // Recadrage en remplissage : on garde les proportions, on déborde, on centre.
    let echelle = max(Double(LARGEUR) / Double(image.width), Double(HAUTEUR) / Double(image.height))
    let l = Double(image.width) * echelle, h = Double(image.height) * echelle
    ctx.draw(image, in: CGRect(x: (Double(LARGEUR) - l) / 2, y: (Double(HAUTEUR) - h) / 2, width: l, height: h))
    if let t = legendeCourante, !t.isEmpty { dessinerLegende(t, ctx: ctx) }
    return buffer
}

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: montage <spec.json> <sortie.mp4>"); exit(1) }
let spec = try JSONDecoder().decode(Spec.self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))
let fps = spec.fps ?? 30
if let p = spec.policeLegende { policeLegende = p }
if let t = spec.tailleLegende { tailleLegende = t }
let sortie = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: sortie)

let writer = try AVAssetWriter(outputURL: sortie, fileType: .mp4)
let entree = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: LARGEUR, AVVideoHeightKey: HAUTEUR,
    AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 8_000_000],
])
entree.expectsMediaDataInRealTime = false
let adaptateur = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: entree, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA),
    kCVPixelBufferWidthKey as String: LARGEUR, kCVPixelBufferHeightKey as String: HAUTEUR,
])
writer.add(entree)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

var pool: CVPixelBufferPool!
CVPixelBufferPoolCreate(nil, nil, [
    kCVPixelBufferPixelFormatTypeKey: Int(kCVPixelFormatType_32BGRA),
    kCVPixelBufferWidthKey: LARGEUR, kCVPixelBufferHeightKey: HAUTEUR,
] as CFDictionary, &pool)

var image = 0
func ecrire(_ cg: CGImage, frames: Int) {
    guard let tampon = pixelBuffer(cg, pool: pool) else { return }
    for _ in 0..<frames {
        while !entree.isReadyForMoreMediaData { usleep(5000) }
        adaptateur.append(tampon, withPresentationTime: CMTime(value: CMTimeValue(image), timescale: CMTimeScale(fps)))
        image += 1
    }
}

for (i, seg) in spec.segments.enumerated() {
    let url = URL(fileURLWithPath: seg.fichier)
    legendeCourante = seg.legende
    if seg.type == "image" {
        guard let src = NSImage(contentsOf: url), let cg = src.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
            print("image illisible : \(seg.fichier)"); continue
        }
        ecrire(cg, frames: Int((seg.duree * Double(fps)).rounded()))
        print("\(i + 1). image \(url.lastPathComponent) — \(seg.duree) s")
    } else {
        let asset = AVURLAsset(url: url)
        guard let piste = asset.tracks(withMediaType: .video).first else { print("vidéo sans piste : \(seg.fichier)"); continue }
        let lecteur = try AVAssetReader(asset: asset)
        let sortiePiste = AVAssetReaderTrackOutput(track: piste, outputSettings: [
            kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)])
        let debut = CMTime(seconds: seg.debut ?? 0, preferredTimescale: 600)
        lecteur.timeRange = CMTimeRange(start: debut, duration: CMTime(seconds: seg.duree, preferredTimescale: 600))
        lecteur.add(sortiePiste)
        lecteur.startReading()
        let transform = piste.preferredTransform
        var comptees = 0
        let cible = Int((seg.duree * Double(fps)).rounded())
        // Calage sur le temps réel du plan (04/11/2026) : les vidéos 4K du Xiaomi sont à ~24 i/s.
        // Écrire une image de sortie par image source les passait en accéléré (×1,25) et rognait la
        // durée. Chaque image source couvre désormais toutes les images de sortie jusqu'à la
        // suivante, et la dernière est tenue jusqu'à la durée demandée.
        var precedente: CGImage? = nil
        func tenir(jusqua t: Double) {
            guard let cg = precedente else { return }
            while comptees < cible && Double(comptees) / Double(fps) < t {
                ecrire(cg, frames: 1); comptees += 1
            }
        }
        while comptees < cible, let echantillon = sortiePiste.copyNextSampleBuffer() {
            guard let px = CMSampleBufferGetImageBuffer(echantillon) else { continue }
            let t = CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(echantillon)) - (seg.debut ?? 0)
            tenir(jusqua: t)
            var ci = CIImage(cvPixelBuffer: px)
            if !transform.isIdentity {
                // Une vidéo de téléphone est enregistrée couchée (3840 × 2160 ici), avec la rotation
                // dans ses métadonnées. CIImage a son origine en bas à gauche, donc la matrice de
                // l'asset arrive à l'envers : on prend l'angle et on tourne dans l'autre sens, puis
                // on ramène l'image à l'origine — sinon l'extent part en négatif et le plan sort noir.
                let angle = atan2(transform.b, transform.a)
                ci = ci.transformed(by: CGAffineTransform(rotationAngle: -angle))
                ci = ci.transformed(by: CGAffineTransform(translationX: -ci.extent.origin.x, y: -ci.extent.origin.y))
            }
            if seg.miroir == true {
                // Plan filmé à la caméra selfie avec l'effet miroir : on le remet à l'endroit.
                ci = ci.transformed(by: CGAffineTransform(scaleX: -1, y: 1))
                ci = ci.transformed(by: CGAffineTransform(translationX: -ci.extent.origin.x, y: -ci.extent.origin.y))
            }
            let contexte = CIContext()
            guard let cg = contexte.createCGImage(ci, from: ci.extent) else { continue }
            precedente = cg
        }
        tenir(jusqua: seg.duree)
        print("\(i + 1). vidéo \(url.lastPathComponent) — \(Double(comptees) / Double(fps)) s retenues")
    }
}

entree.markAsFinished()
let attente = DispatchSemaphore(value: 0)
writer.finishWriting { attente.signal() }
attente.wait()
print("→ \(sortie.path) — \(String(format: "%.1f", Double(image) / Double(fps))) s, \(LARGEUR)×\(HAUTEUR), sans son")
