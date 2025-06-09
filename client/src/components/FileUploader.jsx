import React, { useState } from 'react';
import axios from 'axios';

function FileUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append('file', selectedFile);
  
    setUploadStatus('Uploading...');
  
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadStatus(`Uploading... ${percent}%`);
        }
      });
  
      if (response.data.success) {
        setUploadStatus(`Successfully processed ${response.data.transaction_data.length} transactions`);
        onUploadSuccess(response.data.transaction_data);
      } else {
        setUploadStatus('Error processing PDF');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('Upload failed');
    }
  };

  return (
    <div className="upload-container">
      <h1>Expense Tracker</h1>
      <p>Upload your bank statement PDF to extract and categorize transactions</p>

      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/337/337946.png"
          alt="PDF Icon"
          className="pdf-icon"
        />
        <h3>Drag & Drop PDF Here</h3>
        <p>or click to browse files</p>
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {selectedFile && (
        <div className="file-info">
          <p><strong>File:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={!selectedFile}
      >
        Upload PDF
      </button>

      {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
    </div>
  );
}

export default FileUploader;
