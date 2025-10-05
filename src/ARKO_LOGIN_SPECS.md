# Arko Login Interface - Design Specifications

## Overview
Professional, glassmorphism-based login interface for Arko Valencia City Flood Alert System. Designed mobile-first with responsive breakpoints for tablet and desktop.

## Design System

### Colors
- **Primary Blue**: #3b82f6 (Blue-500)
- **Secondary Blue**: #1d4ed8 (Blue-700)  
- **Success Green**: #10b981 (Emerald-500)
- **Error Red**: #ef4444 (Red-500)
- **Text Primary**: #1e293b (Slate-800)
- **Text Secondary**: #64748b (Slate-500)
- **Background**: Linear gradient from slate-50 via blue-50 to indigo-100

### Typography
- **Headlines**: 24px-32px, font-weight: 700, tracking-tight
- **Subheads**: 14px-16px, font-weight: 400
- **Labels**: 14px, font-weight: 500
- **Body**: 14px, font-weight: 400
- **Captions**: 12px, font-weight: 400

### Spacing Scale
- **xs**: 4px
- **sm**: 8px  
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## Components

### Main Card
- **Background**: rgba(255, 255, 255, 0.8) with 20px blur
- **Border**: 1px solid rgba(255, 255, 255, 0.4)
- **Border Radius**: 24px
- **Shadow**: 0 8px 32px rgba(31, 38, 135, 0.2)
- **Max Width**: 448px (28rem)
- **Padding**: 32px (md), 40px (lg+)

### Logo Container
- **Background**: rgba(255, 255, 255, 0.6) with 12px blur
- **Border Radius**: 16px
- **Padding**: 24px
- **Verified Badge**: 28px circle, emerald gradient, positioned top-right

### Tab Navigation
- **Container**: rgba(255, 255, 255, 0.6) with 12px blur
- **Border Radius**: 12px
- **Button Height**: 40px
- **Active State**: Blue-500 background, white text, shadow
- **Inactive State**: Transparent, slate-600 text
- **Hover State**: rgba(255, 255, 255, 0.4) background

### Form Inputs
- **Height**: 48px
- **Background**: rgba(255, 255, 255, 0.6) with 12px blur
- **Border**: 1px solid rgba(255, 255, 255, 0.5)
- **Border Radius**: 12px
- **Padding Left**: 40px (with icon)
- **Focus State**: 
  - Background: rgba(255, 255, 255, 0.8)
  - Border: rgba(59, 130, 246, 0.5)
  - Ring: 3px rgba(59, 130, 246, 0.1)

### Primary Button
- **Height**: 56px
- **Background**: Linear gradient blue-500 to blue-600
- **Border Radius**: 12px
- **Font Weight**: 600
- **Font Size**: 16px
- **Shadow**: 0 4px 16px rgba(59, 130, 246, 0.3)
- **Hover**: Transform scale(1.02), enhanced shadow
- **Active**: Transform scale(0.98)

### Secondary Button (Quick Access)
- **Height**: 48px
- **Background**: rgba(255, 255, 255, 0.6) with 12px blur
- **Border**: 1px solid rgba(255, 255, 255, 0.5)
- **Border Radius**: 12px
- **Hover**: rgba(255, 255, 255, 0.8), emerald border

## Responsive Breakpoints

### Mobile (375px - 640px)
- Card padding: 32px
- Logo size: 80px  
- Input height: 48px
- Button height: 56px (primary), 48px (secondary)

### Tablet (641px - 1024px)
- Card padding: 40px
- Enhanced shadows and blur effects
- Larger hover states

### Desktop (1025px+)
- Maximum card width maintained
- Enhanced animations and micro-interactions
- Subtle hover effects on all interactive elements

## Accessibility

### WCAG AA Compliance
- Color contrast ratio > 4.5:1 for normal text
- Color contrast ratio > 3:1 for large text
- Focus indicators visible on all interactive elements
- Proper heading hierarchy (h1 > labels > captions)

### Keyboard Navigation
- Tab order: Logo → Method tabs → Form fields → Primary button → Secondary button
- Focus rings: 2px blue with 2px white offset
- All interactive elements keyboard accessible

### ARIA Labels
- Form inputs: Proper labels and descriptions
- Error states: aria-describedby linking to error messages
- Buttons: Descriptive aria-label attributes
- Tabs: Role="tablist" with proper tab/tabpanel relationships

## Animations & Micro-interactions

### Timing
- **Quick**: 150ms - button presses, focus states
- **Standard**: 200ms - hover states, input focus
- **Slow**: 300ms - card hover, page transitions

### Easing
- **Ease-out**: For entering animations
- **Ease-in-out**: For hover states and reversible animations
- **Cubic-bezier(0.4, 0, 0.2, 1)**: For smooth mechanical interactions

### Effects
- Button press: Scale down 0.98 for 150ms
- Hover lift: translateY(-1px) with enhanced shadow
- Focus glow: Ring expansion over 300ms
- Loading spinner: Smooth rotation
- Card float: Subtle 5px vertical movement over 8s

## Technical Implementation

### HTML Structure
```html
<div class="login-container">
  <div class="background-elements">...</div>
  <div class="main-card">
    <header class="logo-section">...</header>
    <nav class="method-tabs">...</nav>
    <form class="login-form">...</form>
    <div class="actions">...</div>
    <footer class="info-footer">...</footer>
  </div>
</div>
```

### CSS Classes
- `.professional-glass` - Main glassmorphism effect
- `.input-glass` - Input field styling
- `.button-glass` - Button glassmorphism
- `.soft-card-float` - Subtle floating animation
- `.focus-ring-animation` - Focus state animation

### JavaScript Features
- Form validation with inline error display
- Password visibility toggle
- Tab navigation with proper ARIA states
- Loading states with spinner
- Toast notifications for feedback