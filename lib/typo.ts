// Espaces insécables de la typographie française (relecture du 11/09/2026) : sans elles, un "?" ou
// un ":" part seul en début de ligne ("Ton luxe ultime / ? Une adresse…"), et un guillemet fermant
// se retrouve orphelin sur téléphone.
export function insecables(texte: string): string {
  return texte.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");
}
