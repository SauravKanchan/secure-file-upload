import React, { useState } from 'react';
import { Upload, File, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  generateAESKey,
  encryptFile,
  exportKey,
  arrayBufferToBase64,
} from '../lib/crypto';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const generateSafeFileName = (originalName: string): string => {
    // Remove special characters and spaces, keep extension
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    const safeName = originalName
      .split('.')[0]
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    return `${timestamp}_${safeName}.${extension}`;
  };

  const handleUpload = async () => {
    if (!file || !publicKey) {
      setError('Please select a file and enter your public key');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Generate AES key and encrypt file
      const aesKey = await generateAESKey();
      const { encryptedData, iv } = await encryptFile(file, aesKey);
      
      // Export and encode the AES key
      const exportedKey = await exportKey(aesKey);
      const encodedKey = arrayBufferToBase64(exportedKey);
      const encodedIv = arrayBufferToBase64(iv.buffer);

      // Generate a safe file name for storage
      const safeFileName = generateSafeFileName(file.name);

      // Upload encrypted file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('encrypted-files')
        .upload(safeFileName, encryptedData);

      if (uploadError) throw uploadError;
      console.log("user",await supabase.auth.getUser());

      // Store file metadata in database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          file_name: file.name,
          storage_path: safeFileName,
          encrypted_key: encodedKey,
          iv: encodedIv,
          public_key: publicKey,
          original_size: file.size,
          mime_type: file.type,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      setFile(null);
      setPublicKey('');
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">Any file format supported</p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center">
          <File className="w-5 h-5 mr-2 text-gray-500" />
          <span className="text-sm text-gray-700 truncate">{file.name}</span>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Public Key
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your public key"
            disabled={uploading}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || !publicKey || uploading}
        className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
}