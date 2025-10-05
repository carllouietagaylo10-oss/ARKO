import React, { createContext, useContext, useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Header
    appName: 'Arko',
    appSubtitle: 'Community Flood Alert',
    
    // Navigation
    alerts: 'Alerts',
    map: 'Map',
    reports: 'Reports',
    data: 'Data',
    settings: 'Settings',
    
    // Alerts
    currentStatus: 'Current Status',
    floodRisk: 'Flood Risk',
    weatherConditions: 'Weather Conditions',
    evacuation: 'Evacuation',
    quickActions: 'Quick Actions',
    findEvacuationRoute: 'Find Evacuation Route',
    reportSituation: 'Report Situation',
    
    // Map
    mapInstructions: 'Map Instructions',
    redZones: 'Red zones indicate active flooding - avoid these areas',
    orangeZones: 'Orange zones show moderate risk - exercise caution',
    greenZones: 'Green zones are currently safe',
    evacuationCenters: 'House icons show evacuation centers',
    yourLocation: 'Blue dot shows your current location',
    rainfallEpicenter: 'Rainfall Epicenter',
    possibleLandfall: 'Possible Landfall',
    nearestEvacuation: 'Nearest Evacuation Center',
    
    // Weather
    temperature: 'Temperature',
    rainfall: 'Rainfall',
    windSpeed: 'Wind Speed',
    humidity: 'Humidity',
    pressure: 'Pressure',
    
    // Risk Levels
    safe: 'Safe',
    moderate: 'Moderate',
    high: 'High',
    critical: 'Critical',
    
    // Settings
    language: 'Language',
    notifications: 'Notifications',
    theme: 'Theme',
    units: 'Units',
    about: 'About',
    
    // Emergency
    emergency: 'Emergency',
    contactCDRRMO: 'Contact CDRRMO Valencia: (088) 000-0000',
    
    // Community Reports
    reportingGuidelines: 'Reporting Guidelines',
    reportAccurate: 'Report accurate, current conditions only',
    includeLocation: 'Include specific location and water depth if possible',
    avoidUnverified: 'Avoid sharing unverified information',
    photosHelp: 'Photos help verify reports for the community',
    
    // Additional translations
    loading: 'Loading',
    
    // Data source settings
    dataSource: 'Data Source',
    simulatedData: 'Simulated Data',
    liveWeatherAPIs: 'Live Weather APIs',
    simulationMode: 'Simulation Mode',
    simulationDesc: 'Uses realistic weather patterns for Valencia City',
    apiMode: 'API Mode', 
    apiDesc: 'Attempts to connect to live weather services'
  },
  fil: {
    // Header
    appName: 'Arko',
    appSubtitle: 'Sistema ng Babala sa Pagbaha ng Komunidad',
    
    // Navigation
    alerts: 'Mga Babala',
    map: 'Mapa',
    reports: 'Mga Ulat',
    data: 'Datos',
    settings: 'Mga Setting',
    
    // Alerts
    currentStatus: 'Kasalukuyang Kalagayan',
    floodRisk: 'Panganib sa Pagbaha',
    weatherConditions: 'Kondisyon ng Panahon',
    evacuation: 'Evacuasyon',
    quickActions: 'Mabibiling Aksyon',
    findEvacuationRoute: 'Hanapin ang Ruta ng Evacuasyon',
    reportSituation: 'Mag-ulat ng Sitwasyon',
    
    // Map
    mapInstructions: 'Mga Tagubilin sa Mapa',
    redZones: 'Ang mga pulang lugar ay nagpapakita ng aktibong pagbaha - iwasan ang mga lugar na ito',
    orangeZones: 'Ang mga orange na lugar ay nagpapakita ng katamtamang panganib - maging maingat',
    greenZones: 'Ang mga berdeng lugar ay kasalukuyang ligtas',
    evacuationCenters: 'Ang mga icon ng bahay ay nagpapakita ng mga sentro ng evacuasyon',
    yourLocation: 'Ang asul na tuldok ay nagpapakita ng inyong kasalukuyang lokasyon',
    rainfallEpicenter: 'Sentro ng Ulan',
    possibleLandfall: 'Posibleng Pagdaong',
    nearestEvacuation: 'Pinakamalapit na Sentro ng Evacuasyon',
    
    // Weather
    temperature: 'Temperatura',
    rainfall: 'Ulan',
    windSpeed: 'Bilis ng Hangin',
    humidity: 'Halumigmig',
    pressure: 'Presyon',
    
    // Risk Levels
    safe: 'Ligtas',
    moderate: 'Katamtaman',
    high: 'Mataas',
    critical: 'Kritikal',
    
    // Settings
    language: 'Wika',
    notifications: 'Mga Abiso',
    theme: 'Tema',
    units: 'Mga Yunit',
    about: 'Tungkol',
    
    // Emergency
    emergency: 'Emerhensya',
    contactCDRRMO: 'Makipag-ugnayan sa CDRRMO Valencia: (088) 000-0000',
    
    // Community Reports
    reportingGuidelines: 'Mga Gabay sa Pag-uulat',
    reportAccurate: 'Mag-ulat lamang ng tumpak at kasalukuyang kondisyon',
    includeLocation: 'Isama ang tiyak na lokasyon at lalim ng tubig kung maaari',
    avoidUnverified: 'Iwasan ang pagbabahagi ng hindi pa naberipikang impormasyon',
    photosHelp: 'Ang mga larawan ay nakakatulong na ma-verify ang mga ulat para sa komunidad',
    
    // Additional translations
    loading: 'Naglo-load',
    
    // Data source settings
    dataSource: 'Pinagkunan ng Datos',
    simulatedData: 'Huwad na Datos',
    liveWeatherAPIs: 'Live na Weather APIs',
    simulationMode: 'Simulation Mode',
    simulationDesc: 'Gumagamit ng realistic na weather patterns para sa Valencia City',
    apiMode: 'API Mode',
    apiDesc: 'Sumusubok kumonekta sa live weather services'
  },
  ceb: {
    // Header
    appName: 'Arko',
    appSubtitle: 'Sistema sa Alerto sa Baha sa Komunidad',
    
    // Navigation
    alerts: 'Mga Alerto',
    map: 'Mapa',
    reports: 'Mga Taho',
    data: 'Datos',
    settings: 'Mga Setting',
    
    // Alerts
    currentStatus: 'Karon nga Kahimtang',
    floodRisk: 'Peligro sa Baha',
    weatherConditions: 'Kondisyon sa Panahon',
    evacuation: 'Evacuation',
    quickActions: 'Dali nga mga Aksyon',
    findEvacuationRoute: 'Pangitaon ang Ruta sa Evacuation',
    reportSituation: 'Taho sa Sitwasyon',
    
    // Map
    mapInstructions: 'Mga Instruksyon sa Mapa',
    redZones: 'Ang mga pula nga lugar nagpakita sa aktibong baha - likayi kini nga mga lugar',
    orangeZones: 'Ang mga orange nga lugar nagpakita sa kasarangan nga peligro - pagbantay',
    greenZones: 'Ang mga lunhaw nga lugar karon luwas',
    evacuationCenters: 'Ang mga icon sa balay nagpakita sa mga sentro sa evacuation',
    yourLocation: 'Ang asul nga tuldok nagpakita sa inyong karon nga lokasyon',
    rainfallEpicenter: 'Sentro sa Ulan',
    possibleLandfall: 'Posible nga Pagdaong',
    nearestEvacuation: 'Labing Duol nga Sentro sa Evacuation',
    
    // Weather
    temperature: 'Temperatura',
    rainfall: 'Ulan',
    windSpeed: 'Katulin sa Hangin',
    humidity: 'Kaumog',
    pressure: 'Presyon',
    
    // Risk Levels
    safe: 'Luwas',
    moderate: 'Kasarangan',
    high: 'Taas',
    critical: 'Kritikal',
    
    // Settings
    language: 'Pinulongan',
    notifications: 'Mga Pahibalo',
    theme: 'Tema',
    units: 'Mga Yunit',
    about: 'Bahin',
    
    // Emergency
    emergency: 'Emerhensya',
    contactCDRRMO: 'Kontak sa CDRRMO Valencia: (088) 000-0000',
    
    // Community Reports
    reportingGuidelines: 'Mga Giya sa Pagtaho',
    reportAccurate: 'Magtaho lang ug sakto ug karon nga kondisyon',
    includeLocation: 'Ilakip ang piho nga lokasyon ug giladmon sa tubig kung mahimo',
    avoidUnverified: 'Likayi ang pagpaambit sa wala pa na-verify nga kasayuran',
    photosHelp: 'Ang mga hulagway makatabang sa pag-verify sa mga taho para sa komunidad',
    
    // Additional translations
    loading: 'Nag-load',
    
    // Data source settings
    dataSource: 'Gikan sa Datos',
    simulatedData: 'Simulated nga Datos', 
    liveWeatherAPIs: 'Live nga Weather APIs',
    simulationMode: 'Simulation Mode',
    simulationDesc: 'Mogamit ug realistic nga weather patterns para sa Valencia City',
    apiMode: 'API Mode',
    apiDesc: 'Mosulay ug konekta sa live weather services'
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  availableLanguages: { code: string; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Binisaya' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('arko-language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('arko-language', lang);
  };

  const t = (key: string): string => {
    // Try current language first, then fallback to English, then return the key itself
    const currentLangTranslation = translations[language]?.[key];
    const englishFallback = translations['en']?.[key];
    
    return currentLangTranslation || englishFallback || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};