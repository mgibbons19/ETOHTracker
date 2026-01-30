# Alcohol Tracker - Column Structure Update

## Changes Made

Updated the DrinkLog sheet structure to match your existing tracking pattern from the screenshot.

### New Column Structure

**DrinkLog Sheet:**
1. `week_id` - YYYYMMWW format (e.g., 20210524)
2. `day_id` - YYYYMMDD format (e.g., 20210524)
3. `tracking_date` - Date only in YYYY-MM-DD format (e.g., 2021-05-24)
4. `tracking_day` - Day of week (mon, tue, wed, thu, fri, sat, sun)
5. `target_drinks` - Your daily target/goal
6. `actual_drinks` - Number of drinks logged

### What Changed

**Before:**
- 5 columns total
- Combined `tracking_date` column with format "YYYY-MM-DD dow"
- Column name was `tracking_day_of_target_drinks`

**After:**
- 6 columns total
- Separate `tracking_date` (YYYY-MM-DD) and `tracking_day` (dow) columns
- Column name changed to `target_drinks`

### Files Updated

1. **AlcoholTracker.gs** (Google Apps Script)
   - `getLogSheet()` - Updated to create 6 columns
   - `getTrackingDate()` - Returns date only (no day of week)
   - `getTrackingDay()` - New function returning day of week
   - `logDrinks()` - Updated to populate 6 columns
   - `getRecentEntries()` - Updated to read 6 columns
   - `getMonthStats()` - Updated column indices
   - `getYearStats()` - Updated column indices

2. **app.js** (Frontend)
   - `displayRecentEntries()` - Updated to display tracking_date and tracking_day separately

### Example Data Row

```
week_id: 20210524
day_id: 20210524
tracking_date: 2021-05-24
tracking_day: mon
target_drinks: 3
actual_drinks: 2
```

### Migration Notes

If you already have data in the old format:
1. The new code will create a fresh DrinkLog sheet with the correct structure
2. You can manually adjust column headers in your existing sheet
3. Or you can let it create a new sheet and migrate data manually if needed

No changes needed to:
- Settings sheet structure
- Frontend HTML/CSS
- PWA configuration
- Stats calculations (they work the same way)
