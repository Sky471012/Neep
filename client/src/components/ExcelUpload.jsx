import React, { useState } from "react";
import axios from "axios";

const ExcelUpload = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return setMessage("Please select a file.");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("authToken");

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("Upload successful!");
            console.log(res.data);
        } catch (err) {
            setMessage("Upload failed.");
            console.error(err.response?.data || err.message);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <h3>Upload Student Excel File</h3>
            <form onSubmit={handleUpload}>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <button type="submit" className="btn btn-primary mt-2">Upload</button>
            </form>
            <a
                href="/sample-student-template.xlsx"
                className="btn btn-outline-secondary mt-3"
                download
            >
                Download Sample Template
            </a>
            {message && <p className="mt-2">{message}</p>}
        </div>
    );
};

export default ExcelUpload;