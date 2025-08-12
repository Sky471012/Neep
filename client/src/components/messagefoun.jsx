"use client"

const MessageFromFounder = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

        :root {
          --bs-blue: #0d6efd;
          --bs-indigo: #6610f2;
          --bs-purple: #6f42c1;
          --bs-pink: #d63384;
          --bs-red: #dc3545;
          --bs-orange: #fd7e14;
          --bs-yellow: #ffc107;
          --bs-green: #198754;
          --bs-teal: #20c997;
          --bs-cyan: #0dcaf0;
          --bs-black: #000;
          --bs-white: #fff;
          --bs-gray: #6c757d;
          --bs-gray-dark: #343a40;
          --bs-gray-100: #f8f9fa;
          --bs-gray-200: #e9ecef;
          --bs-gray-300: #dee2e6;
          --bs-gray-400: #ced4da;
          --bs-gray-500: #adb5bd;
          --bs-gray-600: #6c757d;
          --bs-gray-700: #495057;
          --bs-gray-800: #343a40;
          --bs-gray-900: #212529;
          --bs-primary: #0d6efd;
          --bs-secondary: #6c757d;
          --bs-success: #198754;
          --bs-info: #0dcaf0;
          --bs-warning: #ffc107;
          --bs-danger: #dc3545;
          --bs-light: #f8f9fa;
          --bs-dark: #212529;
          --bs-border-radius: 0.375rem;
          --bs-border-radius-lg: 0.5rem;
          --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }

        .founder-section {
          min-height: 600px;
          background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 25%, #ffffff 50%, #f1f5f9 75%, #e2e8f0 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1e293b;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .founder-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.02) 0%, transparent 50%);
          z-index: 1;
        }

        .founder-section::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(59, 130, 246, 0.01) 45deg, transparent 90deg, rgba(16, 185, 129, 0.01) 135deg, transparent 180deg, rgba(139, 92, 246, 0.01) 225deg, transparent 270deg, rgba(236, 72, 153, 0.01) 315deg, transparent 360deg);
          animation: rotate 60s linear infinite;
          z-index: 1;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .founder-container {
          padding: 30px 90px;
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
        }

        .founder-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
        }

        .message-block {
          padding-right: 1rem;          
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 50px;
          padding: 10px 25px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem!important;
          margin-top: 1.5rem!important;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          width: fit-content!important;
        }

        .section-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
        }

        .section-badge::before {
          content: '✦';
          font-size: 0.875rem;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .founder-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1;
          background: linear-gradient(135deg, #1e293b 0%, #475569 25%, #3b82f6 50%, #10b981 75%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .founder-heading::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 40%;
          width: 80px;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
          border-radius: 2px;
        }

        .founder-quote {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.2rem;
          font-style: italic;
          font-weight: 400;
          color: #64748b;
          margin-bottom: 1rem;
          line-height: 1.6;
          position: relative;
          padding: 1.5rem 2rem;
          background: rgba(245, 254, 251, 0.7);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .founder-quote::before {
          content: '"';
          position: absolute;
          left: 0.75rem;
          top: 0.25rem;
          font-size: 3rem;
          color: #3b82f6;
          font-family: 'Playfair Display', Georgia, serif;
          line-height: 1;
          opacity: 0.3;
        }

        .founder-quote::after {
          content: '"';
          position: absolute;
          right: 0.75rem;
          bottom: 0.25rem;
          font-size: 3rem;
          color: #10b981;
          font-family: 'Playfair Display', Georgia, serif;
          line-height: 1;
          opacity: 0.3;
        }

        .founder-message {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          line-height: 1.5;
          color: #475569;
          margin-bottom: 1rem;
          text-align: justify;
        }

        .founder-signature {
          background: rgba(245, 254, 251, 0.7);
          border-radius: 16px;
          padding: 12px 2rem;
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .founder-signature::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #8b5cf6 100%);
        }
        
        .founder-signature::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(135deg, #8b5cf6 0%, #10b981 50%, #3b82f6 100%);
        }

        .founder-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0px;
          letter-spacing: -0.025em;
        }

        .founder-designation {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .image-block {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .founder-image-container {
          position: relative;
          width: 80%;
        }

        .founder-image {
          width: 100%;
          border-radius: 20px;
          object-fit: cover;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 3px solid rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }

        .founder-image-container::before {
          content: '';
          position: absolute;
          top: -15px;
          left: -15px;
          right: -15px;
          bottom: -15px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(8, 101, 249, 0.15) 0%, rgba(16, 185, 129, 0.15) 50%, rgba(139, 92, 246, 0.15) 100%);
          z-index: -1;
          animation: pulse 3s ease-in-out infinite;
        }

        .founder-image-container::after {
          content: '';
          position: absolute;
          top: -30px;
          left: -30px;
          right: -30px;
          bottom: -30px;
          border-radius: 35px;
          background: linear-gradient(135deg, rgba(14, 94, 222, 0.08) 0%, rgba(16, 185, 129, 0.08) 50%, rgba(139, 92, 246, 0.08) 100%);
          z-index: -2;
          animation: pulse 3s ease-in-out infinite reverse;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0.4; }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .founder-content {
            gap: 4rem;
          }
          
          .founder-image-container {
            width: 320px;
            height: 320px;
          }
          
          .founder-heading {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 992px) {
          .founder-section {
            height: auto;
            min-height: 100vh;
            padding: 4rem 0;
          }
          
          .founder-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .message-block {
            padding-right: 0;
            order: 2;
          }

          .image-block {
            padding-left: 0;
            order: 1;
          }

          .founder-heading {
            font-size: 2.25rem;
          }

          .founder-quote {
            font-size: 1.125rem;
            padding: 1.25rem 1.5rem;
          }

          .founder-message {
            font-size: 0.95rem;
            text-align: left;
          }

          .founder-image-container {
            width: 280px;
            height: 280px;
          }
        }

        @media (max-width: 768px) {
          .founder-container {
            padding: 0 1rem;
          }
          
          .founder-section {
            padding: 2rem 0;
          }

          .founder-content {
            gap: 2rem;
          }

          .founder-heading {
            font-size: 2rem;
          }

          .founder-quote {
            font-size: 1rem;
            padding: 1rem 1.25rem;
          }

          .founder-quote::before,
          .founder-quote::after {
            font-size: 2.5rem;
          }

          .founder-message {
            font-size: 0.9rem;
          }

          .founder-image-container {
            width: 240px;
            height: 240px;
          }

          .founder-signature {
            padding: 1.5rem;
          }

          .founder-name {
            font-size: 1.25rem;
          }

          .founder-designation {
            font-size: 0.8rem;
          }
        }

        /* Entrance animations */
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .message-block {
          animation: fadeInLeft 0.8s ease forwards;
        }

        .image-block {
          animation: fadeInRight 0.8s ease forwards;
        }
      `}</style>

      <section className="founder-section">
        <div className="founder-container">
          <div className="founder-content">
            <div className="message-block">
              <div className="section-badge">
                Leadership Message
              </div>

              <h2 className="founder-heading">Words from the Founder</h2>

              <p className="founder-quote">
                Education is the most powerful weapon which you can use to change the world, and excellence is never an accident.
              </p>

              <p className="founder-message">
                I embarked on my educational journey in Economics and maths back in 2009, starting modestly with just 5 chairs in my home. Over the years, the exceptional results achieved by my students not only fueled my passion but also carved my path into the teaching profession.I hold a B.Com, M.com degree and an MA in Economics, complemented by a certification in GNIIT.
              </p>

              <div className="founder-signature">
                <div className="founder-name"> MOHAN VERMA</div>
                <div className="founder-designation">MENTOR-FOUNDER-DIRECTOR</div>
              </div>
            </div>

            <div className="image-block">
              <div className="founder-image-container">
                <img
                  src="/founderimage.png"
                  alt="MOHAN VERMA"
                  className="founder-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default MessageFromFounder