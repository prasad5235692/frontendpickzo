// src/pages/ImageUploadPage.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaCopy, FaImage } from 'react-icons/fa';

const CLOUD_NAME = 'dnqjvt7yb';
const UPLOAD_PRESET = 'ecommerce_preset';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setError('');
    setUploadedUrl('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!image) { setError('Please select an image first.'); return; }
    const formData = new FormData();
    formData.append('file', image);
    formData.append('upload_preset', UPLOAD_PRESET);
    setUploading(true);
    setError('');
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      setUploadedUrl(res.data.secure_url);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(uploadedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setUploadedUrl('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] pt-[186px] sm:pt-[148px] pb-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaCloudUploadAlt className="text-[#2874F0]" size={22} />
            Image Uploader
          </h1>
          <p className="text-sm text-gray-500 mt-1">Upload images to Cloudinary for product listings</p>
        </div>

        <div className="bg-white rounded shadow-md overflow-hidden">
          {/* Drop zone */}
          <div className="p-6">
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center py-10 transition ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/40'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 rounded object-contain" />
              ) : (
                <>
                  <FaImage size={40} className="text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-600">Drag & drop an image here</p>
                  <p className="text-xs text-gray-400 mt-1">or <span className="text-blue-600 underline">browse files</span></p>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP — max 10MB</p>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />

            {image && (
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="text-xs text-gray-600 truncate max-w-[70%]">
                  <span className="font-semibold">{image.name}</span>{' '}
                  <span className="text-gray-400">({(image.size / 1024).toFixed(0)} KB)</span>
                </p>
                <button onClick={handleReset} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <FaTimesCircle size={12} /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center gap-2">
              <FaTimesCircle size={13} /> {error}
            </div>
          )}

          {/* Upload button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleUpload}
              disabled={uploading || !image}
              className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded text-white text-sm transition ${
                uploading || !image
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#FB641B] hover:bg-orange-600 active:scale-95'
              }`}
            >
              <FaCloudUploadAlt size={16} />
              {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
            </button>
          </div>

          {/* Upload progress shimmer */}
          {uploading && (
            <div className="h-1 bg-gray-100 mx-6 mb-6 rounded overflow-hidden">
              <div className="h-full bg-[#2874F0] animate-pulse rounded" style={{ width: '70%' }} />
            </div>
          )}

          {/* Success result */}
          {uploadedUrl && (
            <div className="mx-6 mb-6 p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-3">
                <FaCheckCircle size={14} /> Image uploaded successfully!
              </div>
              <img
                src={uploadedUrl}
                alt="Uploaded"
                className="w-full max-h-52 object-contain rounded border border-gray-200 mb-3 bg-white"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={uploadedUrl}
                  className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-2 text-gray-600 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs bg-[#2874F0] hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded transition whitespace-nowrap"
                >
                  <FaCopy size={11} /> {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
