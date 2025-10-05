# Professional 3D Map UI - Design Specifications

## Overview
A polished, mobile-first 3D map interface for Arko Valencia City Flood Alert System. Designed for professional emergency monitoring with trustworthy, readable UI components and unobtrusive controls.

## Design Principles
- **Professional First**: Clean, trustworthy design suitable for emergency situations
- **Mobile-First**: Optimized for 375×812 viewport with responsive scaling
- **Readability**: High contrast, legible text with subtle overlays
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Performance**: Smooth 60fps animations with hardware acceleration

## Layout Structure

### Mobile (375×812px)
```
┌─────────────────────────────────────┐
│ [Layer Pills]              [Status] │ ← Top Bar (56px)
├─────────────────────────────────────┤
│                                     │
│                                     │
│          3D Viewport                │ ← Main Viewport
│         (with vignette)             │   (600px height)
│                                     │
│                                     │
├─────────────────────────────────────┤
│ [Compass] [Zoom±]         [Center]  │ ← Controls (64px)
└─────────────────────────────────────┘
```

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────────┐
│ [Layer Pills]                              [Status] [Panel] │
├─────────────────────────────────────────────────────────────┤
│                                        ┌──────────────────┐ │
│                                        │                  │ │
│          3D Viewport                   │   3D MODE Panel  │ │
│         (with vignette)                │   ├─ Camera      │ │
│                                        │   ├─ Layers      │ │
│                                        │   ├─ Shelters    │ │
│                                        │   ├─ Alerts      │ │
│                                        │   └─ You         │ │
│                                        └──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Compass] [Zoom±]                                 [Center]  │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Layer Toggle Pills (Top Bar)
**Purpose**: Quick layer visibility control
**Design**:
- Pill-shaped buttons with rounded corners (20px)
- Active state: Colored background with white text
- Inactive state: White/glass background with colored icon
- Icons: 16px Lucide icons
- Smooth 150ms transitions

**States**:
```css
.layer-pill {
  height: 32px;
  padding: 0 12px;
  border-radius: 20px;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.layer-pill.active {
  background: var(--layer-color);
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.layer-pill.inactive {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
```

### 2. 3D Viewport
**Purpose**: Main map display area
**Design**:
- Full viewport minus UI chrome
- Subtle vignette overlay: `radial-gradient(from-transparent via-transparent to-black/10)`
- CSS perspective: 1000px + (perspective * 20)px
- Transform origin: 50% 45%
- Hardware accelerated transforms

**3D Scene Layers** (Z-index order):
1. **Terrain** (translateZ: 0px) - Base topography
2. **Water** (translateZ: 2px) - Rivers, flood zones  
3. **Buildings** (translateZ: 5px-28px) - Structures by height
4. **Alerts** (translateZ: variable) - Flood zones with water level
5. **User** (translateZ: 25px) - GPS location marker
6. **Routes** (translateZ: 5px) - Evacuation paths

### 3. Collapsible Side Panel
**Purpose**: Advanced 3D controls and layer management
**Design**:
- Width: 256px (desktop), full-width drawer (mobile)
- Glass morphism: `rgba(255, 255, 255, 0.95)` with 24px blur
- Rounded corners: 16px
- Slide animation: 300ms cubic-bezier(0.4, 0, 0.2, 1)

**Sections**:
- **Camera Mode**: Orbit/Follow/FlyTo toggle buttons
- **Layers**: Individual visibility switches with status indicators
- **Shelters**: List with capacity and distance info
- **Alerts**: Active flood warnings with risk levels
- **You**: Current location coordinates and elevation

### 4. 3D Tooltip
**Purpose**: Feature information on hover/click
**Design**:
- Rounded card: 12px border radius
- Glass background: `rgba(255, 255, 255, 0.95)` with 16px blur
- Max width: 320px
- Position: Above cursor, centered horizontally
- Appear animation: 200ms scale + fade

**Content Structure**:
```html
<div class="3d-tooltip">
  <div class="tooltip-header">
    <span class="status-dot"></span>
    <h4 class="title"></h4>
  </div>
  <p class="subtitle"></p>
  <div class="data-grid">
    <span class="label">Distance:</span>
    <span class="value">1.2km</span>
  </div>
  <button class="primary-action">View Details</button>
</div>
```

### 5. Camera Mode Switch
**Purpose**: 3D navigation control
**Modes**:
- **Orbit**: Free camera movement with rotation controls
- **Follow**: Locks camera to user location with smooth tracking  
- **FlyTo**: Smooth animated transitions between POIs

**Visual States**:
- Selected: Blue background with white icon
- Unselected: White background with colored icon
- Animation: 200ms transitions with micro-interactions

### 6. Floating Controls
**Purpose**: Essential map navigation
**Components**:

**Mini Compass**:
- 48px circular button
- Compass icon rotates with map rotation
- Click to reset view
- Glass morphism background

**Zoom Controls**:
- Vertical stack of + and - buttons
- 48px width, 40px height each
- Immediate feedback with 100ms press animation

**Recenter FAB**:
- 56px circular button
- Primary blue color with white crosshair icon
- Persistent elevation shadow
- Centers map on user location

## Color Tokens

### Layer Colors
```css
:root {
  --layer-terrain: #10b981; /* Emerald-500 */
  --layer-buildings: #64748b; /* Slate-500 */
  --layer-water: #3b82f6; /* Blue-500 */
  --layer-alerts: #ef4444; /* Red-500 */
  --layer-routes: #8b5cf6; /* Purple-500 */
}
```

### Status Colors
```css
:root {
  --status-safe: #22c55e; /* Green-500 */
  --status-moderate: #f59e0b; /* Amber-500 */
  --status-high: #ef4444; /* Red-500 */
  --status-critical: #dc2626; /* Red-600 */
}
```

### Glass Morphism
```css
:root {
  --glass-primary: rgba(255, 255, 255, 0.95);
  --glass-secondary: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.6);
  --glass-shadow: rgba(31, 38, 135, 0.15);
}
```

## Animation Specifications

### Timing Functions
- **Quick Response**: 80ms ease-out (button press)
- **Standard**: 150ms cubic-bezier(0.4, 0, 0.2, 1) (state changes)
- **Smooth**: 200ms ease-out (tooltips, panels)
- **Cinematic**: 300ms cubic-bezier(0.4, 0, 0.2, 1) (panel slides)

### Key Animations
```css
/* Layer Toggle */
.layer-toggle {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 3D Transform */
.scene-3d {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tooltip Appear */
@keyframes tooltipAppear {
  0% {
    opacity: 0;
    transform: translate(-50%, -100%) scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -100%) scale(1) translateY(0);
  }
}

/* Panel Slide */
@keyframes panelSlide {
  0% { transform: translateX(100%); }
  100% { transform: translateX(0); }
}

/* Camera Transition */
.camera-transition {
  animation: cameraTransition 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Responsive Breakpoints

### Mobile (375px - 640px)
- Single column layout
- Bottom drawer for 3D panel
- Larger touch targets (44px minimum)
- Simplified layer controls
- Reduced perspective for performance

### Tablet (641px - 1024px)  
- Side panel becomes permanent
- Enhanced hover states
- Larger tooltips with more detail
- Multi-column layer grid

### Desktop (1025px+)
- Full feature set enabled
- Refined hover interactions
- Keyboard shortcuts
- Enhanced visual effects

## Accessibility Features

### Keyboard Navigation
- Tab order: Layer pills → Panel toggle → Panel contents → Map controls
- Arrow keys: Navigate within panel sections
- Space/Enter: Activate buttons and toggles
- Escape: Close panel/tooltips

### Screen Reader Support
```html
<!-- Layer Toggle -->
<button aria-pressed="true" aria-label="Hide terrain layer">
  <span aria-hidden="true">🏔️</span>
  Terrain
</button>

<!-- 3D Scene -->
<div role="img" aria-label="3D flood map showing Valencia City with current flood alerts">
  <!-- Map content -->
</div>

<!-- Status Updates -->
<div aria-live="polite" aria-atomic="false">
  Camera mode changed to Follow
</div>
```

### Focus Management
- Visible focus rings: 2px blue outline with 2px white offset
- Focus trap in modal panels
- Skip links for keyboard users
- High contrast mode support

## Technical Implementation

### Data Integration Points
```typescript
// Weather/Flood Data
interface FloodData {
  zones: FloodZone[];
  alerts: FloodAlert[];
  waterLevel: number;
  riskScore: number;
}

// Evacuation Centers
interface EvacuationCenter {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  capacity: number;
  status: 'available' | 'limited' | 'full';
  distance: number;
}

// User Location
interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  elevation?: number;
}
```

### Performance Optimizations
- CSS transforms use GPU acceleration
- Debounced scroll/zoom handlers
- Lazy loading for non-visible layers
- Memoized component updates
- RequestAnimationFrame for smooth animations

### Error Handling
- Graceful degradation to 2D mode if WebGL fails
- Loading states with skeleton UI
- Offline support with cached map tiles
- Error boundaries with user-friendly messages

## Testing Specifications

### Device Testing
- iPhone SE (375×667) - Minimum viewport
- iPhone 12 Pro (390×844) - Standard mobile
- iPad (768×1024) - Tablet breakpoint
- MacBook Air (1440×900) - Desktop standard

### Performance Targets
- Time to Interactive: < 3 seconds
- Frame Rate: 60fps during animations
- Memory Usage: < 100MB peak
- Bundle Size: < 500KB gzipped

### Accessibility Testing
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode
- Zoom to 200% without horizontal scroll

## Browser Support
- Chrome 90+ (Primary)
- Safari 14+ (iOS/macOS)
- Firefox 88+ (Secondary)
- Edge 90+ (Windows)

## Future Enhancements
- WebGL renderer for enhanced 3D effects
- Real-time water simulation
- Augmented reality view mode
- Voice control integration
- Multi-language tooltip support