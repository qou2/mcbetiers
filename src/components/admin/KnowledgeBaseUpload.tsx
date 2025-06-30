
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Shield, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { useToast } from '@/hooks/use-toast';

export function KnowledgeBaseUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Check if it's a PDF or TXT file
    const isValidFile = file.type === 'application/pdf' || 
                       file.type === 'text/plain' ||
                       file.name.toLowerCase().endsWith('.pdf') ||
                       file.name.toLowerCase().endsWith('.txt');

    if (!isValidFile) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or TXT file only.",
        variant: "destructive"
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    console.log('Valid file detected, showing password modal');
    setPendingFile(file);
    setPassword('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!pendingFile) {
      console.log('No pending file');
      setPasswordError('No file selected');
      return;
    }

    if (!password.trim()) {
      setPasswordError('Please enter the access code');
      return;
    }

    console.log('Validating password...');
    
    // Check password
    if (password.trim() !== '$$nullknox911$$') {
      console.log('Invalid password provided');
      setPasswordError('Invalid access code. Please try again.');
      return;
    }

    console.log('Password validated successfully');

    try {
      setIsUploading(true);
      setShowPasswordModal(false);
      setPasswordError('');
      console.log('Uploading file:', pendingFile.name);
      
      // Handle both PDF and TXT files
      if (pendingFile.type === 'application/pdf' || pendingFile.name.toLowerCase().endsWith('.pdf')) {
        await knowledgeBaseService.uploadPDF(pendingFile);
      } else {
        await knowledgeBaseService.uploadTXT(pendingFile);
      }
      
      toast({
        title: "Success",
        description: `${pendingFile.name} uploaded successfully. The AI assistant is ready to answer questions about it.`,
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setPassword('');
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelPassword = () => {
    console.log('Password modal cancelled');
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePasswordSubmit();
    }
  };

  const kbInfo = knowledgeBaseService.getKnowledgeBaseInfo();

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Knowledge Base Upload</h3>
          </div>
          
          <p className="text-gray-400 mb-6">
            Upload PDF or TXT documents to enhance the AI assistant's knowledge base. Only authorized personnel can upload files.
          </p>

          {kbInfo && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Currently loaded: {kbInfo.filename}</span>
              </div>
              <p className="text-green-300 text-sm mt-1">
                Uploaded on {kbInfo.uploadDate.toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full"
            >
              <Shield className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Knowledge Base (PDF/TXT)'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelPassword();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handlePasswordSubmit}>
                <div className="text-center mb-6">
                  <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">Secure Upload</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Authentication required to upload {pendingFile?.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'TXT'} file
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    File: {pendingFile?.name}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter access code..."
                      className={`w-full ${passwordError ? 'border-red-500' : ''}`}
                      autoFocus
                    />
                    {passwordError && (
                      <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      onClick={handleCancelPassword}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!password.trim()}
                    >
                      Authenticate
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
