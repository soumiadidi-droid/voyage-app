// Reel vertical (1080 × 1920) avec effet machine à écrire tapé PAR-DESSUS les vidéos, sans ffmpeg.
//
// Écrit le 28/09/2026 pour le hors-série « Comment être en vacances dans sa ville ». Diffère de
// scripts/montage.swift + scripts/machine-a-ecrire.mjs (20/09), qui intercalaient des cartons
// plein écran entre les plans : ici le texte s'écrit sur l'image, lettre par lettre, au début de
// chaque séquence, et reste affiché jusqu'au plan suivant. Seuls l'ouverture et la fin peuvent
// être des cartons unis.
//
// Compilation :  swiftc -O scripts/reel-machine.swift -o scripts/reel-machine
// Usage       :  scripts/reel-machine <spec.json> <sortie.mp4>
//
// Spec :
// {
//   "fps": 24,          // = cadence des rushes (téléphone de Soumia : 24 i/s). Ne pas monter à 30,
//                       // sinon une image sur trois est doublée et l'image accroche.
//   "debit": 25,        // Mbit/s (défaut 25). 10 écrasait les détails des rushes 4K.
//   "sequences": [
//     { "surtitre": "Hors-série", "lignes": ["Comment être", "en vacances"], "grand": true,
//       "plans": [ { "fichier": "/chemin/VID.mp4", "debut": 0.5, "duree": 2.5 } ] },
//     { "carton": "sable", "surtitre": "Fin", "lignes": ["…"], "duree": 3.5 }
//   ]
// }
//
// Polices : Cormorant Garamond et IBM Plex Mono dans scripts/polices (Google Fonts, licence OFL),
// chargées au lancement — elles ne sont pas installées sur le Mac.
// Pas de filtre sur les images : seul un dégradé sombre passe sous le texte, pour la lisibilité.
// La vidéo sort SANS SON, la musique s'ajoute dans Instagram.
import AVFoundation
import AppKit
import CoreText

struct Plan: Decodable { let fichier: String; let debut: Double?; let duree: Double }
struct Sequence: Decodable {
    let surtitre: String?
    let lignes: [String]
    let grand: Bool?
    let carton: String?
    let duree: Double?
    let plans: [Plan]?
}
struct Spec: Decodable { let fps: Int?; let cps: Double?; let fondu: Double?; let vitesse: Double?; let debit: Double?; let sequences: [Sequence] }

let L = 1080, H = 1920
let COULEURS: [String: (CGFloat, CGFloat, CGFloat)] = [
    "sable": (0xF1, 0xDA, 0xB1), "ivoire": (0xFA, 0xF6, 0xF0), "charcoal": (0x1A, 0x1A, 0x1A),
    "ink": (0x8C, 0x4A, 0x32), "blanc": (0xFF, 0xFF, 0xFF),
]
func couleur(_ nom: String, _ alpha: CGFloat = 1) -> CGColor {
    let c = COULEURS[nom] ?? COULEURS["sable"]!
    return CGColor(red: c.0 / 255, green: c.1 / 255, blue: c.2 / 255, alpha: alpha)
}

// Polices
let dossierPolices = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent().appendingPathComponent("polices")
for f in ["CormorantGaramond.ttf", "IBMPlexMono-Medium.ttf"] {
    CTFontManagerRegisterFontsForURL(dossierPolices.appendingPathComponent(f) as CFURL, .process, nil)
}
func cormorant(_ taille: CGFloat) -> CTFont {
    // Police variable : on force la graisse 600, comme les tuiles.
    let base = CTFontDescriptorCreateWithNameAndSize("CormorantGaramond-Light" as CFString, taille)
    let d = CTFontDescriptorCreateCopyWithVariation(base, NSNumber(value: 0x77676874), 600)
    return CTFontCreateWithFontDescriptor(d, taille, nil)
}
let mono = CTFontCreateWithName("IBMPlexMono-Medium" as CFString, 24, nil)

func ligneCT(_ texte: String, _ police: CTFont, _ c: CGColor, kern: CGFloat = 0) -> CTLine {
    let attrs: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(kCTFontAttributeName as String): police,
        NSAttributedString.Key(kCTForegroundColorAttributeName as String): c,
        NSAttributedString.Key(kCTKernAttributeName as String): kern,
    ]
    return CTLineCreateWithAttributedString(NSAttributedString(string: texte, attributes: attrs))
}

/// Dessine le bloc de texte. `n` = nombre de caractères visibles (retours à la ligne compris).
func dessinerTexte(_ ctx: CGContext, seq: Sequence, n: Int, curseur: Bool, surCarton: Bool) {
    let grand = seq.grand ?? false
    let taille: CGFloat = grand ? 104 : 86
    let interligne = taille * 1.08
    let police = cormorant(taille)
    let encre = surCarton ? couleur("charcoal") : couleur("blanc")
    let accent = surCarton ? couleur("ink") : couleur("sable")
    let marge: CGFloat = 90

    // Découpe du texte visible en lignes
    let complet = Array(seq.lignes.joined(separator: "\n"))
    let visible = String(complet.prefix(n)).components(separatedBy: "\n")
    let nbLignes = seq.lignes.count

    // Le bloc est ancré par le bas : sa dernière ligne tombe toujours au même endroit, quelle que
    // soit la longueur du texte. Au-dessus de la zone couverte par la légende Instagram.
    let basY: CGFloat = surCarton ? CGFloat(H) * 0.46 : 560
    let hautY = basY + interligne * CGFloat(nbLignes - 1)

    if !surCarton {
        // Dégradé sombre sous le texte seulement, jamais sur toute l'image.
        let espace = CGColorSpaceCreateDeviceRGB()
        let grad = CGGradient(colorsSpace: espace, colors: [
            CGColor(gray: 0, alpha: 0), CGColor(gray: 0, alpha: 0.42), CGColor(gray: 0, alpha: 0.42), CGColor(gray: 0, alpha: 0),
        ] as CFArray, locations: [0, 0.35, 0.7, 1])!
        let bas = basY - 260, haut = hautY + taille + 200
        ctx.drawLinearGradient(grad, start: CGPoint(x: 0, y: bas), end: CGPoint(x: 0, y: haut), options: [])
    }

    if let s = seq.surtitre, n > 0 {
        let y = hautY + taille * 0.95
        ctx.setFillColor(accent)
        ctx.fill(CGRect(x: marge, y: y + 9, width: 70, height: 2))
        ctx.textPosition = CGPoint(x: marge + 90, y: y)
        CTLineDraw(ligneCT(s.uppercased(), mono, accent, kern: 6.5), ctx)
    }

    if !surCarton {
        ctx.setShadow(offset: CGSize(width: 0, height: -2), blur: 14, color: CGColor(gray: 0, alpha: 0.55))
    }
    var finX = marge, finY = hautY
    for (i, texte) in visible.enumerated() {
        let y = hautY - interligne * CGFloat(i)
        let l = ligneCT(texte, police, encre)
        ctx.textPosition = CGPoint(x: marge, y: y)
        CTLineDraw(l, ctx)
        finX = marge + CGFloat(CTLineGetTypographicBounds(l, nil, nil, nil)); finY = y
    }
    ctx.setShadow(offset: .zero, blur: 0, color: nil)
    if curseur {
        ctx.setFillColor(accent)
        ctx.fill(CGRect(x: finX + 10, y: finY - taille * 0.12, width: 6, height: taille * 0.78))
    }
}

// Écriture vidéo
let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: reel-machine <spec.json> <sortie.mp4>"); exit(1) }
let spec = try JSONDecoder().decode(Spec.self, from: Data(contentsOf: URL(fileURLWithPath: args[1])))
let fps = spec.fps ?? 30
let cps = spec.cps ?? 15
let sortie = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: sortie)

let writer = try AVAssetWriter(outputURL: sortie, fileType: .mp4)
let entree = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: L, AVVideoHeightKey: H,
    // Qualité haute (01/10/2026, « rendu haute qualité et fluide ») : profil High, débit 25 Mbit/s,
    // une image clé par seconde, couleurs marquées BT.709 comme les rushes du téléphone.
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: Int((spec.debit ?? 25) * 1_000_000),
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
        AVVideoExpectedSourceFrameRateKey: fps,
        AVVideoMaxKeyFrameIntervalKey: fps,
    ],
    AVVideoColorPropertiesKey: [
        AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
        AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
        AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
    ],
])
entree.expectsMediaDataInRealTime = false
let adaptateur = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: entree, sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA),
    kCVPixelBufferWidthKey as String: L, kCVPixelBufferHeightKey as String: H,
])
writer.add(entree)
writer.startWriting()
writer.startSession(atSourceTime: .zero)
let ci = CIContext(options: [.useSoftwareRenderer: false])
let espaceRGB = CGColorSpaceCreateDeviceRGB()

var image = 0
func emettre(_ dessin: (CGContext, CVPixelBuffer) -> Void) {
    guard let pool = adaptateur.pixelBufferPool else { return }
    var tampon: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &tampon)
    guard let tampon else { return }
    CVPixelBufferLockBaseAddress(tampon, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(tampon), width: L, height: H, bitsPerComponent: 8,
                        bytesPerRow: CVPixelBufferGetBytesPerRow(tampon), space: espaceRGB,
                        bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
    dessin(ctx, tampon)
    CVPixelBufferUnlockBaseAddress(tampon, [])
    while !entree.isReadyForMoreMediaData { usleep(2000) }
    adaptateur.append(tampon, withPresentationTime: CMTime(value: CMTimeValue(image), timescale: CMTimeScale(fps)))
    image += 1
}

/// Image vidéo redressée et recadrée en remplissage sur 1080 × 1920.
func cadrer(_ px: CVPixelBuffer, _ transform: CGAffineTransform) -> CIImage {
    var im = CIImage(cvPixelBuffer: px)
    if !transform.isIdentity {
        // Même correction que montage.swift : l'origine CIImage est en bas à gauche, la rotation
        // de l'asset arrive donc inversée.
        let angle = atan2(transform.b, transform.a)
        im = im.transformed(by: CGAffineTransform(rotationAngle: -angle))
        im = im.transformed(by: CGAffineTransform(translationX: -im.extent.origin.x, y: -im.extent.origin.y))
    }
    let e = max(CGFloat(L) / im.extent.width, CGFloat(H) / im.extent.height)
    // Réduction Lanczos plutôt qu'une simple mise à l'échelle : 4K → 1080 sans perdre le piqué.
    im = im.applyingFilter("CILanczosScaleTransform", parameters: [kCIInputScaleKey: e, kCIInputAspectRatioKey: 1])
    return im.transformed(by: CGAffineTransform(translationX: (CGFloat(L) - im.extent.width) / 2, y: (CGFloat(H) - im.extent.height) / 2))
}

// Fondus enchaînés (28/09/2026, retour de Soumia : « trop rapide, transitions trop violentes »).
// Chaque plan chevauche le suivant de `fondu` secondes : pendant ce temps l'image du plan suivant
// apparaît en transparence par-dessus la précédente, et le texte de la séquence sortante s'efface.
let fondu = spec.fondu ?? 0.7
// Vitesse de lecture des plans (28/09/2026, « moins accéléré ») : 0.8 = ralenti de 20 %.
let vitesse = spec.vitesse ?? 1

struct Clip { let seq: Int; let fichier: String?; let fond: String?; let debut: Double; let duree: Double }
var clips: [Clip] = []
for (i, s) in spec.sequences.enumerated() {
    if let f = s.carton { clips.append(Clip(seq: i, fichier: nil, fond: f, debut: 0, duree: s.duree ?? 3)) }
    for p in s.plans ?? [] { clips.append(Clip(seq: i, fichier: p.fichier, fond: nil, debut: p.debut ?? 0, duree: p.duree)) }
}
var departs: [Double] = []
var acc = 0.0
for c in clips { departs.append(acc); acc += c.duree - fondu }
let total = acc + fondu
var debutSeq: [Int: Double] = [:]
for (k, c) in clips.enumerated() where debutSeq[c.seq] == nil { debutSeq[c.seq] = departs[k] }

/// Lit un plan à des instants croissants, en rééchantillonnant ses ~24 i/s vers la sortie.
final class Lecteur {
    let sortie: AVAssetReaderTrackOutput; let lecteur: AVAssetReader; let transform: CGAffineTransform
    var courant: CMSampleBuffer?; var prochain: CMSampleBuffer?; let debut: Double
    init?(_ c: Clip) {
        let asset = AVURLAsset(url: URL(fileURLWithPath: c.fichier!))
        guard let piste = asset.tracks(withMediaType: .video).first, let r = try? AVAssetReader(asset: asset) else { return nil }
        sortie = AVAssetReaderTrackOutput(track: piste, outputSettings: [
            kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)])
        r.timeRange = CMTimeRange(start: CMTime(seconds: c.debut, preferredTimescale: 600),
                                  duration: CMTime(seconds: c.duree * vitesse + 0.5, preferredTimescale: 600))
        r.add(sortie); r.startReading(); lecteur = r
        transform = piste.preferredTransform; debut = c.debut
        courant = sortie.copyNextSampleBuffer(); prochain = sortie.copyNextSampleBuffer()
    }
    func image(_ local: Double) -> CIImage? {
        let tt = debut + local * vitesse
        while let p = prochain, CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(p)) <= tt + 0.001 {
            courant = p; prochain = sortie.copyNextSampleBuffer()
        }
        guard let c = courant, let px = CMSampleBufferGetImageBuffer(c) else { return nil }
        return cadrer(px, transform)
    }
}
var lecteurs: [Int: Lecteur] = [:]
func imageClip(_ k: Int, _ local: Double) -> CIImage? {
    let c = clips[k]
    if let f = c.fond {
        let rgb = COULEURS[f] ?? COULEURS["sable"]!
        return CIImage(color: CIColor(red: rgb.0 / 255, green: rgb.1 / 255, blue: rgb.2 / 255))
            .cropped(to: CGRect(x: 0, y: 0, width: L, height: H))
    }
    if lecteurs[k] == nil { lecteurs[k] = Lecteur(c) }
    return lecteurs[k]?.image(local)
}

func etat(_ s: Int, _ T: Double) -> (Int, Bool) {
    let seq = spec.sequences[s]
    let nbCar = seq.lignes.joined(separator: "\n").count
    let t = T - debutSeq[s]!
    let attente = s == 0 ? 0.4 : fondu + 0.15  // la frappe commence une fois le fondu terminé
    let n = max(0, min(nbCar, Int(((t - attente) * cps).rounded(.down))))
    return (n, n < nbCar || Int(t * 2) % 2 == 0)
}
func texte(_ ctx: CGContext, _ s: Int, _ T: Double, alpha: CGFloat) {
    let seq = spec.sequences[s]
    let (n, cur) = etat(s, T)
    ctx.saveGState(); ctx.setAlpha(alpha)
    dessinerTexte(ctx, seq: seq, n: n, curseur: cur, surCarton: seq.carton != nil)
    if seq.carton != nil {
        ctx.textPosition = CGPoint(x: 90, y: 130)
        CTLineDraw(ligneCT("@LEVOYAGEDESEMOTIONS", CTFontCreateCopyWithAttributes(mono, 20, nil, nil), couleur("charcoal", 0.6), kern: 4.5), ctx)
    }
    ctx.restoreGState()
}

let nbImages = Int((total * Double(fps)).rounded())
for f in 0..<nbImages {
    let T = Double(f) / Double(fps)
    let actifs = clips.indices.filter { departs[$0] <= T && T < departs[$0] + clips[$0].duree }
    guard let b = actifs.last, var im = imageClip(b, T - departs[b]) else { continue }
    var p: CGFloat = 1, a: Int? = nil
    if actifs.count > 1, let premier = actifs.first, let imA = imageClip(premier, T - departs[premier]) {
        a = premier
        p = CGFloat(min(1, (T - departs[b]) / fondu))
        p = p * p * (3 - 2 * p)  // démarrage et arrivée en douceur
        let transparente = im.applyingFilter("CIColorMatrix", parameters: ["inputAVector": CIVector(x: 0, y: 0, z: 0, w: p)])
        im = transparente.composited(over: imA)
    }
    let image = im
    emettre { ctx, tampon in
        CVPixelBufferUnlockBaseAddress(tampon, [])
        ci.render(image, to: tampon, bounds: CGRect(x: 0, y: 0, width: L, height: H), colorSpace: espaceRGB)
        CVPixelBufferLockBaseAddress(tampon, [])
        if let a, clips[a].seq != clips[b].seq {
            texte(ctx, clips[a].seq, T, alpha: 1 - p)
            texte(ctx, clips[b].seq, T, alpha: p)
        } else {
            texte(ctx, clips[b].seq, T, alpha: 1)
        }
    }
    // On libère les plans terminés.
    for k in lecteurs.keys where departs[k] + clips[k].duree <= T { lecteurs[k]?.lecteur.cancelReading(); lecteurs[k] = nil }
}

entree.markAsFinished()
let attente = DispatchSemaphore(value: 0)
writer.finishWriting { attente.signal() }
attente.wait()
print("→ \(sortie.path) — \(String(format: "%.1f", Double(image) / Double(fps))) s, \(L)×\(H), sans son")
