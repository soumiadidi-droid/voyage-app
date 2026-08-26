export const metadata = {
  title: "Carnets — Le Voyage des Émotions",
};

export default function CarnetsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <h1
        className="font-extrabold mb-6"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)" }}
      >
        Carnets
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>Page en cours de rédaction.</p>
    </div>
  );
}
