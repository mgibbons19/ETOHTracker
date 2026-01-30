// ============================================
// ALCOHOL TRACKER - MAIN APP
// ============================================

// DOM Elements
const logForm = document.getElementById('logForm');
const logDate = document.getElementById('logDate');
const drinkCount = document.getElementById('drinkCount');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');
const recentEntriesDiv = document.getElementById('recentEntries');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to yesterday
    setDateToYesterday();
    
    // Load recent entries
    loadRecentEntries();
    
    // Setup event listeners
    setupEventListeners();
});

// Set date input to yesterday
function setDateToYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    logDate.value = yesterday.toISOString().split('T')[0];
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    logForm.addEventListener('submit', handleSubmit);
    
    // Stepper buttons
    decreaseBtn.addEventListener('click', () => {
        const current = parseInt(drinkCount.value) || 0;
        if (current > 0) {
            drinkCount.value = current - 1;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        const current = parseInt(drinkCount.value) || 0;
        drinkCount.value = current + 1;
    });
    
    // Prevent negative numbers
    drinkCount.addEventListener('input', () => {
        if (parseInt(drinkCount.value) < 0) {
            drinkCount.value = 0;
        }
    });
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const date = logDate.value;
    const drinks = parseInt(drinkCount.value) || 0;
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging...';
    
    try {
        const result = await logDrinks(date, drinks);
        
        if (result.success) {
            showMessage('success', result.message);
            // Reload recent entries
            loadRecentEntries();
            // Reset form
            drinkCount.value = 0;
        } else {
            showMessage('error', 'Failed to log entry: ' + result.message);
        }
    } catch (error) {
        showMessage('error', 'Error logging entry. Please try again.');
        console.error('Error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log Entry';
    }
}

// API call to log drinks
async function logDrinks(date, drinks) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'logDrinks',
            date: date,
            drinks: drinks
        })
    });
    
    return await response.json();
}

// API call to get recent entries
async function getRecentEntries(days = 30) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'getRecentEntries',
            days: days
        })
    });
    
    return await response.json();
}

// Load and display recent entries
async function loadRecentEntries() {
    try {
        const result = await getRecentEntries(14); // Show last 14 days
        
        if (result.success && result.entries.length > 0) {
            displayRecentEntries(result.entries);
        } else {
            recentEntriesDiv.innerHTML = '<p class="loading">No recent entries found.</p>';
        }
    } catch (error) {
        recentEntriesDiv.innerHTML = '<p class="loading">Error loading entries.</p>';
        console.error('Error loading recent entries:', error);
    }
}

// Display recent entries
function displayRecentEntries(entries) {
    if (entries.length === 0) {
        recentEntriesDiv.innerHTML = '<p class="loading">No recent entries.</p>';
        return;
    }
    
    const html = entries.map(entry => {
        const drinks = entry.actual_drinks;
        const drinksClass = drinks === 0 ? 'zero' : '';
        const drinksText = drinks === 0 ? '✓ Dry day' : `${drinks} drink${drinks !== 1 ? 's' : ''}`;
        
        return `
            <div class="entry-item">
                <span class="entry-date">${formatDate(entry.tracking_date)}</span>
                <span class="entry-drinks ${drinksClass}">${drinksText}</span>
            </div>
        `;
    }).join('');
    
    recentEntriesDiv.innerHTML = html;
}

// Format date for display
function formatDate(dateStr) {
    // dateStr is already formatted as "YYYY-MM-DD dow"
    return dateStr;
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

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            scheduleNotification();
        }
    }
}

// Schedule daily notification (this is a placeholder - actual scheduling would need service worker)
function scheduleNotification() {
    // This would be implemented in the service worker for persistent notifications
    console.log('Notification scheduled');
}

// Check if we should request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    // You can uncomment this to prompt for notifications on first visit
    // requestNotificationPermission();
}
