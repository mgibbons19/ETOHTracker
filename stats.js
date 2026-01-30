// ============================================
// ALCOHOL TRACKER - STATS PAGE
// ============================================

// DOM Elements
const periodBtns = document.querySelectorAll('.period-btn');
const monthStatsDiv = document.getElementById('monthStats');
const yearStatsDiv = document.getElementById('yearStats');
const monthTitle = document.getElementById('monthTitle');
const yearTitle = document.getElementById('yearTitle');
const monthStatsContent = document.getElementById('monthStatsContent');
const yearStatsContent = document.getElementById('yearStatsContent');
const monthlyBreakdown = document.getElementById('monthlyBreakdown');

let currentPeriod = 'month';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadStats('month');
});

// Setup event listeners
function setupEventListeners() {
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.dataset.period;
            switchPeriod(period);
        });
    });
}

// Switch between month and year view
function switchPeriod(period) {
    currentPeriod = period;
    
    // Update button states
    periodBtns.forEach(btn => {
        if (btn.dataset.period === period) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Toggle views
    if (period === 'month') {
        monthStatsDiv.style.display = 'block';
        yearStatsDiv.style.display = 'none';
    } else {
        monthStatsDiv.style.display = 'none';
        yearStatsDiv.style.display = 'block';
    }
    
    // Load stats
    loadStats(period);
}

// Load stats based on period
async function loadStats(period) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    if (period === 'month') {
        await loadMonthStats(month, year);
    } else {
        await loadYearStats(year);
    }
}

// API call to get month stats
async function getMonthStats(month, year) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'getMonthStats',
            month: month,
            year: year
        })
    });
    
    return await response.json();
}

// API call to get year stats
async function getYearStats(year) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'getYearStats',
            year: year
        })
    });
    
    return await response.json();
}

// Load and display month stats
async function loadMonthStats(month, year) {
    try {
        const result = await getMonthStats(month, year);
        
        if (result.success) {
            const monthName = getMonthName(month);
            monthTitle.textContent = `${monthName} ${year}`;
            displayMonthStats(result);
        } else {
            monthStatsContent.innerHTML = '<p class="loading">Error loading statistics.</p>';
        }
    } catch (error) {
        monthStatsContent.innerHTML = '<p class="loading">Error loading statistics.</p>';
        console.error('Error loading month stats:', error);
    }
}

// Load and display year stats
async function loadYearStats(year) {
    try {
        const result = await getYearStats(year);
        
        if (result.success) {
            yearTitle.textContent = `${year}`;
            displayYearStats(result);
            displayMonthlyBreakdown(result.monthlyBreakdown);
        } else {
            yearStatsContent.innerHTML = '<p class="loading">Error loading statistics.</p>';
        }
    } catch (error) {
        yearStatsContent.innerHTML = '<p class="loading">Error loading statistics.</p>';
        console.error('Error loading year stats:', error);
    }
}

// Display month statistics
function displayMonthStats(stats) {
    const html = `
        <div class="stat-card">
            <span class="stat-value">${stats.totalDrinks}</span>
            <span class="stat-label">Total Drinks</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.drinkingDays}</span>
            <span class="stat-label">Drinking Days</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.dryDays}</span>
            <span class="stat-label">Dry Days</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.averageDrinksPerDrinkingDay.toFixed(1)}</span>
            <span class="stat-label">Avg per Drinking Day</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">$${stats.totalCost.toFixed(2)}</span>
            <span class="stat-label">Total Cost</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.totalDaysTracked}</span>
            <span class="stat-label">Days Tracked</span>
        </div>
    `;
    
    monthStatsContent.innerHTML = html;
}

// Display year statistics
function displayYearStats(stats) {
    const html = `
        <div class="stat-card">
            <span class="stat-value">${stats.totalDrinks}</span>
            <span class="stat-label">Total Drinks</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.drinkingDays}</span>
            <span class="stat-label">Drinking Days</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.dryDays}</span>
            <span class="stat-label">Dry Days</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.averageDrinksPerDrinkingDay.toFixed(1)}</span>
            <span class="stat-label">Avg per Drinking Day</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">$${stats.totalCost.toFixed(2)}</span>
            <span class="stat-label">Total Cost</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${stats.totalDaysTracked}</span>
            <span class="stat-label">Days Tracked</span>
        </div>
    `;
    
    yearStatsContent.innerHTML = html;
}

// Display monthly breakdown
function displayMonthlyBreakdown(breakdown) {
    if (!breakdown || breakdown.length === 0) {
        monthlyBreakdown.innerHTML = '<p class="loading">No data available.</p>';
        return;
    }
    
    // Find max drinks for bar scaling
    const maxDrinks = Math.max(...breakdown.map(m => m.totalDrinks));
    
    const html = breakdown.map(month => {
        const monthName = getMonthName(month.month);
        const barWidth = maxDrinks > 0 ? (month.totalDrinks / maxDrinks) * 100 : 0;
        
        return `
            <div class="month-item">
                <span class="month-name">${monthName}</span>
                <div class="month-bar-container">
                    <div class="month-bar" style="width: ${barWidth}%"></div>
                </div>
                <span class="month-drinks">${month.totalDrinks} drinks</span>
            </div>
        `;
    }).join('');
    
    monthlyBreakdown.innerHTML = html;
}

// Get month name from number
function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
}
