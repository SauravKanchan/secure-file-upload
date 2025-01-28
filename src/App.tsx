import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase'; // Ensure you have Supabase client setup
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { KeyGeneration } from './components/KeyGeneration';
import { Authentication } from './components/Authentication';
import { Shield as ShieldLock } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user?.id);
      setIsLoading(false);
    };
    checkUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loader border-t-4 border-b-4 border-indigo-600 rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Authentication />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ShieldLock className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure health record
          </h1>
          <p className="text-lg text-gray-600">
            Upload and store your health record securely with end-to-end encryption
          </p>
        </div>

        <div className="space-y-12">
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
