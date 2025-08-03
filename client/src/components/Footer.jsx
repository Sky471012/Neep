import React from 'react'
import logo from "/logo_rectangle.jpg";

export default function Footer() {
    return (<>
        <div className="footer" id='footer'>

            <div className="footer-container">

                <div className="social-box">
                    <img src={logo} style={{ height: "80px", border: "2px solid white" }} className="logo" />
                    <div className="social-media">
                        <a href="https://www.facebook.com/share/1B4w5KzHeQ/" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-facebook"></i>
                        </a>
                        <a href="https://www.instagram.com/neweraeducationpoint" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-instagram"></i>
                        </a>
                        <a href="https://youtube.com/@neweraeducationpoint?si=JAH4k1eY5NpVvgE9" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-youtube"></i>
                        </a>
                        <a href="https://www.linkedin.com/in/mohan-verma-13954813b/" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-linkedin"></i>
                        </a>
                    </div>
                </div>

                <div className="contactus">
                    <div className="heading">Contact Us</div>
                    <a href="tel:+919313214643">
                        <i className="bi bi-telephone-fill"></i>
                        <span>+91 9313214643</span>
                    </a>
                    <a href="tel:+919891214643">
                        <i className="bi bi-telephone-fill"></i>
                        <span>+91 9891214643</span>
                    </a>
                    <a href="mailto:pizzabhateja.com">
                        <i className="bi bi-envelope-at-fill"></i>
                        <span>neep.md@gmail.com</span>
                    </a>
                </div>

                <div className="findus">
                    <div className="heading">Find Us</div>
                    <a href="https://www.google.com/maps/place/NEW+ERA+EDUCATION+POINT/@28.595221,77.0978602,15z/data=!4m15!1m8!3m7!1s0x390d1b5bb76fcc85:0x1f90bc98be2bab0d!2sNEW+ERA+EDUCATION+POINT!8m2!3d28.5952199!4d77.0978611!10e5!16s%2Fg%2F11cmsgb6vj!3m5!1s0x390d1b5bb76fcc85:0x1f90bc98be2bab0d!8m2!3d28.5952199!4d77.0978611!16s%2Fg%2F11cmsgb6vj?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <p>
                            RZ- 625/1C,  First Floor, Near Raj Mandir Store And Above Raja Cycle, Indra Park, Palam Colony, New Delhi-110045.
                        </p>
                    </a>
                </div>

            </div>

            <hr />
            <span>© 2025 NEEP. All rights reserved.</span>
        </div>

    </>)
}
