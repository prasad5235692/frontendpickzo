import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleUpload = async () => {
    if (!image) return alert('Please select an image');

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'ecommerce_preset'); // ✅ Your unsigned preset

    setUploading(true);
    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dnqjvt7yb/image/upload', // ✅ Your Cloudinary cloud name
        formData
      );
      setUploadedUrl(res.data.secure_url); // ✅ Corrected from setUrl → setUploadedUrl
      console.log('✅ Image URL:', res.data.secure_url);
    } catch (err) {
      console.error('❌ Upload failed:', err);
      alert("Upload failed: " + err?.response?.data?.error?.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <br />
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {uploadedUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>✅ Image uploaded successfully!</p>
          <img src={uploadedUrl} alt="Uploaded" width="300" style={{ borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
