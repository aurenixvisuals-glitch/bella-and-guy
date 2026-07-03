"use client";

export default function TermsPage() {
  const terms = [
    "Appointments are subject to availability and confirmation.",
    "Please be available at the scheduled time.",
    "A 10-minute grace period is allowed. After that, a ₹10 per minute waiting charge will apply.",
    "Delays exceeding 30 minutes may result in cancellation without a refund.",
    "Last-minute cancellations or no-shows may incur up to 100% cancellation charges.",
    "Additional services requested during the appointment will be charged separately.",
    "Clients must inform us of any allergies, skin conditions, or medical concerns before the service.",
    "Please provide a clean, safe, and suitable space for the service.",
    "Parking, society entry, or valet charges (if applicable) are payable by the client.",
    "Full payment must be made immediately after the service unless prepaid.",
    "Misconduct, abusive behaviour, or an unsafe environment may lead to immediate termination of the service without a refund.",
    "By booking our services, you agree to these Terms & Conditions.",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

        .tc-page {
          min-height: 100vh;
          background: #fafaf8;
          font-family: 'Inter', sans-serif;
        }

        .tc-header {
          background: #080808;
          padding: 64px 24px 56px;
          text-align: center;
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }

        .tc-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 400;
          color: rgba(201,168,76,0.7);
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .tc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 300;
          color: #fff;
          letter-spacing: 0.01em;
          line-height: 1.15;
          margin-bottom: 14px;
        }

        .tc-title span { color: #C9A84C; font-style: italic; }

        .tc-subtitle {
          font-size: 13.5px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
        }

        .tc-body {
          max-width: 760px;
          margin: 0 auto;
          padding: 56px 24px 80px;
        }

        .tc-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tc-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(201,168,76,0.2);
        }

        .tc-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .tc-item {
          display: flex;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          align-items: flex-start;
        }

        .tc-item:last-child { border-bottom: none; }

        .tc-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #C9A84C;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .tc-text {
          font-size: 14.5px;
          color: #3a3a3a;
          line-height: 1.7;
        }

        .tc-highlight {
          color: #C9A84C;
          font-weight: 600;
        }

        .tc-footer-note {
          margin-top: 48px;
          padding: 20px 24px;
          background: rgba(201,168,76,0.05);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 10px;
          font-size: 13px;
          color: #666;
          line-height: 1.65;
          text-align: center;
        }

        .tc-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 36px;
          color: #C9A84C;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .tc-back:hover { opacity: 0.7; }

        @media (max-width: 480px) {
          .tc-header { padding: 48px 16px 40px; }
          .tc-body { padding: 36px 16px 56px; }
          .tc-text { font-size: 13.5px; }
        }
      `}</style>

      <div className="tc-page">
        {/* Header */}
        <div className="tc-header">
          <div className="tc-brand">Bella &amp; Guy · Home Beauty Service</div>
          <h1 className="tc-title">Terms &amp; <span>Conditions</span></h1>
          <p className="tc-subtitle">Home Salon Services · Wave City, Ghaziabad</p>
        </div>

        {/* Body */}
        <div className="tc-body">
          <div className="tc-section-label">Service Guidelines</div>

          <div className="tc-list">
            {terms.map((term, i) => (
              <div key={i} className="tc-item">
                <div className="tc-num">{i + 1}</div>
                <p className="tc-text">{term}</p>
              </div>
            ))}
          </div>

          <div className="tc-footer-note">
            For any questions or concerns, contact us on WhatsApp at{" "}
            <a href="https://wa.me/919625928495" style={{ color: "#C9A84C", fontWeight: 600, textDecoration: "none" }}>
              +91 96259 28495
            </a>
            {" "}· Mon–Sun, 9:00 AM – 8:00 PM
          </div>

          <a href="/" className="tc-back">← Back to Home</a>
        </div>
      </div>
    </>
  );
}
