// ============================================
// ALCOHOL TRACKER - SETTINGS PAGE
// ============================================

// DOM Elements
const settingsForm = document.getElementById('settingsForm');
const costPerDrink = document.getElementById('costPerDrink');
const dailyTarget = document.getElementById('dailyTarget');
const saveBtn = document.getElementById('saveBtn');
const messageDiv = document.getElementById('message');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    settingsForm.addEventListener('submit', handleSubmit);
}

// API call to get settings
async function getSettings() {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'getSettings'
        })
    });
    
    return await response.json();
}

// API call to update setting
async function updateSetting(settingName, value) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'updateSetting',
            settingName: settingName,
            value: value
        })
    });
    
    return await response.json();
}

// Load current settings
async function loadSettings() {
    try {
        const result = await getSettings();
        
        if (result.success) {
            const settings = result.settings;
            costPerDrink.value = settings.cost_per_drink || 3;
            dailyTarget.value = settings.daily_target || 0;
        } else {
            showMessage('error', 'Failed to load settings.');
        }
    } catch (error) {
        showMessage('error', 'Error loading settings.');
        console.error('Error loading settings:', error);
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const cost = parseFloat(costPerDrink.value);
    const target = parseInt(dailyTarget.value);
    
    // Disable button during submission
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
        // Update both settings
        const costResult = await updateSetting('cost_per_drink', cost);
        const targetResult = await updateSetting('daily_target', target);
        
        if (costResult.success && targetResult.success) {
            showMessage('success', 'Settings saved successfully!');
        } else {
            showMessage('error', 'Failed to save some settings.');
        }
    } catch (error) {
        showMessage('error', 'Error saving settings. Please try again.');
        console.error('Error:', error);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Settings';
    }
}

// Show message
function showMessage(type, text) {
    messageDiv.className = `message ${type} show`;
    messageDiv.textContent = text;
    
    // Hide after 5 seconds
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}
