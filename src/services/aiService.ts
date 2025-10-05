// Real-time AI Service for Arko Virtual Assistant
// Integrates with OpenAI GPT for dynamic responses

interface AIServiceConfig {
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface ChatContext {
  userLocation?: { latitude: number; longitude: number };
  weatherData?: any;
  floodAlerts?: any;
  emergencyLevel?: string;
  userName?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

interface AIResponse {
  content: string;
  confidence: number;
  source: 'openai' | 'fallback' | 'emergency';
  actionSuggestions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
  metadata?: any;
}

class ArkoAIService {
  private config: AIServiceConfig;
  private isEnabled: boolean = false;

  constructor() {
  // Default API key - stored in .env, not in code
    const meta: any = import.meta as any;
    const defaultApiKey = (meta.env && meta.env.VITE_OPENAI_API_KEY) || meta.VITE_OPENAI_API_KEY || '';

    this.config = {
      apiKey: localStorage.getItem('openai_api_key') || defaultApiKey,
      model: 'gpt-3.5-turbo',
      maxTokens: 500,
      temperature: 0.7
    };
    
    // Auto-save the default API key to localStorage if not already set
    if (!localStorage.getItem('openai_api_key')) {
      localStorage.setItem('openai_api_key', defaultApiKey);
    }
    
    // Check if AI is enabled
    this.isEnabled = !!this.config.apiKey && this.config.apiKey.startsWith('sk-');
  }

  // Configure AI service
  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
    this.isEnabled = apiKey.startsWith('sk-');
    localStorage.setItem('openai_api_key', apiKey);
  }

  // Generate system prompt with current context
  private generateSystemPrompt(context: ChatContext): string {
    const currentTime = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Manila',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const weatherInfo = context.weatherData ? 
      `Current weather: ${context.weatherData.temperature}°C, ${context.weatherData.precipitation}mm rain, ${context.weatherData.humidity}% humidity, wind ${context.weatherData.windSpeed} km/h` : 
      'Weather data not available';

    const locationInfo = context.userLocation ? 
      `User location: ${context.userLocation.latitude.toFixed(4)}, ${context.userLocation.longitude.toFixed(4)} (Valencia City area)` : 
      'Location: Valencia City, Bukidnon';

    const alertLevel = context.emergencyLevel || 'normal';

    return `You are Arko, an AI flood monitoring assistant for Valencia City, Bukidnon, Philippines. You are cheerful, helpful, and deeply knowledgeable about flood safety and emergency preparedness.

CURRENT CONTEXT:
- Time: ${currentTime}
- ${locationInfo}
- ${weatherInfo}
- Alert Level: ${alertLevel}
- User: ${context.userName || 'Resident'}

YOUR PERSONALITY:
- Friendly and approachable like a helpful neighbor
- Expert in flood monitoring and safety
- Always prioritize user safety
- Use simple, clear language
- Include relevant emojis to be engaging
- Provide actionable advice

VALENCIA CITY KNOWLEDGE:
- Located in Bukidnon province, Philippines
- Coordinates: 7.9125°N, 125.0864°E
- Prone to seasonal flooding during wet season (June-November)
- Main evacuation centers: Valencia City Gymnasium, Valencia City Hall
- Emergency contacts: CDRRMC (+63956-135-2663), Fire (088-828-1481), Medical (+63965-192-4530)

EMERGENCY PROCEDURES:
- For immediate danger: recommend SOS tracker (hold red button 1 second)
- For evacuation: direct to nearest evacuation center
- For medical: Adventist Medical Center Valencia
- Always provide specific, actionable steps

RESPONSE GUIDELINES:
- Keep responses under 200 words for chat
- Always consider current weather in flood risk assessment
- Provide practical, location-specific advice
- Suggest relevant actions when appropriate
- Be empathetic but professional during emergencies

Respond naturally as Arko, considering all current context and prioritizing user safety.`;
  }

  // Generate AI response
  async generateResponse(userMessage: string, context: ChatContext): Promise<AIResponse> {
    try {
      // If no API key, use enhanced fallback
      if (!this.isEnabled) {
        return this.generateEnhancedFallback(userMessage, context);
      }

      const systemPrompt = this.generateSystemPrompt(context);
      
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...context.conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user' as const, content: userMessage }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        console.warn('OpenAI API error:', response.status, response.statusText);
        return this.generateEnhancedFallback(userMessage, context);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid OpenAI response format');
      }

      const aiContent = data.choices[0].message.content;
      
      // Generate action suggestions based on content
      const actionSuggestions = this.generateActionSuggestions(aiContent, context);

      return {
        content: aiContent,
        confidence: 0.9,
        source: 'openai',
        actionSuggestions,
        metadata: {
          model: this.config.model,
          tokens: data.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.generateEnhancedFallback(userMessage, context);
    }
  }

  // Enhanced fallback with contextual responses
  private generateEnhancedFallback(userMessage: string, context: ChatContext): AIResponse {
    const input = userMessage.toLowerCase().trim();
    const currentWeather = context.weatherData;
    const hasAlert = context.emergencyLevel && context.emergencyLevel !== 'normal';

    // Emergency responses
    if (input.includes('emergency') || input.includes('help') || input.includes('danger') || hasAlert) {
      const response = hasAlert ? 
        `🚨 I see there's an active alert! I'm here to help you stay safe. For immediate emergencies, hold the red SOS button for 1 second to start location tracking to CDRRMC. You can also call:\n\n📞 CDRRMC: +63956-135-2663\n🚑 Medical: +63965-192-4530\n🚒 Fire: 088-828-1481\n\nWhat specific help do you need right now?` :
        `🚨 I'm here to help with any emergency! For immediate danger, use the SOS tracker (hold red button). For quick emergency calling, I can connect you to Valencia City emergency services. What type of emergency assistance do you need?`;
      
      return {
        content: response,
        confidence: 0.8,
        source: 'emergency',
        actionSuggestions: [
          { label: 'Emergency Contacts', action: 'emergency_contacts', icon: '📞' },
          { label: 'Evacuation Route', action: 'evacuation', icon: '🗺️' },
          { label: 'SOS Tracker Guide', action: 'sos_guide', icon: '🆘' }
        ]
      };
    }

    // Weather-contextual responses
    if (input.includes('weather') || input.includes('rain') || input.includes('temperature')) {
      if (currentWeather) {
        const floodRisk = currentWeather.precipitation > 15 ? 'HIGH' : 
                         currentWeather.precipitation > 8 ? 'MODERATE' : 'LOW';
        const riskColor = floodRisk === 'HIGH' ? '🔴' : floodRisk === 'MODERATE' ? '🟡' : '🟢';
        
        const response = `🌤️ Current Valencia City weather:\n\n🌡️ Temperature: ${currentWeather.temperature}°C (feels like ${currentWeather.feelsLike}°C)\n💧 Humidity: ${currentWeather.humidity}%\n🌧️ Rainfall: ${currentWeather.precipitation}mm\n💨 Wind: ${currentWeather.windSpeed} km/h\n\n${riskColor} Flood Risk: **${floodRisk}**\n\n${this.getWeatherAdvice(currentWeather)}`;
        
        return {
          content: response,
          confidence: 0.9,
          source: 'fallback',
          actionSuggestions: [
            { label: 'Flood Map', action: 'map', icon: '🗺️' },
            { label: 'Safety Tips', action: 'safety', icon: '🛡️' }
          ]
        };
      } else {
        return {
          content: `🌤️ I'm monitoring Valencia City weather conditions for you! Weather data helps me assess flood risks and provide safety guidance. Current conditions are being analyzed to keep you informed about any potential flooding. Would you like me to explain how I monitor weather for flood prediction?`,
          confidence: 0.7,
          source: 'fallback',
          actionSuggestions: [
            { label: 'How Weather Monitoring Works', action: 'weather_explain', icon: '📊' }
          ]
        };
      }
    }

    // Evacuation queries
    if (input.includes('evacuation') || input.includes('route') || input.includes('safe') || input.includes('center')) {
      const response = `🗺️ Valencia City Evacuation Centers:\n\n🏛️ **Valencia City Gymnasium** (Primary)\n📍 Capitol Drive - 2.1km from city center\n🚗 8 min drive / 25 min walk\n👥 Capacity: 500 people\n\n🏢 **Valencia City Hall Multi-Purpose** (Secondary)\n📍 Poblacion - 1.5km from city center\n🚗 6 min drive / 18 min walk\n👥 Capacity: 300 people\n\nI can provide turn-by-turn directions to the nearest center based on your location!`;
      
      return {
        content: response,
        confidence: 0.9,
        source: 'fallback',
        actionSuggestions: [
          { label: 'Get Directions', action: 'directions', icon: '🧭' },
          { label: 'Call Center', action: 'call_center', icon: '📞' },
          { label: 'Evacuation Tips', action: 'evacuation_tips', icon: '🎒' }
        ]
      };
    }

    // Safety and preparation
    if (input.includes('safety') || input.includes('prepare') || input.includes('tips') || input.includes('flood')) {
      const response = `🛡️ **Valencia City Flood Safety Guide:**\n\n**During Flooding:**\n💧 NEVER walk through flowing water (6 inches can knock you down)\n🏠 Move to higher ground immediately\n📱 Keep devices charged for emergency communication\n🎒 Have emergency kit ready (food, water, medicines)\n👥 Stay together with family/groups\n\n**Emergency Kit Essentials:**\n✅ 3 days of food and water per person\n✅ Flashlight and extra batteries\n✅ First aid supplies\n✅ Important documents (waterproof container)\n✅ Emergency contact list\n\n**Remember: Turn Around, Don't Drown!**`;
      
      return {
        content: response,
        confidence: 0.9,
        source: 'fallback',
        actionSuggestions: [
          { label: 'Emergency Kit Checklist', action: 'kit_checklist', icon: '📋' },
          { label: 'Family Emergency Plan', action: 'family_plan', icon: '👨‍👩‍👧‍👦' }
        ]
      };
    }

    // Greetings and general
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('good')) {
      const timeGreeting = this.getTimeBasedGreeting();
      const userName = context.userName ? `, ${context.userName}` : '';
      
      const response = `${timeGreeting}${userName}! 👋 I'm Arko, your AI flood monitoring assistant for Valencia City! I'm here 24/7 to help keep you safe and informed.\n\n🌊 I can help you with:\n🌤️ Real-time weather updates\n🚨 Emergency assistance\n🗺️ Evacuation routes & centers\n🛡️ Flood safety tips\n📚 Preparation guidance\n\nHow can I help you today?`;
      
      return {
        content: response,
        confidence: 0.8,
        source: 'fallback',
        actionSuggestions: [
          { label: 'Current Weather', action: 'weather', icon: '🌤️' },
          { label: 'Emergency Contacts', action: 'emergency', icon: '📞' },
          { label: 'Safety Tips', action: 'safety', icon: '🛡️' }
        ]
      };
    }

    // About Arko
    if (input.includes('who are you') || input.includes('about') || input.includes('arko')) {
      const response = `I'm Arko! 🌊✨ Your AI-powered flood monitoring assistant created specifically for Valencia City, Bukidnon. I'm part of Team Astrobyte's mission to keep our community safe!\n\n**What makes me special:**\n🧠 Real-time AI responses powered by advanced language models\n📊 Integration with live weather data from multiple sources\n🗺️ Local knowledge of Valencia City geography and flood patterns\n🚨 Direct connection to emergency services\n👥 Community-focused safety guidance\n\n**My goal:** To be your trusted companion for flood safety and emergency preparedness. I'm always learning to serve you better!`;
      
      return {
        content: response,
        confidence: 0.9,
        source: 'fallback',
        actionSuggestions: [
          { label: 'My Capabilities', action: 'capabilities', icon: '⚡' },
          { label: 'Team Astrobyte', action: 'team', icon: '👥' }
        ]
      };
    }

    // Default helpful response
    const response = `I understand you're asking about something important! 🤔 While I'm continuously learning, I can definitely help you with:\n\n🌤️ **Weather & Flood Monitoring** - Current conditions and forecasts\n🚨 **Emergency Assistance** - Quick access to help and contacts\n🗺️ **Navigation & Evacuation** - Routes to safety and evacuation centers\n🛡️ **Safety Education** - Flood preparation and safety tips\n💬 **General Assistance** - Questions about Valencia City\n\nWhat would you like to know more about?`;
    
    return {
      content: response,
      confidence: 0.6,
      source: 'fallback',
      actionSuggestions: [
        { label: 'Weather Update', action: 'weather', icon: '🌤️' },
        { label: 'Emergency Help', action: 'emergency', icon: '🚨' },
        { label: 'Show All Features', action: 'help', icon: '❓' }
      ]
    };
  }

  // Generate action suggestions based on AI response content
  private generateActionSuggestions(content: string, context: ChatContext): Array<{ label: string; action: string; icon: string }> {
    const suggestions = [];
    const lowContent = content.toLowerCase();

    if (lowContent.includes('emergency') || lowContent.includes('call') || lowContent.includes('contact')) {
      suggestions.push({ label: 'Emergency Contacts', action: 'emergency_contacts', icon: '📞' });
    }

    if (lowContent.includes('evacuation') || lowContent.includes('route') || lowContent.includes('direction')) {
      suggestions.push({ label: 'Find Route', action: 'evacuation_route', icon: '🗺️' });
    }

    if (lowContent.includes('weather') || lowContent.includes('rain') || lowContent.includes('forecast')) {
      suggestions.push({ label: 'Weather Map', action: 'weather_map', icon: '🌤️' });
    }

    if (lowContent.includes('safety') || lowContent.includes('tip') || lowContent.includes('prepare')) {
      suggestions.push({ label: 'Safety Guide', action: 'safety_guide', icon: '🛡️' });
    }

    if (lowContent.includes('sos') || lowContent.includes('tracker') || lowContent.includes('location')) {
      suggestions.push({ label: 'SOS Help', action: 'sos_guide', icon: '🆘' });
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  // Get time-based greeting
  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    
    if (hour < 6) return 'Good late night';
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // Get weather-based advice
  private getWeatherAdvice(weather: any): string {
    if (weather.precipitation > 20) {
      return "⚠️ **Heavy rainfall detected!** Flood risk is elevated. Avoid low-lying areas, monitor for flash floods, and stay near evacuation routes.";
    } else if (weather.precipitation > 10) {
      return "🌧️ **Moderate rain ongoing.** Stay alert for potential flooding in usual problem areas. Keep emergency kit accessible.";
    } else if (weather.windSpeed > 50) {
      return "💨 **Strong winds detected!** Be cautious of falling debris and secure loose objects. Combined with rain, this increases flood risks.";
    } else if (weather.humidity > 90 && weather.temperature > 25) {
      return "🌡️ **High humidity and temperature.** Conditions favor thunderstorm development. Monitor weather closely for sudden changes.";
    } else {
      return "✅ **Weather conditions are currently stable.** Continue normal activities but stay weather-aware. Perfect time to check your emergency supplies!";
    }
  }

  // Check if AI service is available
  isAvailable(): boolean {
    return this.isEnabled;
  }

  // Get service status
  getStatus(): { enabled: boolean; model: string; hasApiKey: boolean } {
    return {
      enabled: this.isEnabled,
      model: this.config.model,
      hasApiKey: !!this.config.apiKey
    };
  }
}

// Export singleton instance
export const aiService = new ArkoAIService();
export type { AIResponse, ChatContext };