// src/components/ImageUploader.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');

  const handleUpload = async () => {
    if (!image) return alert('Please select an image');

    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', 'your_unsigned_preset'); // 🔄 Replace this
    formData.append('cloud_name', 'your_cloud_name'); // 🔄 Replace this

    setUploading(true);

    try {
      const res = await axios.post('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', formData);
      setUrl(res.data.secure_url);
      console.log('✅ Image URL:', res.data.secure_url);
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {url && (
        <div>
          <p>Image uploaded:</p>
          <img src={url} alt="Uploaded" style={{ width: '200px' }} />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
