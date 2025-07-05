import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Teacher() {
    return (<>

        <Navbar />

        <div className="main-content">

            {/* Teacher Details */}
            <div className="student-details">
                <h1>Teacher details</h1>
                <div className="container">
                    <span>Name : Aakash</span><br />
                    <span>email : admin@school.com</span><br />
                    <span>role : Teacher</span>
                </div>
            </div>

            {/* Batches with Attendance Calendar */}
            <div className="batches-container">
                <h1>Batches</h1>
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-6 col-lg-5">
                            <div className="card batch-card mb-3">
                                <h5 className="card-title">bhjbxzbjhbc</h5>
                            </div>

                        </div>

                    </div>
                </div>
            </div>




        </div>

        <Footer />

    </>)
}
