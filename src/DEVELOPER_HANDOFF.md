# Developer Handoff - Professional 3D Map UI

## Overview
This document provides all necessary information for implementing the professional 3D map UI for Arko Valencia City Flood Alert System. The design system emphasizes trustworthiness, readability, and emergency-ready functionality.

---

## 🎨 Design Tokens Integration

### Import Design Tokens
```css
/* Import the design tokens file */
@import './design-tokens.css';

/* Or include in your build system */
/* All tokens are available as CSS custom properties */
```

### Token Usage Examples
```css
.my-component {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-glass);
  color: var(--color-neutral-900);
  font: var(--font-body);
}

.primary-button {
  background: var(--color-primary);
  height: var(--button-height-lg);
  padding: 0 var(--space-6);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
}
```

---

## 🏗️ Component Architecture

### File Structure
```
components/
├── ui/
│   ├── header/
│   │   └── LogoCard.tsx
│   ├── panels/
│   │   └── ThreeDModePanel.tsx
│   ├── controls/
│   │   ├── LayerPills.tsx
│   │   ├── FloatingControls.tsx
│   │   └── CameraControls.tsx
│   ├── tooltips/
│   │   └── EntityTooltip.tsx
│   ├── lists/
│   │   └── EntityList.tsx
│   └── status/
│       └── ConnectionIndicator.tsx
└── Professional3DMap.tsx
```

### CSS Class Naming Convention
```css
/* BEM-style naming with token-based styling */
.ui-header__logo-card { /* Component block */ }
.ui-header__logo-card--emergency { /* Modifier */ }
.ui-header__title { /* Element */ }

.panel-3d-mode { /* Component */ }
.panel-3d-mode--collapsed { /* State */ }
.panel-3d-mode__section { /* Element */ }

.ui-pill-bar { /* Component */ }
.ui-pill-bar__pill { /* Element */ }
.ui-pill-bar__pill--active { /* State */ }
```

---

## 📱 Responsive Implementation

### Breakpoint Strategy
```css
/* Mobile first approach using design tokens */
.component {
  /* Mobile styles (default) */
  padding: var(--space-4);
  
  @media (min-width: 640px) {
    /* Tablet styles */
    padding: var(--space-6);
  }
  
  @media (min-width: 1024px) {
    /* Desktop styles */
    padding: var(--space-8);
  }
}
```

### Container Queries (Modern Approach)
```css
.panel-3d-mode {
  container-type: inline-size;
}

@container (max-width: 300px) {
  .panel-3d-mode__content {
    /* Compact layout */
    gap: var(--space-2);
  }
}
```

---

## 🎭 Component Specifications

### 1. Header/Logo Card
```tsx
interface HeaderProps {
  variant?: 'default' | 'emergency';
  showLiveBadge?: boolean;
  onLogoClick?: () => void;
}

// CSS Classes
.ui-header__logo-card {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-glass);
  height: var(--header-height-mobile);
}

@media (min-width: 768px) {
  .ui-header__logo-card {
    height: var(--header-height-tablet);
  }
}

@media (min-width: 1024px) {
  .ui-header__logo-card {
    height: var(--header-height-desktop);
  }
}
```

### 2. Layer Pills Bar
```tsx
interface LayerPillsProps {
  layers: LayerConfig[];
  onToggle: (layerId: string) => void;
  activeLayer?: string;
}

// CSS Classes
.ui-pill-bar {
  display: flex;
  gap: var(--pill-gap);
  padding: var(--space-2);
}

.ui-pill-bar__pill {
  height: var(--pill-height);
  padding: 0 var(--pill-padding-x);
  border-radius: var(--radius-full);
  transition: all var(--duration-fast) var(--ease-out);
}

.ui-pill-bar__pill--active {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-primary);
}

.ui-pill-bar__pill--inactive {
  background: var(--glass-medium);
  color: var(--color-neutral-700);
  border: 1px solid var(--glass-border);
}
```

### 3. 3D Mode Panel
```tsx
interface ThreeDModePanelProps {
  isOpen: boolean;
  onClose: () => void;
  cameraMode: 'orbit' | 'follow' | 'flyto';
  onCameraModeChange: (mode: string) => void;
  layers: LayerConfig[];
  shelters: ShelterData[];
  alerts: AlertData[];
  userLocation: LocationData;
}

// CSS Classes
.panel-3d-mode {
  width: var(--panel-width);
  background: var(--glass-light);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border-strong);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-modal);
  padding: var(--panel-padding);
  z-index: var(--z-floating);
}

.panel-3d-mode--collapsed {
  transform: translateX(100%);
  opacity: 0;
}

.panel-3d-mode--expanded {
  transform: translateX(0);
  opacity: 1;
  transition: all var(--duration-slow) var(--ease-out);
}
```

### 4. Floating Controls
```tsx
interface FloatingControlsProps {
  onCompassClick: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  mapRotation: number;
}

// CSS Classes
.ui-controls-floating {
  position: fixed;
  bottom: var(--space-4);
  left: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--floating-control-gap);
  z-index: var(--z-floating);
}

.ui-controls-floating__compass {
  width: var(--floating-control-size);
  height: var(--floating-control-size);
  background: var(--glass-medium);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-floating);
}
```

### 5. Entity Tooltip
```tsx
interface EntityTooltipProps {
  entity: EntityData;
  position: { x: number; y: number };
  onNavigate?: () => void;
  onDetails?: () => void;
  onClose: () => void;
}

// CSS Classes
.tooltip-entity {
  position: absolute;
  max-width: var(--tooltip-max-width);
  background: var(--glass-light);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--tooltip-padding);
  box-shadow: var(--shadow-tooltip);
  z-index: var(--z-tooltip);
  animation: tooltipAppear var(--duration-fast) var(--ease-out);
}

@keyframes tooltipAppear {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

---

## 🎨 Animation Implementation

### CSS Animations
```css
/* Status pulse animation - 900ms ease-in-out */
@keyframes statusPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.status-indicator--live {
  animation: statusPulse 900ms ease-in-out infinite;
}

/* Shimmer update state - 2s ease-in-out infinite */
@keyframes shimmerUpdate {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.entity-updating {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmerUpdate 2s ease-in-out infinite;
}
```

### React Spring Example
```tsx
import { useSpring, animated } from '@react-spring/web';

const TooltipComponent = ({ isVisible, position }) => {
  const animation = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible 
      ? 'translateY(0px) scale(1)' 
      : 'translateY(8px) scale(0.95)',
    config: { duration: 120 }
  });

  return (
    <animated.div 
      style={animation}
      className="tooltip-entity"
    >
      {/* Tooltip content */}
    </animated.div>
  );
};
```

---

## 📊 Real-time Data Integration

### WebSocket Connection Setup
```typescript
class RealtimeMapService {
  private ws: WebSocket | null = null;
  private sequenceNumber = 0;
  
  async initialize() {
    // 1. Fetch initial snapshot
    const snapshot = await fetch('/api/realtime/snapshot');
    const data = await snapshot.json();
    
    // 2. Render initial state
    this.renderInitialState(data);
    
    // 3. Establish WebSocket connection
    this.connectWebSocket();
  }
  
  private connectWebSocket() {
    this.ws = new WebSocket('wss://api.example.com/ws?token=SHORT_LIVED_TOKEN');
    
    this.ws.onmessage = (event) => {
      const delta = JSON.parse(event.data);
      this.processDelta(delta);
    };
  }
  
  private processDelta(delta: DeltaMessage) {
    // Ignore older sequence numbers
    if (delta.seq <= this.sequenceNumber) return;
    
    this.sequenceNumber = delta.seq;
    
    // Batch updates for next animation frame
    requestAnimationFrame(() => {
      delta.updates.forEach(update => {
        this.applyUpdate(update);
      });
    });
  }
}
```

### Data Schema Types
```typescript
interface DeltaMessage {
  type: 'delta';
  seq: number;
  updates: EntityUpdate[];
}

interface EntityUpdate {
  action: 'upsert' | 'remove';
  id: string;
  kind: 'shelter' | 'alert' | 'building' | 'user';
  lon: number;
  lat: number;
  alt: number;
  props: Record<string, any>;
}

interface SnapshotResponse {
  entities: Entity[];
  alerts: Alert[];
  weather: WeatherData;
  timestamp: string;
}
```

### Connection State Management
```tsx
const useConnectionState = () => {
  const [status, setStatus] = useState<'live' | 'degraded' | 'offline'>('offline');
  const [lastUpdate, setLastUpdate] = useState<Date>();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeSinceUpdate = now.getTime() - (lastUpdate?.getTime() || 0);
      
      if (timeSinceUpdate > 10000) { // 10 seconds
        setStatus('degraded');
      }
      
      if (timeSinceUpdate > 30000) { // 30 seconds
        setStatus('offline');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastUpdate]);
  
  return { status, lastUpdate };
};
```

---

## 🎯 State Management

### Connection Status Component
```tsx
const ConnectionIndicator = () => {
  const { status } = useConnectionState();
  
  return (
    <div className={`ui-status-connection ui-status-connection--${status}`}>
      <div className="ui-status-connection__indicator">
        {status === 'live' && <div className="status-dot status-dot--pulse" />}
        {status === 'degraded' && <AlertTriangle size={16} />}
        {status === 'offline' && <WifiOff size={16} />}
      </div>
      
      <span className="ui-status-connection__text">
        {status === 'live' && 'Live Data'}
        {status === 'degraded' && 'Connection Issues'}
        {status === 'offline' && 'Offline Mode'}
      </span>
      
      {status !== 'live' && (
        <button className="ui-status-connection__reconnect">
          Reconnect
        </button>
      )}
    </div>
  );
};
```

### Layer Toggle Hook
```tsx
const useLayerToggle = () => {
  const [layers, setLayers] = useState({
    terrain: true,
    buildings: true,
    water: true,
    alerts: true,
    routes: true
  });
  
  const toggleLayer = useCallback((layerId: keyof typeof layers) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  }, []);
  
  return { layers, toggleLayer };
};
```

---

## 📦 Asset Export Information

### SVG Icons Required
```
/assets/icons/
├── compass.svg (24×24)
├── zoom-in.svg (24×24) 
├── zoom-out.svg (24×24)
├── recenter.svg (24×24)
├── live-dot.svg (8×8)
├── eye.svg (16×16)
├── eye-off.svg (16×16)
├── globe.svg (24×24)
├── mountain.svg (20×20)
├── building.svg (20×20)
├── waves.svg (20×20)
├── alert-triangle.svg (20×20)
├── route.svg (20×20)
├── home.svg (16×16)
├── shield.svg (16×16)
└── crosshair.svg (24×24)
```

### 3D Model Placeholders
```
/assets/models/
├── fire_station.glb (actual 3D model file)
├── plaza.glb (actual 3D model file)
├── shelter_small.glb (actual 3D model file)
├── house_small.glb (actual 3D model file)
└── government_building.glb (actual 3D model file)

/assets/model-previews/ (for design/testing)
├── fire_station.png (2x export)
├── plaza.png (2x export)
├── shelter_small.png (2x export)
├── house_small.png (2x export)
└── government_building.png (2x export)
```

### Export Settings
- **SVG Icons**: Optimize for web, remove unnecessary metadata
- **PNG Fallbacks**: 2x resolution for high-DPI displays
- **Color Format**: Use CSS custom properties instead of hard-coded colors

---

## ✅ Testing & Quality Assurance

### Device Testing Matrix
```
Mobile:
├── iPhone SE (375×667) - Minimum viewport
├── iPhone 12 Pro (390×844) - Standard mobile
└── iPhone 14 Pro Max (430×932) - Large mobile

Tablet:
├── iPad (768×1024) - Standard tablet
├── iPad Pro (834×1194) - Large tablet
└── Surface Pro (912×1368) - Hybrid device

Desktop:
├── MacBook Air (1440×900) - Small desktop
├── Standard Desktop (1920×1080) - Common resolution
└── Large Desktop (2560×1440) - High resolution
```

### Performance Targets
- **Time to Interactive**: < 3 seconds
- **Frame Rate**: 60fps during animations  
- **Memory Usage**: < 100MB peak
- **Bundle Size**: < 500KB gzipped
- **Lighthouse Score**: > 90 for all metrics

### Accessibility Checklist
- [ ] All interactive elements have 44px+ touch targets
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces state changes
- [ ] Focus indicators are clearly visible
- [ ] No animation for users with `prefers-reduced-motion`

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Real-time data endpoints
VITE_REALTIME_API_URL=https://api.example.com
VITE_WEBSOCKET_URL=wss://api.example.com/ws

# 3D Map configuration  
VITE_CESIUM_TOKEN={{CESIUM_TOKEN}}
VITE_MAP_TILES_URL=https://tiles.example.com

# Feature flags
VITE_ENABLE_3D_MODELS=true
VITE_ENABLE_REALTIME=true
```

### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import "./design-tokens.css";`
      }
    }
  },
  define: {
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString())
  }
});
```

---

## 📝 Implementation Checklist

### Phase 1: Core Components
- [ ] Design tokens integration
- [ ] Header/Logo card component
- [ ] Layer pills bar component
- [ ] Basic 3D viewport setup
- [ ] Floating controls implementation

### Phase 2: Advanced Features  
- [ ] 3D Mode panel with collapsible states
- [ ] Entity tooltips with animations
- [ ] Real-time data WebSocket integration
- [ ] Connection status indicator
- [ ] Entity list components

### Phase 3: Polish & Performance
- [ ] Animation refinements (120ms tooltips, 900ms pulses)
- [ ] Shimmer loading states
- [ ] Error state handling
- [ ] Performance optimizations
- [ ] Accessibility improvements

### Phase 4: Testing & Deployment
- [ ] Cross-device testing
- [ ] Performance benchmarking  
- [ ] Accessibility audit
- [ ] User acceptance testing
- [ ] Production deployment

---

## 🆘 Support & Resources

### Design System Documentation
- **Figma File**: [Link to Figma file]
- **Design Tokens**: `/design-tokens.css`
- **Component Library**: `/components/ui/`

### Technical Resources
- **TypeScript Types**: All components fully typed
- **Storybook**: Component documentation and testing
- **Testing**: Jest + React Testing Library setup

### Emergency Contacts
- **Design Lead**: [Contact information]
- **Frontend Lead**: [Contact information]  
- **Project Manager**: [Contact information]

---

*This handoff document provides everything needed to implement the professional 3D map UI. All design tokens, component specifications, and integration guidelines are included for a seamless development experience.*