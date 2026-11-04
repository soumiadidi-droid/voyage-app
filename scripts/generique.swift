// Générique animé « vlog de la semaine » (04/11/2026) — dessins au trait qui se tracent, lignes qui
// frémissent comme un dessin animé fait main, titre manuscrit. Création originale pour Soumia.
//
// Compilation :  swiftc -O scripts/generique.swift -o scripts/generique
// Usage       :  scripts/generique <dossier_sortie> "vlog" "de la semaine" "24 — 29 octobre"
// Sortie      :  images PNG 1080 × 1920 numérotées (30 i/s, 3,2 s) + liste.json de segments
//                prêts à coller en tête d'une spec de scripts/montage.
import Foundation
import CoreGraphics
import CoreText
import ImageIO
import UniformTypeIdentifiers

let a = CommandLine.arguments
let dossier = a[1]
let titre1 = a.count > 2 ? a[2] : "vlog"
let titre2 = a.count > 3 ? a[3] : "de la semaine"
let sousTitre = a.count > 4 ? a[4] : ""
try? FileManager.default.createDirectory(atPath: dossier, withIntermediateDirectories: true)

let W = 1080.0, H = 1920.0, FPS = 30, IMAGES = 96
let creme = CGColor(red: 0.953, green: 0.929, blue: 0.886, alpha: 1)
let encre = CGColor(red: 0.17, green: 0.14, blue: 0.13, alpha: 1)
let terracotta = CGColor(red: 0.71, green: 0.37, blue: 0.26, alpha: 1)
let sauge = CGColor(red: 0.42, green: 0.53, blue: 0.40, alpha: 1)

// Bruit déterministe : le trait « bout » toutes les 3 images, toujours de la même façon.
func bruit(_ i: Int, _ k: Int, _ graine: Int) -> Double {
    var x = UInt64(truncatingIfNeeded: i &* 73856093 ^ k &* 19349663 ^ graine &* 83492791)
    x ^= x >> 13; x &*= 0x5bd1e995; x ^= x >> 15
    return Double(x % 1000) / 1000.0 - 0.5
}

struct Dessin { let points: [CGPoint]; let couleur: CGColor; let debut: Double; let fin: Double; let epaisseur: Double }

func cercle(_ c: CGPoint, _ r: Double, n: Int = 48) -> [CGPoint] {
    (0...n).map { k in let t = Double(k) / Double(n) * 2 * .pi - .pi / 2
        return CGPoint(x: c.x + r * cos(t), y: c.y + r * sin(t)) }
}
func segment(_ p: CGPoint, _ q: CGPoint, n: Int = 10) -> [CGPoint] {
    (0...n).map { k in let t = Double(k) / Double(n); return CGPoint(x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t) }
}
func vague(_ x0: Double, _ x1: Double, _ y: Double, _ amp: Double, _ periodes: Double) -> [CGPoint] {
    (0...80).map { k in let t = Double(k) / 80; return CGPoint(x: x0 + (x1 - x0) * t, y: y + amp * sin(t * periodes * 2 * .pi)) }
}
func coeur(_ c: CGPoint, _ s: Double) -> [CGPoint] {
    (0...60).map { k in let t = Double(k) / 60 * 2 * .pi
        let x = 16 * pow(sin(t), 3), y = 13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t)
        return CGPoint(x: c.x + x * s, y: c.y + y * s) }
}
func etincelle(_ c: CGPoint, _ r: Double) -> [[CGPoint]] {
    [segment(CGPoint(x: c.x, y: c.y - r), CGPoint(x: c.x, y: c.y + r)), segment(CGPoint(x: c.x - r, y: c.y), CGPoint(x: c.x + r, y: c.y))]
}

// Composition (origine en bas à gauche). Soleil en haut à droite, vague en bas, tasse, cœur, étincelles.
var dessins: [Dessin] = []
let soleil = CGPoint(x: 800, y: 1560)
dessins.append(Dessin(points: cercle(soleil, 70), couleur: terracotta, debut: 0.0, fin: 0.45, epaisseur: 9))
for k in 0..<8 {
    let ang = Double(k) / 8 * 2 * .pi
    let p = CGPoint(x: soleil.x + 100 * cos(ang), y: soleil.y + 100 * sin(ang))
    let q = CGPoint(x: soleil.x + 140 * cos(ang), y: soleil.y + 140 * sin(ang))
    dessins.append(Dessin(points: segment(p, q), couleur: terracotta, debut: 0.35 + Double(k) * 0.03, fin: 0.55 + Double(k) * 0.03, epaisseur: 9))
}
dessins.append(Dessin(points: vague(140, 940, 430, 26, 3), couleur: sauge, debut: 0.15, fin: 0.75, epaisseur: 10))
dessins.append(Dessin(points: vague(220, 860, 365, 20, 2.5), couleur: sauge, debut: 0.30, fin: 0.85, epaisseur: 8))
// Tasse : corps, anse, vapeur
let tasse = CGPoint(x: 230, y: 1500)
dessins.append(Dessin(points: [CGPoint(x: tasse.x - 70, y: tasse.y + 50), CGPoint(x: tasse.x - 60, y: tasse.y - 50),
                               CGPoint(x: tasse.x + 60, y: tasse.y - 50), CGPoint(x: tasse.x + 70, y: tasse.y + 50),
                               CGPoint(x: tasse.x - 70, y: tasse.y + 50)].flatMap { [$0] }, couleur: encre, debut: 0.2, fin: 0.6, epaisseur: 8))
dessins.append(Dessin(points: cercle(CGPoint(x: tasse.x + 88, y: tasse.y + 5), 26, n: 24).prefix(13).map { $0 }, couleur: encre, debut: 0.5, fin: 0.7, epaisseur: 8))
for k in 0..<2 {
    let x = tasse.x - 22 + Double(k) * 44
    let fumee = (0...30).map { j -> CGPoint in let t = Double(j) / 30; return CGPoint(x: x + 10 * sin(t * 2 * .pi), y: tasse.y + 75 + t * 70) }
    dessins.append(Dessin(points: fumee, couleur: encre, debut: 0.65 + Double(k) * 0.08, fin: 0.9 + Double(k) * 0.08, epaisseur: 6))
}
dessins.append(Dessin(points: coeur(CGPoint(x: 880, y: 640), 3.2), couleur: terracotta, debut: 0.9, fin: 1.25, epaisseur: 8))
for (c, r, t0) in [(CGPoint(x: 150, y: 620), 28.0, 1.0), (CGPoint(x: 950, y: 1150), 22.0, 1.1), (CGPoint(x: 560, y: 1700), 18.0, 1.2)] {
    for (j, pts) in etincelle(c, r).enumerated() {
        dessins.append(Dessin(points: pts, couleur: encre, debut: t0 + Double(j) * 0.05, fin: t0 + 0.15 + Double(j) * 0.05, epaisseur: 6))
    }
}

func police(_ nom: String, _ taille: Double) -> CTFont { CTFontCreateWithName(nom as CFString, taille, nil) }
func ligneTexte(_ s: String, _ f: CTFont, _ c: CGColor) -> CTLine {
    let attrs: [NSAttributedString.Key: Any] = [NSAttributedString.Key(kCTFontAttributeName as String): f,
                                                 NSAttributedString.Key(kCTForegroundColorAttributeName as String): c]
    return CTLineCreateWithAttributedString(NSAttributedString(string: s, attributes: attrs))
}
func centrer(_ l: CTLine, y: Double, ctx: CGContext, dx: Double = 0, dy: Double = 0, echelle: Double = 1, rot: Double = 0) {
    let w = CTLineGetTypographicBounds(l, nil, nil, nil)
    ctx.saveGState()
    ctx.translateBy(x: W / 2 + dx, y: y + dy)
    ctx.rotate(by: rot)
    ctx.scaleBy(x: echelle, y: echelle)
    ctx.textPosition = CGPoint(x: -w / 2, y: 0)
    CTLineDraw(l, ctx)
    ctx.restoreGState()
}
func rebond(_ t: Double) -> Double { // 0 → 1 avec un léger dépassement
    if t <= 0 { return 0 }; if t >= 1 { return 1 }
    return 1 + 1.6 * pow(t - 1, 3) + 0.6 * pow(t - 1, 2)
}

var segments: [[String: Any]] = []
for i in 0..<IMAGES {
    let t = Double(i) / Double(FPS)
    let cadre = i / 3 // le trait bout à 10 i/s, comme une animation dessinée
    let ctx = CGContext(data: nil, width: Int(W), height: Int(H), bitsPerComponent: 8, bytesPerRow: 0,
                        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.setFillColor(creme); ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
    ctx.setLineCap(.round); ctx.setLineJoin(.round)
    for (n, d) in dessins.enumerated() {
        let p = min(1, max(0, (t - d.debut) / (d.fin - d.debut)))
        if p <= 0 { continue }
        let k = max(2, Int(Double(d.points.count) * p))
        ctx.setStrokeColor(d.couleur); ctx.setLineWidth(d.epaisseur)
        ctx.beginPath()
        for (j, pt) in d.points.prefix(k).enumerated() {
            let q = CGPoint(x: pt.x + 3.5 * bruit(cadre, j, n), y: pt.y + 3.5 * bruit(cadre, j, n + 97))
            j == 0 ? ctx.move(to: q) : ctx.addLine(to: q)
        }
        ctx.strokePath()
    }
    // Titre : « vlog » qui rebondit, puis « de la semaine », puis les dates
    let f1 = police("BradleyHandITCTT-Bold", 250), f2 = police("BradleyHandITCTT-Bold", 104), f3 = police("AvenirNext-Medium", 40)
    let gig = 4 * bruit(cadre, 1, 7), rot = 0.012 * bruit(cadre, 2, 9)
    let e1 = rebond((t - 0.55) / 0.45)
    if e1 > 0 { centrer(ligneTexte(titre1, f1, encre), y: 1010, ctx: ctx, dx: gig, dy: gig, echelle: e1, rot: rot - 0.05) }
    let e2 = rebond((t - 0.95) / 0.4)
    if e2 > 0 { centrer(ligneTexte(titre2, f2, terracotta), y: 860, ctx: ctx, dx: -gig, dy: gig, echelle: e2, rot: -rot) }
    if !sousTitre.isEmpty && t > 1.5 {
        let alpha = min(1, (t - 1.5) / 0.3)
        centrer(ligneTexte(sousTitre, f3, encre.copy(alpha: alpha)!), y: 760, ctx: ctx)
    }
    let chemin = String(format: "%@/g%03d.png", dossier, i)
    let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: chemin) as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, ctx.makeImage()!, nil); CGImageDestinationFinalize(dest)
    segments.append(["type": "image", "fichier": chemin, "duree": 1.0 / Double(FPS)])
}
let json = try! JSONSerialization.data(withJSONObject: segments, options: [.prettyPrinted])
try! json.write(to: URL(fileURLWithPath: dossier + "/liste.json"))
print("\(IMAGES) images → \(dossier)")
