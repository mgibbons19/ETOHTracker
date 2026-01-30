# Alcohol Tracker PWA

A simple, privacy-focused Progressive Web App for tracking alcohol consumption and spending. All data is stored in your personal Google Sheet.

## Features

- 📝 **Easy Logging** - Quick daily entry with stepper controls
- 📊 **Statistics** - Monthly and yearly views with breakdowns
- 💰 **Cost Tracking** - Automatic spending calculations
- ⚙️ **Customizable** - Set your own cost per drink and daily targets
- 📱 **Mobile-First** - Works great on phones and tablets
- 🔒 **Privacy** - Your data stays in your Google Sheet
- 🚀 **Offline Support** - Works without internet connection

## Setup Instructions

### 1. Create Google Sheet

1. Create a new Google Sheet
2. Open Script Editor (Extensions > Apps Script)
3. Delete any existing code
4. Copy and paste the code from `AlcoholTracker.gs`
5. Save the project (name it "AlcoholTracker")

### 2. Test the Script

1. In the Script Editor, select `testPopulateSampleData` from the function dropdown
2. Click Run (▶️) to create sample data
3. Grant permissions when prompted
4. Check your spreadsheet - you should see two sheets: "DrinkLog" and "Settings"

### 3. Deploy as Web App

1. In Script Editor, click **Deploy > New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - Description: "Alcohol Tracker API"
   - Execute as: **Me**
   - Who has access: **Anyone** (this is required for the app to work)
5. Click **Deploy**
6. Copy the **Web app URL** (it looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### 4. Configure the PWA

1. Open `config.js`
2. Replace `YOUR_APPS_SCRIPT_URL_HERE` with your Web app URL
3. Save the file

### 5. Deploy the PWA

#### Option A: GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Push all PWA files to the repository
3. Go to Settings > Pages
4. Set Source to "main" branch
5. Your app will be available at `https://yourusername.github.io/repo-name`

#### Option B: Local Testing
1. Use a local web server (e.g., Python's `http.server`)
2. Run: `python -m http.server 8000`
3. Open: `http://localhost:8000`

### 6. Install as PWA

1. Open the app in Chrome or Safari
2. Look for "Install App" or "Add to Home Screen"
3. Install to use like a native app

## Setting Up Daily Notifications

To receive daily morning reminders:

1. Open the app and allow notifications when prompted
2. For persistent notifications, you'll need to implement push notifications through a service like OneSignal or Firebase Cloud Messaging
3. Alternatively, use your phone's built-in reminders/alarms

## File Structure

```
alcohol-tracker/
├── index.html           # Main logging page
├── stats.html           # Statistics dashboard
├── settings.html        # Settings page
├── styles.css           # Stylesheet
├── app.js              # Main app logic
├── stats.js            # Stats page logic
├── settings-page.js    # Settings page logic
├── config.js           # API configuration
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
└── README.md          # This file
```

## Creating App Icons

You'll need two icon sizes:
- **192x192** pixels → Save as `icon-192.png`
- **512x512** pixels → Save as `icon-512.png`

You can create simple icons using:
- Canva (free templates)
- Figma (design your own)
- Icon generators online

**Tip:** Use a glass or drink emoji as a simple icon, or create something more personal!

## Usage

### Logging Drinks
1. Open the app
2. Date defaults to yesterday
3. Enter number of drinks (use +/- buttons or type)
4. Click "Log Entry"

### Viewing Stats
1. Click "Stats" tab
2. Toggle between "This Month" and "This Year"
3. View total drinks, dry days, and costs

### Updating Settings
1. Click "Settings" tab
2. Adjust cost per drink (affects all calculations)
3. Set daily target drinks (for future tracking features)
4. Click "Save Settings"

## Privacy & Data

- All data is stored in YOUR Google Sheet
- No third-party tracking or analytics
- You control who can access your spreadsheet
- Export your data anytime (it's just a spreadsheet!)

## Troubleshooting

### "API URL not configured" error
- Check that you've updated `config.js` with your Web app URL
- Make sure the URL ends with `/exec`

### Stats not loading
- Verify your Apps Script is deployed as a Web app
- Check that "Who has access" is set to "Anyone"
- Look in browser console (F12) for error messages

### Notifications not working
- Check that you've granted notification permissions
- Daily reminders require additional setup (see section above)

## Future Enhancements

Ideas for future versions:
- [ ] Drink type tracking (beer, wine, cocktails)
- [ ] Photo logging
- [ ] Weekly summaries
- [ ] Streak tracking
- [ ] Export to PDF reports
- [ ] Goals and challenges

## License

Free to use and modify for personal use.

## Support

This is a personal project. For questions or issues:
- Check the troubleshooting section
- Review your browser console for errors
- Verify your Google Apps Script deployment

---

**Remember:** This tool is for personal tracking and awareness. If you're concerned about your drinking, please speak with a healthcare professional.
