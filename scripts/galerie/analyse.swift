// Analyse d'un lot de photos pour la galerie Sans filtre (13/09/2026).
//
// Tout se passe sur le Mac, avec le framework Vision d'Apple : aucune photo ne sort de la machine.
// Pour chaque image, une ligne JSON sur la sortie standard :
//   { "fichier", "visages", "silhouettes", "utilitaire", "note", "lat", "lon", "date", "empreinte" }
//
// - visages / silhouettes : personnes détectées (même minuscules au loin). Validé le 12/09/2026 sur
//   les 289 premières photos : aucune personne reconnaissable manquée en pleine résolution.
// - utilitaire : Apple classe l'image comme capture d'écran, ticket, document… (pas une photo).
// - note : note esthétique d'Apple, de -1 à 1 (flou, raté, sombre → négatif).
// - lat / lon / date : lus dans les métadonnées de l'image si présents.
// - empreinte : signature visuelle en base64, pour repérer les quasi-doublons (rafales).
//
// Compilation : swiftc -O scripts/galerie/analyse.swift -o scripts/galerie/analyse
// Usage       : scripts/galerie/analyse fichier1.jpg fichier2.heic … > analyse.jsonl
import Foundation
import ImageIO
import Vision

func metadonnees(_ src: CGImageSource) -> (Double?, Double?, String?) {
  guard let props = CGImageSourceCopyPropertiesAtIndex(src, 0, nil) as? [CFString: Any] else { return (nil, nil, nil) }
  var lat: Double?, lon: Double?, date: String?
  if let gps = props[kCGImagePropertyGPSDictionary] as? [CFString: Any],
     let la = gps[kCGImagePropertyGPSLatitude] as? Double, let lo = gps[kCGImagePropertyGPSLongitude] as? Double {
    lat = (gps[kCGImagePropertyGPSLatitudeRef] as? String) == "S" ? -la : la
    lon = (gps[kCGImagePropertyGPSLongitudeRef] as? String) == "W" ? -lo : lo
  }
  if let exif = props[kCGImagePropertyExifDictionary] as? [CFString: Any] {
    date = exif[kCGImagePropertyExifDateTimeOriginal] as? String
  }
  return (lat, lon, date)
}

let encodeur = JSONSerialization.self
for chemin in CommandLine.arguments.dropFirst() {
  var ligne: [String: Any] = ["fichier": chemin]
  guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: chemin) as CFURL, nil) else {
    ligne["erreur"] = "illisible"
    print(String(data: try! encodeur.data(withJSONObject: ligne), encoding: .utf8)!)
    continue
  }
  // Vignette de 1024 px, orientation appliquée : assez fin pour les silhouettes lointaines, bien
  // plus rapide que la pleine résolution.
  let options: [CFString: Any] = [
    kCGImageSourceCreateThumbnailFromImageAlways: true,
    kCGImageSourceThumbnailMaxPixelSize: 1024,
    kCGImageSourceCreateThumbnailWithTransform: true,
  ]
  guard let image = CGImageSourceCreateThumbnailAtIndex(src, 0, options as CFDictionary) else {
    ligne["erreur"] = "illisible"
    print(String(data: try! encodeur.data(withJSONObject: ligne), encoding: .utf8)!)
    continue
  }
  let (lat, lon, date) = metadonnees(src)
  if let lat { ligne["lat"] = lat }
  if let lon { ligne["lon"] = lon }
  if let date { ligne["date"] = date }

  let visages = VNDetectFaceRectanglesRequest()
  let silhouettes = VNDetectHumanRectanglesRequest()
  silhouettes.upperBodyOnly = false
  let esthetique = VNCalculateImageAestheticsScoresRequest()
  let empreinte = VNGenerateImageFeaturePrintRequest()
  do {
    try VNImageRequestHandler(cgImage: image).perform([visages, silhouettes, esthetique, empreinte])
  } catch {
    ligne["erreur"] = "analyse"
  }
  ligne["visages"] = visages.results?.count ?? 0
  ligne["silhouettes"] = (silhouettes.results ?? []).filter { $0.confidence > 0.5 }.count
  if let e = esthetique.results?.first {
    ligne["utilitaire"] = e.isUtility
    ligne["note"] = Double(e.overallScore)
  }
  if let fp = empreinte.results?.first {
    ligne["empreinte"] = fp.data.base64EncodedString()
    ligne["empreinte_type"] = fp.elementType.rawValue
    ligne["empreinte_n"] = fp.elementCount
  }
  print(String(data: try! encodeur.data(withJSONObject: ligne), encoding: .utf8)!)
}
