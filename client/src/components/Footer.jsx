import React from 'react'
import logo from "/logo_rectangle.jpg";

export default function Footer() {
    return (<>
        <div className="footer" id='footer'>

            <div className="footer-container">
                
                <div className="social-box">
                    <img src={logo} style={{height:"55px", border:"1px solid white"}} className="logo"/>
                    <div className="social-media">
                        <a href="https://www.facebook.com/neep.org" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-facebook"></i>
                        </a>
                        <a href="https://twitter.com/neep_org" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-twitter-x"></i>
                        </a>
                        <a href="https://www.linkedin.com/company/neep-org/" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-linkedin"></i>
                        </a>
                    </div>
                </div>

                <div className="contactus">
                    <div className="heading">Contact Us</div>
                    <div href="tel:+918929676776">
                        <i className="bi bi-telephone-fill"></i>
                        <span>+91 8929676776</span>
                    </div>
                    <div href="tel:+918929676776">
                        <i className="bi bi-telephone-fill"></i>
                        <span>+91 8929676776</span>
                    </div>
                    <div href="mailto:sharma.aakash1012@gmail.com">
                        <i className="bi bi-envelope-at-fill"></i>
                        <span>sharma.aakash1012@gmail.com</span>
                    </div>
                </div>

                <div className="findus">
                    <div className="heading">Find Us</div>
                    <a href="">
                        <p>1390 Market Street,
                            Suite 200 #2067
                            San Francisco, CA 94102
                            United States
                        </p>
                    </a>
                </div>

            </div>

            <hr />
            <span>© 2025 NEEP. All rights reserved.</span>
        </div>

    </>)
}
