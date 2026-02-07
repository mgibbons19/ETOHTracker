// ============================================
// ALCOHOL TRACKER - GOOGLE APPS SCRIPT BACKEND
// ============================================
// Paste this into Google Apps Script (Extensions > Apps Script)
// Then deploy as Web App (Deploy > New deployment > Web app)
// Set "Execute as: Me" and "Who has access: Anyone"

// ---- Request Handler ----

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    switch (action) {
      case 'logDrinks':
        return jsonResponse(logDrinks(data.date, data.drinks));
      case 'getRecentEntries':
        return jsonResponse(getRecentEntries(data.days || 14));
      case 'getMonthStats':
        return jsonResponse(getMonthStats(data.month, data.year));
      case 'getYearStats':
        return jsonResponse(getYearStats(data.year));
      case 'getSettings':
        return jsonResponse(getSettings());
      case 'updateSetting':
        return jsonResponse(updateSetting(data.settingName, data.value));
      default:
        return jsonResponse({ success: false, message: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, message: 'Server error: ' + err.message });
  }
}

function doGet(e) {
  return jsonResponse({ success: true, message: 'Alcohol Tracker API is running.' });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Sheet Helpers ----

function getLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('DrinkLog');
  if (!sheet) {
    sheet = ss.insertSheet('DrinkLog');
    sheet.getRange(1, 1, 1, 6).setValues([[
      'week_id', 'day_id', 'tracking_date', 'tracking_day', 'target_drinks', 'actual_drinks'
    ]]);
  }
  return sheet;
}

function getSettingsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Settings');
  if (!sheet) {
    sheet = ss.insertSheet('Settings');
    sheet.getRange(1, 1, 1, 2).setValues([['setting_name', 'value']]);
    sheet.getRange(2, 1, 2, 2).setValues([
      ['cost_per_drink', 3],
      ['daily_target', 0]
    ]);
  }
  return sheet;
}

// ---- Date Helpers ----

function getWeekId(dateObj) {
  var year = dateObj.getFullYear();
  var month = String(dateObj.getMonth() + 1).padStart(2, '0');
  var oneJan = new Date(dateObj.getFullYear(), 0, 1);
  var weekNum = String(Math.ceil(((dateObj - oneJan) / 86400000 + oneJan.getDay() + 1) / 7)).padStart(2, '0');
  return year + month + weekNum;
}

function getDayId(dateObj) {
  var y = dateObj.getFullYear();
  var m = String(dateObj.getMonth() + 1).padStart(2, '0');
  var d = String(dateObj.getDate()).padStart(2, '0');
  return y + m + d;
}

function getTrackingDate(dateObj) {
  var y = dateObj.getFullYear();
  var m = String(dateObj.getMonth() + 1).padStart(2, '0');
  var d = String(dateObj.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function getTrackingDay(dateObj) {
  var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[dateObj.getDay()];
}

// ---- API Functions ----

function logDrinks(dateStr, drinks) {
  var sheet = getLogSheet();
  var dateObj = new Date(dateStr + 'T12:00:00');
  var dayId = getDayId(dateObj);

  // Get the daily target from settings
  var settingsResult = getSettings();
  var dailyTarget = 0;
  if (settingsResult.success && settingsResult.settings) {
    dailyTarget = settingsResult.settings.daily_target || 0;
  }

  // Check if entry already exists for this date
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(dayId)) {
      // Update existing row
      sheet.getRange(i + 1, 5).setValue(dailyTarget);
      sheet.getRange(i + 1, 6).setValue(drinks);
      return { success: true, message: 'Entry updated for ' + dateStr };
    }
  }

  // Add new row
  sheet.appendRow([
    getWeekId(dateObj),
    dayId,
    getTrackingDate(dateObj),
    getTrackingDay(dateObj),
    dailyTarget,
    drinks
  ]);

  return { success: true, message: 'Entry logged for ' + dateStr };
}

function getRecentEntries(days) {
  var sheet = getLogSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return { success: true, entries: [] };
  }

  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  var entries = [];
  for (var i = 1; i < data.length; i++) {
    var trackingDate = String(data[i][2]);
    var entryDate = new Date(trackingDate + 'T12:00:00');
    if (entryDate >= cutoff) {
      entries.push({
        week_id: data[i][0],
        day_id: data[i][1],
        tracking_date: trackingDate + ' ' + data[i][3],
        tracking_day: data[i][3],
        target_drinks: data[i][4],
        actual_drinks: data[i][5]
      });
    }
  }

  // Sort by date descending (most recent first)
  entries.sort(function(a, b) {
    return String(b.day_id).localeCompare(String(a.day_id));
  });

  return { success: true, entries: entries };
}

function getMonthStats(month, year) {
  var sheet = getLogSheet();
  var data = sheet.getDataRange().getValues();

  var settingsResult = getSettings();
  var costPerDrink = 3;
  if (settingsResult.success && settingsResult.settings) {
    costPerDrink = settingsResult.settings.cost_per_drink || 3;
  }

  var totalDrinks = 0;
  var drinkingDays = 0;
  var dryDays = 0;
  var totalDaysTracked = 0;

  var monthStr = String(month).padStart(2, '0');
  var prefix = year + '-' + monthStr;

  for (var i = 1; i < data.length; i++) {
    var trackingDate = String(data[i][2]);
    if (trackingDate.indexOf(prefix) === 0) {
      var drinks = Number(data[i][5]);
      totalDaysTracked++;
      totalDrinks += drinks;
      if (drinks > 0) {
        drinkingDays++;
      } else {
        dryDays++;
      }
    }
  }

  var averageDrinksPerDrinkingDay = drinkingDays > 0 ? totalDrinks / drinkingDays : 0;

  return {
    success: true,
    totalDrinks: totalDrinks,
    drinkingDays: drinkingDays,
    dryDays: dryDays,
    averageDrinksPerDrinkingDay: averageDrinksPerDrinkingDay,
    totalCost: totalDrinks * costPerDrink,
    totalDaysTracked: totalDaysTracked
  };
}

function getYearStats(year) {
  var sheet = getLogSheet();
  var data = sheet.getDataRange().getValues();

  var settingsResult = getSettings();
  var costPerDrink = 3;
  if (settingsResult.success && settingsResult.settings) {
    costPerDrink = settingsResult.settings.cost_per_drink || 3;
  }

  var totalDrinks = 0;
  var drinkingDays = 0;
  var dryDays = 0;
  var totalDaysTracked = 0;
  var prefix = String(year) + '-';

  // Monthly breakdown: index 0 = January, 11 = December
  var monthlyDrinks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (var i = 1; i < data.length; i++) {
    var trackingDate = String(data[i][2]);
    if (trackingDate.indexOf(prefix) === 0) {
      var drinks = Number(data[i][5]);
      totalDaysTracked++;
      totalDrinks += drinks;
      if (drinks > 0) {
        drinkingDays++;
      } else {
        dryDays++;
      }
      // Extract month from YYYY-MM-DD
      var monthIndex = parseInt(trackingDate.substring(5, 7), 10) - 1;
      monthlyDrinks[monthIndex] += drinks;
    }
  }

  var averageDrinksPerDrinkingDay = drinkingDays > 0 ? totalDrinks / drinkingDays : 0;

  var monthlyBreakdown = [];
  for (var m = 0; m < 12; m++) {
    monthlyBreakdown.push({
      month: m + 1,
      totalDrinks: monthlyDrinks[m]
    });
  }

  return {
    success: true,
    totalDrinks: totalDrinks,
    drinkingDays: drinkingDays,
    dryDays: dryDays,
    averageDrinksPerDrinkingDay: averageDrinksPerDrinkingDay,
    totalCost: totalDrinks * costPerDrink,
    totalDaysTracked: totalDaysTracked,
    monthlyBreakdown: monthlyBreakdown
  };
}

function getSettings() {
  var sheet = getSettingsSheet();
  var data = sheet.getDataRange().getValues();

  var settings = {};
  for (var i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }

  return { success: true, settings: settings };
}

function updateSetting(settingName, value) {
  var sheet = getSettingsSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === settingName) {
      sheet.getRange(i + 1, 2).setValue(value);
      return { success: true, message: settingName + ' updated to ' + value };
    }
  }

  // Setting not found, add it
  sheet.appendRow([settingName, value]);
  return { success: true, message: settingName + ' set to ' + value };
}

// ---- Test / Sample Data ----

function testPopulateSampleData() {
  var sheet = getLogSheet();

  // Add sample data for the last 30 days
  var today = new Date();
  for (var i = 30; i >= 0; i--) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var drinks = Math.floor(Math.random() * 6); // 0-5 drinks
    sheet.appendRow([
      getWeekId(d),
      getDayId(d),
      getTrackingDate(d),
      getTrackingDay(d),
      3,
      drinks
    ]);
  }

  // Ensure settings exist
  getSettingsSheet();

  Logger.log('Sample data populated successfully!');
}
