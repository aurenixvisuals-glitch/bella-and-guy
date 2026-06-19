export default function GoogleMap() {
  return (
    <section style={{ background: "#FAF7F0", padding: "80px 24px" }}>
      <div className="max-w-6xl mx-auto">

        <h2 className="text-4xl font-bold text-center text-black mb-10">
          Find Us
        </h2>

        <div className="rounded-2xl overflow-hidden shadow-xl">

          <iframe
            src="https://www.google.com/maps?q=Wave+Galleria+Shopping+Complex+Wave+City+Ghaziabad&output=embed"
            width="100%"
            height="450"
            loading="lazy"
            style={{ border: 0 }}
          />

        </div>

      </div>
    </section>
  );
}