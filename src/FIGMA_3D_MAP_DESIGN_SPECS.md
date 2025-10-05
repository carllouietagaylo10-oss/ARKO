# Professional 3D Map UI - Figma Design Specifications

## Overview
Complete design specification for a polished, mobile-first 3D map UI for Arko Valencia City Flood Alert System. This document serves as a blueprint for creating the Figma file with all required components, tokens, and developer handoff materials.

---

## Design Tokens

### Color Palette
```css
/* Primary Colors */
--color-primary: #0F6B72; /* Deep teal */
--color-accent: #2B95D6; /* Sky blue */
--color-danger: #E04646; /* Alert red */
--color-amber: #F6A623; /* Warning amber */
--color-neutral-900: #0B1220; /* Dark text */

/* Backgrounds */
--bg-gradient: linear-gradient(180deg, #F7F8FB 0%, #EFF6F9 100%);
--glass-bg: rgba(255, 255, 255, 0.72);

/* Extended Palette */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-info: #3B82F6;
--color-neutral-50: #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;

/* Glass Morphism */
--glass-light: rgba(255, 255, 255, 0.8);
--glass-medium: rgba(255, 255, 255, 0.6);
--glass-dark: rgba(255, 255, 255, 0.4);
--glass-border: rgba(255, 255, 255, 0.3);
--glass-shadow: rgba(31, 38, 135, 0.2);

/* Connection States */
--status-live: #10B981; /* Green */
--status-degraded: #F6A623; /* Amber */
--status-offline: #64748B; /* Grey */
```

### Typography Scale
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Type Scale */
--text-display: 36px/44px; /* Desktop H1 */
--text-h1-mobile: 28px/36px; /* Mobile H1 */
--text-h2: 24px/32px;
--text-h3: 20px/28px;
--text-h4: 18px/24px;
--text-body: 14px/20px;
--text-caption: 12px/16px;
--text-button: 16px/20px;

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-14: 56px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.15);
--shadow-floating: 0 12px 24px rgba(0, 0, 0, 0.12);
```

---

## Artboard Specifications

### 1. Mobile Artboard (375×812)
**Frame Name:** `Mobile_3D_Map`
**Constraints:** Left & Top fixed, Scale content

**Layout Structure:**
```
┌─────────────────────────────────────┐ 375px
│ Header/Logo Card (56px height)      │
├─────────────────────────────────────┤
│ Map Layers Pill Bar (48px height)   │
├─────────────────────────────────────┤
│                                     │
│                                     │
│          3D Viewport                │
│         (600px height)              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Floating Controls (64px height)     │
├─────────────────────────────────────┤
│ Live Connection Bar (32px height)   │
└─────────────────────────────────────┘ 812px
```

### 2. Tablet Artboard (768×1024)
**Frame Name:** `Tablet_3D_Map`
**Constraints:** Left & Top fixed, Scale content

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐ 768px
│ Header/Logo Card (64px height)                              │
├─────────────────────────────────────────────────────────────┤
│ Map Layers Pill Bar (56px height)                          │
├─────────────────────────────────────────────────────────────┤
│                                        ┌──────────────────┐ │
│                                        │                  │ │
│          3D Viewport                   │   3D MODE Panel  │ │
│         (800px height)                 │   (300px width)  │ │
│                                        │                  │ │
│                                        └──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Floating Controls + Live Bar (72px height)                 │
└─────────────────────────────────────────────────────────────┘ 1024px
```

### 3. Desktop Artboard (1440×900)
**Frame Name:** `Desktop_3D_Map`
**Constraints:** Left & Top fixed, Scale content

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐ 1440px
│ Header/Logo Card (72px height)                              │
├─────────────────────────────────────────────────────────────┤
│ Map Layers Pill Bar + Controls (64px height)               │
├─────────────────────────────────────────────────────────────┤
│                                        ┌──────────────────┐ │
│                                        │                  │ │
│          3D Viewport                   │   3D MODE Panel  │ │
│         (700px height)                 │   (320px width)  │ │
│                                        │                  │ │
│                                        └──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Status Bar + Timeline (64px height)                        │
└─────────────────────────────────────────────────────────────┘ 900px
```

---

## Component Specifications

### 1. Header/Logo Card
**Component Name:** `ui/header/logo-card`

**Variants:**
- `default` - Normal state
- `emergency` - Red accent for emergency mode

**Structure:**
```
Header Card (Auto Layout: Horizontal)
├── Logo Container (48×48)
│   ├── Arko Logo Icon
│   └── Status Dot (8×8, positioned top-right)
├── Text Container (Auto Layout: Vertical)
│   ├── Title Text: "Arko"
│   └── Subtitle Text: "Valencia City Flood Alert"
└── Live Badge Container
    └── Live Badge: "LIVE" + pulse dot
```

**Styling:**
- Background: var(--glass-bg)
- Backdrop Filter: blur(16px)
- Border: 1px solid var(--glass-border)
- Border Radius: var(--radius-xl)
- Shadow: var(--shadow-glass)
- Padding: 16px

### 2. Right-Side "3D MODE" Panel
**Component Name:** `panel/3d-mode`

**Variants:**
- `collapsed` - Hidden state
- `expanded` - Full panel visible
- `tablet` - Condensed version for tablet
- `mobile` - Bottom sheet for mobile

**Sections:**
1. **Camera Controls**
   - Mode buttons: Orbit | Follow | FlyTo
   - Each button: 48px height, full width

2. **Layer Toggles**
   - Switch components with labels
   - Count badges for dynamic content

3. **Shelters List**
   - Mini cards with capacity info
   - Status indicators (available/limited/full)

4. **Alerts List**
   - Alert severity badges
   - Timestamp indicators

5. **User Location**
   - Coordinates display
   - Accuracy indicator

**Styling:**
- Background: var(--glass-light)
- Width: 280px (desktop), 320px (tablet), 100% (mobile)
- Border Radius: var(--radius-2xl)
- Shadow: var(--shadow-xl)

### 3. Top Map Layers Pill Bar
**Component Name:** `ui/pill-bar/layers`

**Pills:**
- Terrain (Mountain icon)
- Buildings (Building icon)
- Water (Waves icon)
- Alerts (Triangle icon)
- Routes (Route icon)

**Variants per Pill:**
- `inactive` - White background, colored icon
- `active` - Colored background, white icon
- `disabled` - Gray state
- `hover` - Subtle highlight
- `pressed` - Slight scale down

**Styling:**
- Pill Height: 40px
- Border Radius: var(--radius-full)
- Padding: 8px 16px
- Gap between pills: 8px

### 4. Floating Controls
**Component Name:** `ui/controls/floating`

**Elements:**
- **Mini Compass** (48×48)
  - Circular button with compass icon
  - Rotates based on map orientation
  
- **Zoom Controls** (48×80)
  - Vertical stack: Zoom In + Zoom Out
  - Each button: 48×40
  
- **Recenter FAB** (56×56)
  - Primary colored circular button
  - Crosshair icon
  - Elevated shadow

**Styling:**
- Background: var(--glass-medium)
- Backdrop Filter: blur(12px)
- Border: 1px solid var(--glass-border)
- Shadow: var(--shadow-floating)

### 5. Entity Tooltip Card
**Component Name:** `tooltip/entity`

**Variants:**
- `shelter` - Green accent
- `alert` - Red accent
- `building` - Blue accent
- `water` - Cyan accent

**Structure:**
```
Tooltip Card (Auto Layout: Vertical)
├── Header (Auto Layout: Horizontal)
│   ├── Status Dot (8×8)
│   ├── Title Text
│   └── Severity Badge
├── Subtitle Text
├── Data Grid (Auto Layout: Grid)
│   ├── Label: Value pairs
│   └── Last Updated timestamp
└── Action Buttons (Auto Layout: Horizontal)
    ├── Primary CTA: "Navigate"
    └── Secondary CTA: "Details"
```

**Styling:**
- Max Width: 280px
- Background: var(--glass-light)
- Backdrop Filter: blur(20px)
- Border Radius: var(--radius-lg)
- Shadow: var(--shadow-xl)
- Padding: 16px

### 6. Entity List
**Component Name:** `list/entities`

**List Items:**
- **Shelter Item**
  - Icon + Name + Capacity
  - Distance + Status indicator
  
- **Alert Item**
  - Severity badge + Location
  - Risk level + Time indicator

**Styling:**
- Item Height: 56px
- Padding: 12px 16px
- Border Radius: var(--radius-md)
- Hover: Slight background highlight

### 7. Live Connection Indicator
**Component Name:** `ui/status/connection`

**Variants:**
- `live` - Green with pulsing dot
- `degraded` - Amber with warning icon
- `offline` - Gray with offline icon

**Structure:**
```
Status Bar (Auto Layout: Horizontal)
├── Status Icon (16×16 with pulse animation)
├── Status Text
└── Reconnect Button (if degraded/offline)
```

**Styling:**
- Height: 32px
- Padding: 8px 16px
- Border Radius: var(--radius-lg)
- Background varies by state

---

## Animation Specifications

### Micro-Interactions
```css
/* Pulse Animation - 900ms ease-in-out */
@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

/* Tooltip Fade/Slide - 120ms ease-out */
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

/* Button Press - 100ms ease-out */
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Shimmer Update State - 2s ease-in-out infinite */
@keyframes shimmerUpdate {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

### Panel Transitions
- Slide In: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Slide Out: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Scale Animations: 150ms ease-out

---

## State Specifications

### 1. Normal State (Connected, No Alerts)
- All systems green
- Live indicator pulsing green
- Map layers all visible
- No alert overlays

### 2. Live Alerts State
- Alert zones visible on map
- Red alert pins with pulsing animation
- Tooltip showing alert details
- Alert count badge in panel

### 3. Degraded Connection State
- Amber banner at top: "Connection degraded"
- Reconnect CTA button
- Some features disabled
- Data timestamps showing age

### 4. Offline Snapshot State
- Gray overlay on map
- Banner: "Snapshot from HH:MM"
- Offline indicator
- Limited interactivity

### 5. High-Density View
- Clustered markers with count badges
- Zoom prompt overlay
- Simplified icon representations

---

## Accessibility Specifications

### Color Contrast
- Primary text on light: 4.5:1 minimum
- Secondary text on light: 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus States
- Visible focus rings: 2px solid var(--color-accent)
- Focus ring offset: 2px
- Keyboard navigation order defined

### Screen Reader Support
- All icons have text alternatives
- Component roles defined
- Live regions for status updates

---

## Export Settings & Assets

### Icons Required (SVG Export)
```
Icons to create in Figma:
├── compass.svg (24×24)
├── zoom-in.svg (24×24)
├── zoom-out.svg (24×24)
├── recenter.svg (24×24)
├── live-dot.svg (8×8 with pulse animation)
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

### 3D Model Placeholders (PNG Export 2x)
```
Models folder:
├── fire_station.png (placeholder visualization)
├── plaza.png (placeholder visualization)
├── shelter_small.png (placeholder visualization)
├── house_small.png (placeholder visualization)
└── government_building.png (placeholder visualization)
```

Note: Actual .glb files will be provided by developers

---

## Developer Handoff Specifications

### CSS Variable Mapping
```css
/* Map Figma tokens to CSS variables */
:root {
  /* Colors */
  --color-primary: #0F6B72;
  --color-accent: #2B95D6;
  --color-danger: #E04646;
  --color-amber: #F6A623;
  --color-neutral-900: #0B1220;
  
  /* Backgrounds */
  --bg-gradient: linear-gradient(180deg, #F7F8FB 0%, #EFF6F9 100%);
  --glass-bg: rgba(255, 255, 255, 0.72);
  
  /* Spacing (match Figma Auto Layout) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 40px;
  --space-4xl: 56px;
  
  /* Typography */
  --font-display: 600 36px/44px Inter;
  --font-h1-mobile: 600 28px/36px Inter;
  --font-body: 400 14px/20px Inter;
  --font-button: 600 16px/20px Inter;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.15);
  --shadow-floating: 0 12px 24px rgba(0, 0, 0, 0.12);
}
```

### Component Class Names
```css
/* Component naming convention */
.ui-header-logo-card { /* Header component */ }
.panel-3d-mode { /* 3D mode panel */ }
.ui-pill-bar-layers { /* Layer pill bar */ }
.ui-controls-floating { /* Floating controls */ }
.tooltip-entity { /* Entity tooltip */ }
.list-entities { /* Entity list */ }
.ui-status-connection { /* Connection status */ }

/* State modifiers */
.is-active { /* Active state */ }
.is-disabled { /* Disabled state */ }
.is-loading { /* Loading state */ }
.is-collapsed { /* Collapsed state */ }
```

### Responsive Breakpoints
```css
/* Mobile first approach */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large desktop */ }
```

---

## Real-time Data Integration

### API Endpoints
```javascript
// Initial data load
GET /api/realtime/snapshot
Response: {
  entities: [...],
  alerts: [...],
  weather: {...},
  timestamp: "2024-01-01T12:00:00Z"
}

// WebSocket connection
WSS wss://api.example.com/ws?token=<SHORT_LIVED_TOKEN>

// Delta message format
{
  type: "delta",
  seq: 12345,
  updates: [
    {
      action: "upsert", // or "remove"
      id: "entity-123",
      kind: "shelter", // shelter, alert, building, etc.
      lon: 125.0864,
      lat: 7.9125,
      alt: 85,
      props: {
        name: "Valencia City Hall",
        capacity: 500,
        status: "available"
      }
    }
  ]
}
```

### Client Integration Flow
```
1. Page Load → GET /api/realtime/snapshot
2. Render initial map state
3. Establish WebSocket connection
4. Subscribe to delta updates
5. Apply updates via requestAnimationFrame batching
6. Handle connection states (live/degraded/offline)
```

### Data Binding Points
- **Map Entities**: Bind to coordinates and properties
- **Panel Counts**: Dynamic from entity arrays
- **Status Indicators**: Connection state + data freshness
- **Tooltips**: Real-time property updates
- **Timeline**: Event history with timestamps

---

## Figma File Structure

### Pages
1. **🎨 Design System** - Tokens, colors, typography
2. **📱 Mobile** - 375×812 artboard
3. **📋 Tablet** - 768×1024 artboard  
4. **💻 Desktop** - 1440×900 artboard
5. **🧩 Components** - All reusable components
6. **📋 Dev Handoff** - Specifications and export assets
7. **✅ Acceptance** - Checklist and approval

### Component Organization
```
🧩 Components
├── 🎛️ Controls
│   ├── Floating Controls
│   ├── Zoom Controls
│   └── Compass
├── 📊 Data Display
│   ├── Entity List
│   ├── Status Indicators
│   └── Tooltips
├── 🗂️ Layout
│   ├── Header Card
│   ├── 3D Mode Panel
│   └── Pill Bar
└── 🎯 Interactive
    ├── Layer Pills
    ├── Camera Buttons
    └── Action Buttons
```

This comprehensive specification provides everything needed to create the professional 3D map UI in Figma, with all required components, states, and developer handoff materials.