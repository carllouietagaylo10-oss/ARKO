import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Mail,
  Phone,
  Waves,
  Zap
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ArkoLogo } from './ArkoLogo';
import { toast } from 'sonner@2.0.3';

interface LoginInterfaceProps {
  onLogin: (userData: any) => void;
}

export const LoginInterface: React.FC<LoginInterfaceProps> = ({ onLogin }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'emergency'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    emergencyCode: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (loginMethod === 'phone') {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^(\+639|09)\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid Philippine phone number';
      }
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
    } else if (loginMethod === 'emergency') {
      if (!formData.emergencyCode) {
        newErrors.emergencyCode = 'Emergency access code is required';
      }
      if (!formData.name) {
        newErrors.name = 'Name is required for emergency access';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        phone: formData.phone,
        loginMethod,
        isEmergencyAccess: loginMethod === 'emergency',
        loginTime: new Date().toISOString(),
        location: 'Valencia City, Bukidnon'
      };

      toast.success('Welcome to Arko!', {
        description: `Successfully logged in as ${userData.name}`
      });

      onLogin(userData);
    } catch (error) {
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccess = () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      email: '',
      phone: '',
      loginMethod: 'guest',
      isGuest: true,
      loginTime: new Date().toISOString(),
      location: 'Valencia City, Bukidnon'
    };

    toast.success('Quick Access Enabled', {
      description: 'You can access basic flood monitoring features as a guest.'
    });

    onLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Elements - Professional */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-300/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-gradient-to-br from-cyan-200/20 to-blue-300/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-12"></div>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md mx-auto relative z-10 backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]">
        <div className="p-8 md:p-10">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg transition-all duration-300 hover:bg-white/70 hover:shadow-xl">
                <ArkoLogo size={80} animated={true} />
                {/* Verified Badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 tracking-tight">
              Welcome to Arko
            </h1>
            <p className="text-slate-600 mb-4 text-sm md:text-base">
              Valencia City Flood Alert System
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-white/60 backdrop-blur-sm border-blue-200 text-blue-700 text-xs font-medium px-3 py-1">
                <MapPin className="w-3 h-3 mr-1" />
                Valencia Active
              </Badge>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-medium px-3 py-1">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                ONLINE
              </Badge>
            </div>
          </div>

          {/* Login Method Selector - Professional Tabs */}
          <div className="mb-6">
            <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 mb-4 border border-white/30">
              <Button
                size="sm"
                variant={loginMethod === 'email' ? 'default' : 'ghost'}
                onClick={() => setLoginMethod('email')}
                className={`flex-1 h-10 text-sm font-medium transition-all duration-200 rounded-lg ${
                  loginMethod === 'email' 
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
                }`}
                aria-label="Sign in with email"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                size="sm"
                variant={loginMethod === 'phone' ? 'default' : 'ghost'}
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 h-10 text-sm font-medium transition-all duration-200 rounded-lg ${
                  loginMethod === 'phone' 
                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
                }`}
                aria-label="Sign in with SMS"
              >
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </Button>
              <Button
                size="sm"
                variant={loginMethod === 'emergency' ? 'default' : 'ghost'}
                onClick={() => setLoginMethod('emergency')}
                className={`flex-1 h-10 text-sm font-medium transition-all duration-200 rounded-lg ${
                  loginMethod === 'emergency' 
                    ? 'bg-red-500 text-white shadow-md hover:bg-red-600' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
                }`}
                aria-label="Emergency access"
              >
                <Shield className="w-4 h-4 mr-2" />
                Emergency
              </Button>
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-5 mb-6">
            {loginMethod === 'email' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 h-12 bg-white/60 backdrop-blur-sm border-white/50 rounded-xl transition-all duration-200 focus:bg-white/80 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 ${
                        errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-200/50' : ''
                      }`}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      onClick={() => toast.info('Password reset is currently unavailable in demo mode')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-12 h-12 bg-white/60 backdrop-blur-sm border-white/50 rounded-xl transition-all duration-200 focus:bg-white/80 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 ${
                        errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-200/50' : ''
                      }`}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-100/60 rounded-lg transition-all duration-150"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-white/60 backdrop-blur-sm border-white/50 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                    Remember me
                  </Label>
                </div>
              </>
            )}

            {loginMethod === 'phone' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-10 h-12 bg-white/60 backdrop-blur-sm border-white/50 rounded-xl transition-all duration-200 focus:bg-white/80 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 ${
                        errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200/50' : ''
                      }`}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
                  <div className="relative group">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+639123456789 or 09123456789"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`pl-10 h-12 bg-white/60 backdrop-blur-sm border-white/50 rounded-xl transition-all duration-200 focus:bg-white/80 focus:border-blue-300 focus:ring-2 focus:ring-blue-200/50 ${
                        errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-200/50' : ''
                      }`}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p id="phone-error" className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 bg-blue-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <Smartphone className="w-3 h-3 text-blue-500" />
                    SMS alerts will be sent to this number
                  </p>
                </div>
              </>
            )}

            {loginMethod === 'emergency' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Your Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors duration-200 group-focus-within:text-red-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-10 h-12 bg-white/60 backdrop-blur-sm border-white/50 rounded-xl transition-all duration-200 focus:bg-white/80 focus:border-red-300 focus:ring-2 focus:ring-red-200/50 ${
                        errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200/50' : ''
                      }`}
                      aria-describedby={errors.name ? "emergency-name-error" : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p id="emergency-name-error" className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyCode" className="text-sm font-medium text-slate-700">Emergency Access Code</Label>
                  <div className="relative group">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 transition-colors duration-200" />
                    <Input
                      id="emergencyCode"
                      type="text"
                      placeholder="EMERGENCY-CODE-XXXX"
                      value={formData.emergencyCode}
                      onChange={(e) => handleInputChange('emergencyCode', e.target.value.toUpperCase())}
                      className={`pl-10 h-12 font-mono bg-white/60 backdrop-blur-sm border-white/50 rounded-xl transition-all duration-200 focus:bg-white/80 focus:border-red-300 focus:ring-2 focus:ring-red-200/50 ${
                        errors.emergencyCode ? 'border-red-400 focus:border-red-400 focus:ring-red-200/50' : ''
                      }`}
                      maxLength={20}
                      aria-describedby={errors.emergencyCode ? "emergency-code-error" : "emergency-code-help"}
                    />
                  </div>
                  {errors.emergencyCode && (
                    <p id="emergency-code-error" className="text-red-500 text-xs flex items-center gap-1 bg-red-50 px-3 py-1 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      {errors.emergencyCode}
                    </p>
                  )}
                  <div id="emergency-code-help" className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200/50">
                    <p className="text-xs text-red-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-500" />
                      Emergency codes are provided by CDRRMO Valencia during active flood situations
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Primary Sign In Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full h-14 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl focus:ring-4 active:scale-[0.98] ${
              loginMethod === 'emergency'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-200'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-200'
            } mb-4`}
            aria-label={`${loginMethod === 'email' ? 'Sign in with email' : loginMethod === 'phone' ? 'Verify and access with SMS' : 'Emergency access'}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connecting to Arko...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {loginMethod === 'emergency' ? (
                  <Shield className="w-5 h-5" />
                ) : (
                  <ArkoLogo size={28} animated={true} />
                )}
                <span>
                  {loginMethod === 'email' ? 'Sign In' : 
                   loginMethod === 'phone' ? 'Verify & Access' : 
                   'Emergency Access'}
                </span>
              </div>
            )}
          </Button>

          {/* Quick Access Section */}
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-3 font-medium">Need immediate flood info?</p>
            <Button
              variant="outline"
              onClick={handleQuickAccess}
              className="w-full h-12 bg-white/60 backdrop-blur-sm border-white/50 hover:bg-white/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.01] focus:ring-2 focus:ring-emerald-200"
              aria-label="Quick access for immediate flood monitoring without account"
            >
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-emerald-600" />
                <span>Live Monitoring</span>
              </div>
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-white/30">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <Waves className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Team Astrobyte • Valencia City CDRRMO</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <Phone className="w-3 h-3 text-emerald-500" />
                <span>Emergency Hotline: (088) 000-1111</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  LIVE MONITORING
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};