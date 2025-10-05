import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Brain, Key, CheckCircle, XCircle, Eye, EyeOff, 
  Settings, Zap, Shield, AlertTriangle, RefreshCw, 
  ExternalLink, HelpCircle, Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { aiService } from '../services/aiService';

interface AIConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIConfigPanel({ isOpen, onClose }: AIConfigPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [aiStatus, setAiStatus] = useState(aiService.getStatus());
  const [savedKey, setSavedKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const status = aiService.getStatus();
      setAiStatus(status);
      
      // Load existing key (masked)
      const existingKey = localStorage.getItem('openai_api_key') || '';
      if (existingKey) {
        setSavedKey(existingKey);
        setApiKey(existingKey);
      }
    }
  }, [isOpen]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast.error('Invalid API key format. OpenAI keys start with "sk-"');
      return;
    }

    if (apiKey.length < 20) {
      toast.error('API key appears to be too short');
      return;
    }

    aiService.setApiKey(apiKey.trim());
    setAiStatus(aiService.getStatus());
    setSavedKey(apiKey.trim());
    
    toast.success('🧠 AI Enhanced! Advanced conversations are now available.');
  };

  const handleRemoveApiKey = () => {
    aiService.setApiKey('');
    setApiKey('');
    setSavedKey('');
    setAiStatus(aiService.getStatus());
    localStorage.removeItem('openai_api_key');
    
    toast.info('AI key removed. Using local knowledge base.');
  };

  const testConnection = async () => {
    if (!aiStatus.enabled) {
      toast.error('Please save a valid API key first');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Test with a simple query
      const testResponse = await aiService.generateResponse('Hello, this is a connection test', {
        conversationHistory: []
      });

      if (testResponse.source === 'openai') {
        toast.success('✅ AI connection successful!');
      } else {
        toast.warning('Connection test fell back to local responses');
      }
    } catch (error) {
      toast.error('❌ Connection test failed. Check your API key.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return key;
    return key.slice(0, 7) + '••••••••••' + key.slice(-4);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md mx-4"
          >
            <Card className="glass-card shadow-2xl border-2 border-blue-300 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Brain size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold m-0">AI Configuration</h2>
                      <p className="text-sm opacity-90 m-0">Enhance Arko with real-time AI</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Current Status */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Zap size={18} className="text-blue-600" />
                    Current Status
                  </h3>
                  
                  <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">AI Mode:</span>
                      <Badge className={`${
                        aiStatus.enabled 
                          ? 'bg-green-500 text-white' 
                          : 'bg-orange-500 text-white'
                      }`}>
                        {aiStatus.enabled ? (
                          <>
                            <Brain size={12} className="mr-1" />
                            Enhanced AI
                          </>
                        ) : (
                          <>
                            <Shield size={12} className="mr-1" />
                            Local Knowledge
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{aiStatus.enabled ? aiStatus.model : 'Local Responses'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="font-medium">
                          {aiStatus.hasApiKey ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle size={14} />
                              Configured
                            </span>
                          ) : (
                            <span className="text-orange-600 flex items-center gap-1">
                              <XCircle size={14} />
                              Not Set
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {aiStatus.enabled && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={testConnection}
                          disabled={isTestingConnection}
                          className="w-full"
                        >
                          {isTestingConnection ? (
                            <>
                              <RefreshCw size={14} className="mr-2 animate-spin" />
                              Testing Connection...
                            </>
                          ) : (
                            <>
                              <Zap size={14} className="mr-2" />
                              Test AI Connection
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* API Key Configuration */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Key size={18} className="text-blue-600" />
                    OpenAI API Configuration
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-key" className="text-sm font-medium text-gray-700">
                        API Key
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="api-key"
                          type={showApiKey ? 'text' : 'password'}
                          placeholder="sk-..."
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        >
                          {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      {savedKey && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current: {maskApiKey(savedKey)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveApiKey}
                        disabled={!apiKey.trim() || apiKey === savedKey}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Save & Enable AI
                      </Button>
                      
                      {savedKey && (
                        <Button
                          variant="outline"
                          onClick={handleRemoveApiKey}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-600" />
                    AI Enhancement Benefits
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Brain size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Dynamic Conversations</p>
                        <p className="text-xs text-blue-600">Natural, contextual responses that adapt to your specific situation</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Real-time Analysis</p>
                        <p className="text-xs text-green-600">Weather data integration for personalized flood risk assessment</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Enhanced Safety Guidance</p>
                        <p className="text-xs text-purple-600">Intelligent emergency assistance tailored to your location</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <HelpCircle size={18} className="text-blue-600" />
                    How to Get API Key
                  </h3>
                  
                  <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <div>
                        <span>Visit </span>
                        <a 
                          href="https://platform.openai.com/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          OpenAI Platform
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>Sign up or log in to your OpenAI account</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Create a new API key with GPT access</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      <span>Copy and paste your key above</span>
                    </div>
                  </div>
                </div>

                {/* Privacy Note */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Privacy & Security</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Your API key is stored locally on your device and only used to communicate with OpenAI. 
                        Arko processes your conversations through OpenAI's secure API to provide enhanced responses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}