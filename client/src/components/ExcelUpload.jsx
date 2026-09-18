import { apiFetch } from "../api";
import React, { useState } from "react";
import axios from "axios";

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); // Clear message when a new file is selected
    setIsError(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type.includes("spreadsheet") ||
        droppedFile.name.endsWith(".xls") ||
        droppedFile.name.endsWith(".xlsx"))
    ) {
      setFile(droppedFile);
      setMessage("");
      setIsError(false);
    } else {
      setIsError(true);
      setMessage("Please drop a valid Excel file.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setIsError(true);
      return setMessage("Please select a file.");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsError(false);
      setMessage(res.data.message);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Upload failed.";
      setIsError(true);
      setMessage(errorMessage);
      console.error(err.response?.data || err.message);
    }
  };

  const handleClear = () => {
    setFile(null);
    setMessage("");
    setIsError(false);
  };

  return (
    <>
      <a
        href="/sample-student-template.xlsx"
        className="btn btn-warning mb-3 text-light p-1 ps-3 pe-3"
        style={{
          margin: "0 auto",
          display: "block",
          width: "max-content",
        }}
        download
      >
        Download Sample Template
      </a>

      <form onSubmit={handleUpload}>
        <div
          className={`border border-secondary border-3 rounded text-center p-4 mb-3 ${
            dragging ? "border-primary bg-light" : "border-secondary"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{backgroundColor: "#eef7ffff"}}
        >
          <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
            <i className="bi bi-upload fs-1 text-secondary"></i>
            <p className="mb-1 text-secondary">Click or drag & drop Excel file here</p>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {file && (
            <div className="mt-2 text-success flex justify-content-center align-items-center gap-2">
              <div style={{maxWidth:"250px"}}>{file.name}</div>
              <button
                type="button"
                className="btn btn-sm text-danger"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-success w-100">
          Upload
        </button>
      </form>

      {message && (
        <div
          className={`mt-2 text-center ${isError ? "text-danger" : "text-success"}`}
          style={{ whiteSpace: "pre-line" }}
        >
          {message}
        </div>
      )}
    </>
  );
};

export default ExcelUpload;