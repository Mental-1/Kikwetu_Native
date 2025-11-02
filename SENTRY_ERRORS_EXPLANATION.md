# Sentry Errors Explanation & Fixes

## Critical Errors Fixed

### 1. ✅ **Database Column Mismatch** (FIXED)
**Error:**
```
column notifications.is_read does not exist
hint: Perhaps you meant to reference the column "notifications.read"
```

**Problem:** The database schema uses `read` but the code was querying `is_read`.

**Fix Applied:** Updated `src/hooks/useNotifications.ts` to use `read` instead of `is_read`:
- Changed `.select('id, user_id, title, message, read, created_at')`
- Changed `.update({ read: true })`
- Changed `.eq('read', false)`
- Updated all property access from `dbNotif.is_read` to `dbNotif.read`

---

### 2. ⚠️ **Google Maps API Key Missing** (CONFIGURATION NEEDED)
**Error:**
```
API key not found. Check that <meta-data android:name="com.google.android.geo.API_KEY" 
android:value="your API key"/> is in the <application> element of AndroidManifest.xml
```

**Problem:** Google Maps requires an API key to function. Without it, the map crashes.

**Fix Applied:** Added configuration in `app.json`:
```json
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

**Action Required:** 
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps SDK for Android" API
3. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `app.json` with your actual API key
4. For iOS, also add to `app.json`:
```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
  }
}
```

---

### 3. ✅ **View Hierarchy Error** (FIXED)
**Error:**
```
IllegalStateException: The specified child already has a parent. 
You must call removeView() on the child's parent first.
addViewAt: failed to insert view [262] into parent [148] at index 0
```

**Problem:** MapView component was being recreated on every render, causing React Native to try to add the same view to multiple parents.

**Fix Applied:** 
- Wrapped `MapViewComponent` with `React.memo()` to prevent unnecessary re-renders
- Added `displayName` for better debugging
- This ensures the component instance remains stable across renders

---

### 4. ⚠️ **getUserStores Error** (REQUIRES INVESTIGATION)
**Error:**
```
getUserStores error: [Error message]
```

**Problem:** The `getUserStores` function in `storesService.ts` is throwing an error. This could be:
- Authentication issue
- Database permission issue
- Network issue
- Missing user context

**Location:** `src/services/storesService.ts:141`

**Action Required:** 
- Check Sentry for the actual error message
- Verify user authentication when this is called
- Check database permissions for the `stores` table
- Add better error handling/logging

---

## Non-Critical Warnings

### 5. ℹ️ **Route Warnings** (CAN BE IGNORED)
**Warning:**
```
[Layout children]: No route named "X" exists in nested children
```

**Explanation:** These are Expo Router warnings that occur during route resolution. They're typically:
- Development-time warnings only
- Not causing crashes
- Related to how Expo Router resolves nested routes

**Routes mentioned:**
- `discover`, `home`, `dashboard`, `listings`, `map`, `profile`, `settings`

**Action:** These are likely false positives or development warnings. They don't affect production builds unless you're seeing actual navigation failures.

---

### 6. ℹ️ **Video API 404** (EXPECTED IF ENDPOINT NOT IMPLEMENTED)
**Error:**
```
GET: https://app.ki-kwetu.com/api/v1/videos/featured?limit=8 [404]
```

**Problem:** The videos featured endpoint returns 404, meaning it's not implemented on the backend yet.

**Action:** Either:
1. Implement the endpoint on the backend
2. Handle 404 gracefully in the frontend (show empty state)
3. Remove the feature until backend is ready

---

## Summary

| Error | Status | Action Required |
|-------|--------|----------------|
| Database column mismatch | ✅ FIXED | None - code updated |
| Google Maps API key | ⚠️ CONFIG NEEDED | Add API key to `app.json` |
| View hierarchy error | ✅ FIXED | None - component memoized |
| getUserStores error | ⚠️ INVESTIGATE | Check Sentry for details |
| Route warnings | ℹ️ INFO | Can ignore - not critical |
| Video API 404 | ℹ️ INFO | Expected if endpoint missing |

---

## Next Steps

1. **URGENT:** Add Google Maps API key to `app.json`
2. **IMPORTANT:** Check Sentry logs for `getUserStores` error details
3. **OPTIONAL:** Implement graceful handling for missing video endpoint
4. **OPTIONAL:** Review route structure if navigation issues persist

