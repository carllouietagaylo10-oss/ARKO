# 🧪 Real-Time Data Testing Guide

## Quick Test Commands

### **Test 1: Verify Environment Variables**

Open browser console (F12) and run:

```javascript
// Check if all API keys are loaded
console.log('Environment Check:', {
  openweather: !!import.meta.env.VITE_OPENWEATHER_API_KEY,
  nasa: !!import.meta.env.VITE_NASA_EARTHDATA_TOKEN,
  mapbox: !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
  supabase: !!import.meta.env.VITE_SUPABASE_URL
});
```

**Expected Result:**
```javascript
{
  openweather: true,
  nasa: true,
  mapbox: true,
  supabase: true
}
```

---

### **Test 2: Test OpenWeatherMap API**

```bash
curl "https://api.openweathermap.org/data/2.5/weather?lat=7.9125&lon=125.0864&appid=b2999e24a163f29be9462457507aac98&units=metric"
```

**Expected:** JSON response with weather data

---

### **Test 3: Test NASA POWER API**

```bash
curl "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M&community=RE&longitude=125.0864&latitude=7.9125&start=20250103&end=20250104&format=JSON"
```

**Expected:** JSON response with temperature and humidity

---

### **Test 4: Test Mapbox API**

```bash
curl "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=pk.eyJ1Ijoia3Jpc3RvZmZlMSIsImEiOiJjbWdiemdpZ3UxODduMm1zZzJlMTY2cjA5In0.IHfQZ6OzKdI3-DuqoYnA1g"
```

**Expected:** JSON response with style information

---

### **Test 5: Check Console Logs**

After logging in, look for:

```
✅ Expected Logs:
🌐 Fetching data from all sources...
✅ Multi-source weather data loaded
✅ Mapbox Service: Initialized
✅ Supabase client initialized
✅ NASA POWER: Active
🔄 Multi-source weather updated

❌ Errors to Watch For:
❌ 401 Unauthorized - Check API keys
❌ 404 Not Found - Check endpoints
❌ CORS Error - Normal for some APIs
❌ Network Error - Check internet
```

---

### **Test 6: Verify Multi-Source Integration**

1. Login to app
2. Go to "Data" tab
3. Check for "Multi-Source Data Active" banner
4. Count active sources (should be 4-5 green)

---

### **Test 7: Check Weather Widget**

1. Go to "Alerts" tab
2. Look at weather widget
3. Should show source badges: OpenWeather, NASA, PAGASA
4. Should show confidence: 90-100%

---

### **Test 8: Verify Maps**

1. Go to "Map" tab
2. Map should load with satellite imagery
3. Try zooming in/out
4. Check for smooth performance

---

## 📊 Success Criteria

| Test | Expected | Status |
|------|----------|--------|
| Environment vars | All true | [ ] |
| OpenWeather API | 200 OK | [ ] |
| NASA API | 200 OK | [ ] |
| Mapbox API | 200 OK | [ ] |
| Console logs | No errors | [ ] |
| Multi-source active | 4-5 sources | [ ] |
| Weather badges | 3 shown | [ ] |
| Map loads | Satellite view | [ ] |

---

## 🐛 Common Issues & Fixes

### **Issue: "openweather: false"**

**Fix:**
1. Check `.env` has `VITE_OPENWEATHER_API_KEY=b2999e24a163f29be9462457507aac98`
2. Restart server: `npm run dev`

### **Issue: "nasa: false"**

**Fix:**
1. Check `.env` has `VITE_NASA_EARTHDATA_TOKEN=...`
2. Wait 10 minutes (token needs activation)
3. Restart server

### **Issue: "mapbox: false"**

**Fix:**
1. Check `.env` has `VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...`
2. Install mapbox-gl: `npm install mapbox-gl`
3. Restart server

### **Issue: "supabase: false"**

**Fix:**
1. Check `.env` has correct Supabase URL
2. Run `SUPABASE_SETUP.sql` in dashboard
3. Restart server

---

## ✅ All Tests Passing?

If all tests pass:
- ✅ Your setup is perfect!
- ✅ All APIs are working
- ✅ Multi-source data is active
- ✅ Maps are loading
- ✅ Ready for production!

If some tests fail:
- Check the specific fix above
- Restart dev server
- Clear browser cache
- Check `/FINAL_SETUP_COMPLETE.md` for detailed troubleshooting

---

## 🎉 Happy Testing!

Once all tests pass, you're ready to use Arko with full real-time data!