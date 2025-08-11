import React from 'react'

export default function Regarding() {
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
                }

                .regarding-section {
                    min-height: 100vh;
                    padding: 80px 20px;
                    background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 25%, #ffffff 50%, #f1f5f9 75%, #e2e8f0 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    color: #1e293b;
                    position: relative;
                    overflow: hidden;
                }

                .regarding-section::before {
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

                .regarding-section::after {
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

                .regarding-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 2;
                }

                .regarding-header {
                    text-align: center;
                    margin-bottom: 4rem;
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
                    margin-bottom: 1.5rem;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }

                .section-badge:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
                }

                .section-badge::before {
                    content: '✦';
                    margin-right: 8px;
                    font-size: 0.875rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .main-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 3.5rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                    line-height: 1.3;
                    background: linear-gradient(135deg, #1e293b 0%, #475569 25%, #3b82f6 50%, #10b981 75%, #8b5cf6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    position: relative;
                }

                .main-title::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 4px;
                    background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
                    border-radius: 2px;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 3rem;
                }

                .combined-card {
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 28px;
                    padding: 4rem 3.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .combined-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                    background: linear-gradient(135deg, #3b82f6 0%, #10b981 33%, #8b5cf6 66%, #ec4899 100%);
                }

                .combined-card::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%),
                                radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.02) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 0;
                }

                .combined-card > * {
                    position: relative;
                    z-index: 1;
                }

                .welcome-section {
                    margin-bottom: 3.5rem;
                    padding-bottom: 3rem;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.1);
                    position: relative;
                }

                .welcome-section::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 2px;
                    background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
                    border-radius: 1px;
                }

                .welcome-text {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                    text-align: center;
                }

                .welcome-description {
                    font-size: 1.1rem;
                    color: #475569;
                    line-height: 1.7;
                    text-align: center;
                    margin-bottom: 0;
                }

                .info-sections {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 3rem;
                    margin-bottom: 3.5rem;
                }

                .info-section {
                    padding: 2rem 0;
                    border-left: 3px solid transparent;
                    padding-left: 2rem;
                    transition: all 0.3s ease;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%);
                    border-radius: 16px;
                    padding: 2rem;
                    border-left: 4px solid;
                    border-image: linear-gradient(135deg, #3b82f6 0%, #10b981 100%) 1;
                }

                .info-section:nth-child(2) {
                    border-image: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%) 1;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
                }

                .info-section:nth-child(3) {
                    border-image: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%) 1;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(236, 72, 153, 0.02) 100%);
                }

                .section-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                    position: relative;
                }

                .section-content {
                    font-size: 1rem;
                    color: #475569;
                    line-height: 1.7;
                    margin-bottom: 0;
                }

                .features-list {
                    list-style: none;
                    padding: 0;
                    margin: 1.5rem 0 0 0;
                }

                .features-list li {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 1.2rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.6);
                    border-radius: 12px;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    transition: all 0.3s ease;
                }

                .features-list li:hover {
                    transform: translateX(5px);
                    background: rgba(59, 130, 246, 0.05);
                    border-color: rgba(59, 130, 246, 0.2);
                }

                .features-list li::before {
                    content: '✨';
                    margin-right: 15px;
                    margin-top: 2px;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
                }

                .feature-title {
                    font-weight: 600;
                    color: #1e293b;
                    margin-right: 8px;
                    min-width: fit-content;
                }

                .feature-description {
                    color: #64748b;
                    line-height: 1.6;
                }

                .closing-section {
                    background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
                    border-radius: 20px;
                    padding: 2.5rem;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .closing-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
                    opacity: 0.8;
                }

                .closing-text {
                    font-size: 1.25rem;
                    font-weight: 500;
                    line-height: 1.6;
                    color: white;
                    margin: 0;
                    position: relative;
                    z-index: 1;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .regarding-section {
                        padding: 60px 15px;
                    }

                    .main-title {
                        font-size: 2.5rem;
                    }

                    .combined-card {
                        padding: 2.5rem 2rem;
                    }

                    .welcome-section {
                        margin-bottom: 2.5rem;
                        padding-bottom: 2rem;
                    }

                    .info-sections {
                        gap: 2rem;
                        margin-bottom: 2.5rem;
                    }

                    .info-section {
                        padding: 1.5rem;
                    }

                    .welcome-text {
                        font-size: 1.2rem;
                    }

                    .welcome-description {
                        font-size: 1rem;
                    }

                    .section-title {
                        font-size: 1.5rem;
                    }

                    .closing-section {
                        padding: 2rem;
                    }

                    .closing-text {
                        font-size: 1.1rem;
                    }

                    .features-list li {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .features-list li::before {
                        margin-bottom: 0.5rem;
                    }
                }

                /* Animation */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .combined-card {
                    animation: fadeInUp 0.8s ease forwards;
                }
            `}</style>

            <section className="regarding-section">
                <div className="regarding-container">
                    <div className="regarding-header">
                        <div className="section-badge">
                            About Our Institution
                        </div>
                        <h1 className="main-title">Regarding NEEP</h1>
                    </div>

                    <div className="content-grid">
                        <div className="combined-card">
                            <div className="welcome-section">
                                <p className="welcome-text">
                                    Welcome to NEEP, where educational pursuits are designed to inspire.
                                </p>
                                <p className="welcome-description">
                                    At NEEP, we are committed to fostering an engaging learning environment, moving beyond traditional methods to cultivate passion, energy, and creativity in education.
                                </p>
                            </div>

                            <div className="info-sections">
                                <div className="info-section">
                                    <h2 className="section-title">Our Organization</h2>
                                    <p className="section-content">
                                        Under the leadership of our founder, Mohan Verma, NEEP is focused on simplifying complex subjects and promoting practical application. Mohan's instructional approach emphasizes the development of skills applicable beyond academic assessments.
                                    </p>
                                </div>

                                <div className="info-section">
                                    <h2 className="section-title">Our Objective</h2>
                                    <p className="section-content">
                                        To facilitate the comprehensive development of young individuals throughout India. We offer high-quality education through innovative online courses, providing accessible learning experiences.
                                    </p>
                                </div>

                                <div className="info-section">
                                    <h2 className="section-title">Distinguishing Features</h2>
                                    <ul className="features-list">
                                        <li>
                                            <span className="feature-title">Interactive Learning:</span>
                                            <span className="feature-description">Courses are designed to be engaging and effective.</span>
                                        </li>
                                        <li>
                                            <span className="feature-title">Dynamic Instruction:</span>
                                            <span className="feature-description">We employ an energetic, relatable, and student-centered teaching methodology.</span>
                                        </li>
                                        <li>
                                            <span className="feature-title">Affordable Quality:</span>
                                            <span className="feature-description">We provide high-quality education at competitive prices.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="closing-section">
                                <p className="closing-text">
                                    We invite you to explore a novel approach to education. We look forward to mutual growth and success.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}