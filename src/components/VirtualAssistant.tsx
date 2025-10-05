import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Volume2, VolumeX, Send, Mic, MicOff, AlertTriangle, MapPin, 
  Clock, Shield, Phone, Navigation, Home, Cloud, Thermometer,
  Users, MessageCircle, Lightbulb, HelpCircle, Star, Settings,
  ExternalLink, Calendar, Waves, Zap, Heart, ChevronDown, ChevronUp,
  Key, Loader2, CheckCircle, XCircle, Brain, Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useLanguage } from './hooks/useLanguage';
import { ComprehensiveAlertSystem } from './ComprehensiveAlertSystem';
import { ArkoAvatar } from './ArkoAvatar';
import { JellyfishMessage, JellyfishShield, JellyfishWaves } from './ColorfulIcons';
import { toast } from 'sonner@2.0.3';
import { aiService, type AIResponse, type ChatContext } from '../services/aiService';

interface FloodAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timeToImpact: number;
  waterLevel: string;
  instructions: string[];
  evacuationCenter?: string;
  avoidAreas?: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'arko' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  source?: 'openai' | 'fallback' | 'emergency';
  actions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
}

interface VirtualAssistantProps {
  isVisible: boolean;
  onClose: () => void;
  alert?: FloodAlert;
  userLocation?: { latitude: number; longitude: number };
  weatherData?: any;
}

const QUICK_ACTIONS = [
  {
    id: 'weather',
    label: 'Weather Now',
    icon: <Cloud size={16} />,
    description: 'Current conditions & flood risk'
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: <Phone size={16} />,
    description: 'Quick access to help'
  },
  {
    id: 'evacuation',
    label: 'Evacuate',
    icon: <Navigation size={16} />,
    description: 'Find evacuation route'
  },
  {
    id: 'safety',
    label: 'Safety Tips',
    icon: <Shield size={16} />,
    description: 'Flood safety guidance'
  }
];

export function VirtualAssistant({ isVisible, onClose, alert, userLocation, weatherData }: VirtualAssistantProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showComprehensiveAlert, setShowComprehensiveAlert] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [aiStatus, setAiStatus] = useState(aiService.getStatus());
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { t } = useLanguage();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isVisible && chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'arko',
        content: alert ? 
          getAlertWelcomeMessage(alert) : 
          getWelcomeMessage(),
        timestamp: new Date(),
        confidence: 1.0,
        source: 'fallback',
        actions: alert ? getAlertActions(alert) : getWelcomeActions()
      };
      
      setChatMessages([welcomeMessage]);
      
      // Speak welcome message
      if (voiceEnabled) {
        setTimeout(() => speakMessage(welcomeMessage.content), 500);
      }
    }
  }, [isVisible, alert]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };
    }
  }, []);

  // Update AI status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAiStatus(aiService.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getWelcomeMessage = () => {
    const timeGreeting = getTimeBasedGreeting();
    const aiStatusText = aiStatus.enabled ? 
      "I'm powered by advanced AI and can have dynamic conversations with you!" : 
      "I'm using my local knowledge base to help you. For enhanced AI conversations, you can add an OpenAI API key.";
    
    return `${timeGreeting}! I'm Arko, your real-time AI flood monitoring assistant! 🌊✨\n\n${aiStatusText}\n\nI can help you with:\n🌤️ Live weather analysis\n🚨 Emergency assistance\n🗺️ Evacuation guidance\n🛡️ Safety education\n💬 Natural conversations\n\nHow can I help you today?`;
  };

  const getAlertWelcomeMessage = (alert: FloodAlert) => {
    const severityMessages = {
      low: `I have a weather update for you! Light rain detected in ${alert.location}. Conditions are manageable but I'm keeping watch. How can I help you stay prepared?`,
      medium: `⚠️ Important weather alert! Moderate flooding expected in ${alert.location} with water levels reaching ${alert.waterLevel}. You have approximately ${alert.timeToImpact} minutes to prepare. What assistance do you need?`,
      high: `🚨 URGENT flood alert for ${alert.location}! Heavy flooding incoming with water levels: ${alert.waterLevel}. You have ${alert.timeToImpact} minutes to reach safety. I can help you evacuate safely!`,
      critical: `🆘 EMERGENCY! Critical flood situation in ${alert.location}! Extreme water levels: ${alert.waterLevel}. Only ${alert.timeToImpact} minutes remaining! I'll help you evacuate immediately!`
    };
    
    return severityMessages[alert.severity];
  };

  const getAlertActions = (alert: FloodAlert) => [
    { label: 'Get Evacuation Route', action: 'evacuation_route' },
    { label: 'Call Emergency', action: 'emergency_contacts' },
    { label: 'Safety Instructions', action: 'safety_guide' }
  ];

  const getWelcomeActions = () => [
    { label: 'Current Weather', action: 'weather' },
    { label: 'Emergency Help', action: 'emergency' },
    { label: 'How can you help?', action: 'capabilities' }
  ];

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Good late night';
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const speakMessage = async (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    setIsSpeaking(true);
    const cleanText = text.replace(/[🌊✨🚨⚠️🆘💧🏠📱🎒👥📻✅🌤️🗺️📚💬🔔🌍📞🧭🤖🛡️📊👋]/g, '').replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
    // Find a pleasant voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('female') ||
      voice.lang.includes('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user' as const, content: text }];
    setConversationHistory(newHistory);

    try {
      // Create chat context
      const context: ChatContext = {
        userLocation,
        weatherData,
        floodAlerts: alert,
        emergencyLevel: alert?.severity || 'normal',
        userName: undefined, // Could be enhanced with user profile
        conversationHistory: newHistory
      };

      // Get AI response
      const aiResponse: AIResponse = await aiService.generateResponse(text, context);
      
      // Create Arko message
      const arkoMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'arko',
        content: aiResponse.content,
        timestamp: new Date(),
        confidence: aiResponse.confidence,
        source: aiResponse.source,
        actions: aiResponse.actionSuggestions?.map(action => ({
          label: action.label,
          action: action.action,
          icon: action.icon
        }))
      };

      setChatMessages(prev => [...prev, arkoMessage]);
      
      // Update conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant' as const, content: aiResponse.content }]);
      
      // Speak response if voice is enabled
      if (voiceEnabled) {
        setTimeout(() => speakMessage(aiResponse.content), 300);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'arko',
        content: "I'm having trouble connecting right now, but I'm still here to help! You can ask me about weather, emergencies, evacuation routes, or safety tips. What would you like to know?",
        timestamp: new Date(),
        confidence: 0.5,
        source: 'fallback'
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (actionId: string) => {
    const actionMap: Record<string, string> = {
      weather: "What's the current weather and flood risk?",
      emergency: "I need emergency help",
      evacuation: "Help me find evacuation routes",
      safety: "Give me flood safety tips",
      capabilities: "What can you help me with?",
      emergency_contacts: "Show me emergency contact numbers",
      evacuation_route: "I need evacuation directions now",
      safety_guide: "Give me immediate safety instructions"
    };

    const message = actionMap[actionId] || actionId;
    await handleSendMessage(message);
  };

  const startVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('🎤 Listening... Speak now!');
      } catch (error) {
        toast.error('Could not start voice recognition');
      }
    }
  };

  const handleApiKeySetup = () => {
    if (tempApiKey.trim()) {
      aiService.setApiKey(tempApiKey.trim());
      setAiStatus(aiService.getStatus());
      setShowApiKeySetup(false);
      setTempApiKey('');
      toast.success('🧠 AI Enhanced! I can now have dynamic conversations with you.');
      
      // Add system message about AI upgrade
      const upgradeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '🚀 AI Enhanced! I now have access to advanced language models for more dynamic and helpful conversations. Feel free to ask me anything!',
        timestamp: new Date(),
        confidence: 1.0,
        source: 'openai'
      };
      
      setChatMessages(prev => [...prev, upgradeMessage]);
    }
  };

  // Get Arko's current state for avatar
  const getArkoState = () => {
    if (alert) {
      return alert.severity;
    } else if (isSpeaking) {
      return 'speaking';
    } else if (isTyping) {
      return 'thinking';
    } else {
      return 'idle';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100, y: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed bottom-6 right-6 z-50 ${isExpanded ? 'max-w-lg' : 'max-w-sm'} transition-all duration-300`}
        >
          <Card className="glass-card shadow-2xl border-2 border-blue-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      y: isSpeaking ? [-2, 2, -2] : 0,
                      rotate: isTyping ? [-1, 1, -1] : 0,
                      scale: alert ? [1, 1.05, 1] : 1
                    }}
                    transition={{
                      duration: isSpeaking ? 0.8 : isTyping ? 1.2 : 2,
                      repeat: (isSpeaking || isTyping || alert) ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <ArkoAvatar 
                      size={48} 
                      animated={true}
                      severity={getArkoState()}
                      isSpeaking={isSpeaking}
                      showSparkles={true}
                    />
                  </motion.div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="m-0 font-bold text-lg">✨ ARKO</h3>
                      {aiStatus.enabled ? (
                        <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                          <Brain size={10} />
                          AI
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">
                          LOCAL
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-90 m-0">
                      {isTyping ? '💭 Thinking...' : 
                       isSpeaking ? '🗣️ Speaking...' :
                       alert ? '🚨 Alert Mode' : 
                       aiStatus.enabled ? '🧠 AI Ready' : '💬 Knowledge Base'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!aiStatus.enabled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowApiKeySetup(!showApiKeySetup)}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                      title="Enable AI"
                    >
                      <Brain size={16} />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    title={isExpanded ? 'Minimize' : 'Expand'}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* API Key Setup */}
            {showApiKeySetup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800 m-0">Enable Advanced AI</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Add your OpenAI API key for dynamic AI conversations and enhanced responses.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleApiKeySetup}
                      disabled={!tempApiKey.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Enable
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your API key is stored locally and only used for AI responses.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Chat Area */}
            <div className={`${isExpanded ? 'h-80' : 'h-60'} overflow-y-auto p-4 bg-white/50 backdrop-blur-sm transition-all duration-300`}>
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white rounded-l-xl rounded-tr-xl' 
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl'
                        : 'bg-white border border-gray-200 rounded-r-xl rounded-tl-xl shadow-sm'
                    } p-3`}>
                      <div className="flex items-start gap-2">
                        {message.type === 'arko' && (
                          <JellyfishMessage size={16} animated color="text-blue-500" />
                        )}
                        {message.type === 'system' && (
                          <Sparkles size={16} className="text-white mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm m-0 whitespace-pre-line ${
                            message.type === 'user' ? 'text-white' : 
                            message.type === 'system' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {message.content}
                          </p>
                          
                          {/* Confidence and Source Indicator */}
                          {message.confidence !== undefined && message.type === 'arko' && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${
                                message.source === 'openai' ? 'border-green-300 text-green-600' :
                                message.source === 'emergency' ? 'border-red-300 text-red-600' :
                                'border-gray-300 text-gray-600'
                              }`}>
                                {message.source === 'openai' ? '🧠 AI' : 
                                 message.source === 'emergency' ? '🚨 Emergency' : '💾 Local'}
                              </Badge>
                              {message.confidence < 0.7 && (
                                <span className="text-xs text-yellow-600">⚠️ Uncertain</span>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuickAction(action.action)}
                                  className="h-7 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                                >
                                  {action.icon && <span className="mr-1">{action.icon}</span>}
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`text-xs mt-1 opacity-70 ${
                        message.type === 'user' ? 'text-blue-100' : 
                        message.type === 'system' ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-r-xl rounded-tl-xl shadow-sm p-3">
                      <div className="flex items-center gap-2">
                        <ArkoAvatar size={20} animated={true} severity="thinking" />
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-blue-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-blue-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-blue-400 rounded-full"
                          />
                        </div>
                        {aiStatus.enabled && (
                          <span className="text-xs text-blue-500">AI thinking...</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Quick Actions */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="p-3 bg-gray-50 border-t border-gray-200"
              >
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction(action.id)}
                      className="flex items-center gap-2 h-8 text-xs hover:bg-blue-50 border-blue-200"
                      title={action.description}
                    >
                      {action.icon}
                      <span className="truncate">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={aiStatus.enabled ? "Ask me anything about flood safety..." : "Ask me about weather, safety, or emergencies..."}
                    className="pr-12 text-sm border-blue-200 focus:border-blue-400"
                    disabled={isTyping}
                  />
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={startVoiceRecognition}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 ${
                      isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-blue-500'
                    }`}
                    title="Voice input"
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-3"
                >
                  {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center gap-2">
                <span>💡 Try voice input, ask about weather, or request emergency help</span>
                {aiStatus.enabled && <Badge className="bg-green-100 text-green-700 text-xs">AI Enhanced</Badge>}
              </div>
            </div>
          </Card>

          {/* Comprehensive Alert System */}
          {userLocation && (
            <ComprehensiveAlertSystem
              isVisible={showComprehensiveAlert}
              onClose={() => setShowComprehensiveAlert(false)}
              userLocation={userLocation}
              weatherData={weatherData}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}