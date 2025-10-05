# 📦 Installation Dependencies

## Required Packages

Run this command to install all required dependencies:

```bash
npm install @supabase/supabase-js mapbox-gl
```

---

## What Gets Installed

### **1. @supabase/supabase-js**
- **Purpose:** Supabase database client
- **Used for:**
  - Flood alerts storage
  - Evacuation centers database
  - Community reports
  - Real-time subscriptions
- **Size:** ~50KB
- **License:** MIT

### **2. mapbox-gl**
- **Purpose:** Mapbox mapping library
- **Used for:**
  - Professional satellite maps
  - 3D terrain visualization
  - Interactive navigation
  - Custom flood zone overlays
- **Size:** ~200KB
- **License:** BSD-3-Clause

---

## Already Installed

These packages should already be in your project:

- ✅ React
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Lucide React (icons)
- ✅ Shadcn UI components
- ✅ Recharts (for charts)

---

## Verify Installation

After installing, verify with:

```bash
npm list @supabase/supabase-js mapbox-gl
```

Should show:
```
@supabase/supabase-js@2.x.x
mapbox-gl@3.x.x
```

---

## Optional: Update All Dependencies

To ensure everything is up-to-date:

```bash
npm update
```

---

## Troubleshooting

### **Issue: Installation fails**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall everything
npm install
npm install @supabase/supabase-js mapbox-gl
```

### **Issue: Version conflicts**

Check your Node.js version:
```bash
node --version
```

Should be **16.x or higher**. Update if needed:
```bash
nvm install 18
nvm use 18
```

---

## What's Next?

After installation:
1. ✅ Packages installed
2. ➡️ Create Supabase tables
3. ➡️ Start dev server: `npm run dev`

See `/QUICK_START_CARD.md` for next steps!