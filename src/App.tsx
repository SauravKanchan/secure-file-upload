import React from 'react';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { KeyGeneration } from './components/KeyGeneration';
import { Authentication } from './components/Authentication';
import { Shield as ShieldLock } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ShieldLock className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure File Storage
          </h1>
          <p className="text-lg text-gray-600">
            Upload and store your files securely with end-to-end encryption
          </p>
        </div>

        <div className="space-y-12">
          <Authentication />

          <KeyGeneration />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <FileUpload />
            </div>
            <div>
              <FileList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
