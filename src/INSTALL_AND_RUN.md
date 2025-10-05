# 🚀 Arko - Installation & Run Guide

## ⚡ Quick Start (5 Minutes)

```bash
# Step 1: Install Supabase client
npm install @supabase/supabase-js

# Step 2: Start the development server
npm run dev

# Step 3: Open your browser
# The app should automatically open at http://localhost:5173
```

**That's it!** Your app is now running with real-time data! 🎉

---

## 📋 Complete Installation Guide

### **Prerequisites**

Make sure you have:
- ✅ Node.js 16+ installed
- ✅ npm or yarn
- ✅ A code editor (VS Code recommended)
- ✅ Internet connection

---

### **Step 1: Install Dependencies**

```bash
# Install the Supabase client library
npm install @supabase/supabase-js

# This is the only new dependency needed!
# All other dependencies should already be installed
```

**Verify Installation:**
```bash
npm list @supabase/supabase-js
```

Should show: `@supabase/supabase-js@2.x.x`

---

### **Step 2: Verify Environment File**

Check that `.env` file exists in your project root:

```bash
ls -la .env
```

Should show: `.env` file with your API keys

**⚠️ IMPORTANT:** Never commit `.env` to git!
```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore
```

---

### **Step 3: Set Up Supabase Database**

1. **Open Supabase Dashboard**
   - Go to: https://hvkofmuziejgqarlljia.supabase.co
   - Login with your account

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query" button

3. **Run Database Setup**
   - Open `/SUPABASE_SETUP.sql` in your code editor
   - Copy ALL the SQL content
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl/Cmd + Enter

4. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see:
     - `flood_alerts`
     - `community_reports`
     - `evacuation_centers`
     - `weather_data`
     - `user_locations`

**✅ Success message:** "Database setup complete!"

---

### **Step 4: Add Sample Data (Optional but Recommended)**

This adds evacuation centers and a test alert to see real data:

**Already done in SUPABASE_SETUP.sql!** The script includes:
- ✅ 3 evacuation centers (Valencia City Hall, Lumbo School, San Carlos Hall)
- ✅ 1 sample flood alert for testing

To verify:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM evacuation_centers;
SELECT * FROM flood_alerts WHERE is_active = true;
```

---

### **Step 5: Start Development Server**

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### **Step 6: Open in Browser**

Navigate to: `http://localhost:5173`

**You should see:**
1. ✅ Arko login screen
2. ✅ Login with Guest/Email/Emergency
3. ✅ Weather widget loading real Valencia City data
4. ✅ Flood alerts (if database has data)
5. ✅ Interactive map

---

## 🧪 Verification Tests

### **Test 1: Check Browser Console**

Open Developer Tools (F12) → Console tab

**Look for these success messages:**
```
✅ Supabase client initialized
✅ Real weather data loaded: {temperature: 28, ...}
```

**⚠️ If you see warnings:**
```
⚠️ Weather Service: Using simulation mode
```
This means API key needs activation (takes 10 minutes) or `.env` needs restart.

---

### **Test 2: Verify Weather Data**

1. Login to the app
2. Look at the weather widget
3. Note the temperature

**Wait 5 minutes, then:**
4. Check if temperature updates
5. Console should show: `🔄 Weather data updated`

**Expected behavior:**
- Temperature should match actual Valencia City weather
- Values should change over time (not static 28°C)
- Updates automatically every 5 minutes

---

### **Test 3: Verify Flood Alerts**

**If you have data in database:**
- Alert banner should appear at top
- Shows location, severity, time to impact
- Updates every 2 minutes

**If database is empty:**
- No alert banner (normal for first setup)
- App will use simulation mode when needed

**To test with real data:**
1. Go to Supabase Dashboard → Table Editor
2. Click on `flood_alerts` table
3. Click "Insert row"
4. Fill in:
   ```
   severity: high
   location: Test Location
   barangay: Poblacion
   latitude: 7.9125
   longitude: 125.0864
   water_level_cm: 50
   time_to_impact_minutes: 15
   is_active: true
   ```
5. Save
6. Wait 2 minutes → Alert should appear in app!

---

### **Test 4: Verify Supabase Connection**

In browser console (after app loads):

```javascript
// Test database query
const { data, error } = await supabase
  .from('evacuation_centers')
  .select('*')
  .limit(1);

console.log('Test result:', data, error);
```

**Expected result:**
```javascript
Test result: [{
  id: "...",
  name: "Valencia City Hall",
  address: "Poblacion, Valencia City",
  ...
}] null
```

If `data` is empty array: Database is empty but connected ✅  
If `error` is not null: Connection issue ❌

---

## 🎛️ Configuration Options

### **Switch Between Real and Simulation Data**

Edit `.env`:

```env
# Use real API data (recommended)
VITE_USE_WEATHER_SIMULATION=false
VITE_USE_FLOOD_SIMULATION=false

# Use simulation data (for testing without API)
# VITE_USE_WEATHER_SIMULATION=true
# VITE_USE_FLOOD_SIMULATION=true
```

**After changing .env:**
```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

---

### **Adjust Update Frequencies**

Edit `.env`:

```env
# Weather update interval (milliseconds)
VITE_UPDATE_INTERVAL=300000  # 5 minutes (default)
# VITE_UPDATE_INTERVAL=60000   # 1 minute (for testing)

# API timeout
VITE_API_TIMEOUT=30000  # 30 seconds (default)
```

---

### **Enable Debug Mode**

Edit `.env`:

```env
VITE_DEBUG_MODE=true
```

This will show more detailed logs in console:
- API request/response details
- Data transformation steps
- Error details

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Cannot find module '@supabase/supabase-js'"**

**Solution:**
```bash
npm install @supabase/supabase-js
```

Then restart dev server:
```bash
npm run dev
```

---

### **Issue 2: Weather shows simulation warning**

**Problem:** API key not yet activated or .env not loaded

**Solution 1:** Wait 10 minutes after creating OpenWeatherMap account

**Solution 2:** Restart dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

**Solution 3:** Verify .env file
```bash
cat .env | grep VITE_OPENWEATHER_API_KEY
```

Should show your API key (without quotes)

---

### **Issue 3: Supabase "not configured" warning**

**Problem:** Database connection issue

**Solution 1:** Check .env has Supabase credentials
```bash
cat .env | grep VITE_SUPABASE
```

**Solution 2:** Verify URL and key are correct
- URL format: `https://xxxxx.supabase.co`
- Key is long string starting with `eyJ`

**Solution 3:** Restart dev server

---

### **Issue 4: "Table does not exist" error**

**Problem:** Database tables not created

**Solution:**
1. Open Supabase SQL Editor
2. Run `/SUPABASE_SETUP.sql` completely
3. Wait 30 seconds
4. Refresh browser

---

### **Issue 5: Port 5173 already in use**

**Problem:** Another app is using the port

**Solution:**
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

---

## 📊 What Should Be Working

After successful setup:

| Feature | Status | How to Verify |
|---------|--------|---------------|
| **Weather Data** | ✅ Real-time | Shows actual Valencia weather |
| **Temperature** | ✅ Live | Changes over time |
| **Humidity** | ✅ Live | Real current humidity |
| **Wind Speed** | ✅ Live | Real wind data |
| **Precipitation** | ✅ Live | Real rainfall amount |
| **Flood Alerts** | ✅ Database | Shows if database has alerts |
| **Evacuation Centers** | ✅ Database | 3 centers pre-loaded |
| **Map** | ✅ Interactive | Can zoom, pan, click |
| **Tabs** | ✅ Working | All 4 tabs functional |
| **Login** | ✅ Working | Guest/Email/Emergency |

---

## 🔄 Development Workflow

### **Daily Development:**

```bash
# Start development
npm run dev

# Code changes auto-reload
# No need to restart server for code changes
```

### **After Changing .env:**

```bash
# Must restart server
Ctrl+C
npm run dev
```

### **After Installing New Package:**

```bash
npm install package-name
# Server usually restarts automatically
```

### **Clean Build:**

```bash
npm run build
npm run preview
```

---

## 🚀 Production Deployment

### **Before Deploying:**

1. ✅ Test all features work locally
2. ✅ Verify no console errors
3. ✅ Check all API keys are valid
4. ✅ Ensure database tables are created
5. ✅ Test on mobile devices

### **Build for Production:**

```bash
npm run build
```

**Output:** `/dist` folder with optimized files

### **Deploy to Vercel (Recommended):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# DO NOT commit .env to git!
```

### **Deploy to Netlify:**

```bash
# Build command: npm run build
# Publish directory: dist
# Add environment variables in Netlify dashboard
```

---

## 📈 Monitoring & Logs

### **Check API Usage:**

**OpenWeatherMap:**
- Dashboard: https://openweathermap.org/api
- Free tier: 1,000 calls/day
- Arko uses: ~288 calls/day (safe!)

**Supabase:**
- Dashboard: https://hvkofmuziejgqarlljia.supabase.co
- Free tier: 500MB database
- Check usage in Settings → Usage

---

## 🎓 Next Steps

Once everything is running:

1. **Explore the App**
   - Try all tabs (Alerts, Map, Reports, Data)
   - Test emergency contacts
   - Submit a test community report

2. **Customize Data**
   - Add more evacuation centers
   - Add Valencia barangay boundaries
   - Update emergency contact numbers

3. **Learn the Codebase**
   - Read `/COMPONENT_UPDATE_EXAMPLE.md`
   - Explore `/services/` directory
   - Check component files in `/components/`

4. **Add Features**
   - Real-time subscriptions
   - Push notifications
   - Photo uploads
   - SMS alerts

---

## 💡 Pro Tips

### **Faster Development:**

```bash
# Use React Fast Refresh - keeps state on hot reload
# Already configured in Vite!
```

### **Debug Network Requests:**

1. Open F12 → Network tab
2. Filter by "Fetch/XHR"
3. Watch API calls in real-time
4. Check request/response data

### **Monitor Weather Updates:**

```javascript
// In browser console
setInterval(() => {
  console.log('Current weather:', weatherData);
}, 60000); // Log every minute
```

### **Test Error Handling:**

```env
# Temporarily break API key to test simulation mode
VITE_OPENWEATHER_API_KEY=invalid_key

# App should gracefully fall back to simulation
```

---

## ✅ Installation Complete!

If you can:
- ✅ See the app at http://localhost:5173
- ✅ Login successfully
- ✅ See weather data updating
- ✅ No red errors in console

**You're all set!** 🎉

---

## 📞 Need Help?

**Still stuck? Check:**

1. **Console Output**
   - Copy any errors
   - Look for red text

2. **Network Tab**
   - Check failed requests
   - Verify API responses

3. **Supabase Logs**
   - Dashboard → Logs
   - Check for errors

**Common success indicators:**
```
✅ Supabase client initialized
✅ Real weather data loaded
✅ Weather data updated
⚠️ Using simulation mode (OK if API not ready)
```

**Good luck and happy coding!** 🚀