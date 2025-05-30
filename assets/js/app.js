// app.js - Main application logic for HydroTrack Pro

// Global variables
let waterData = {
    goal: 2500,
    consumed: 1125,
    unit: 'ml',
    reminders: {
        enabled: true,
        times: {
            morning: true,
            midmorning: true,
            lunch: true,
            afternoon: true,
            evening: true,
            night: false
        }
    },
    settings: {
        soundNotifications: true,
        desktopNotifications: true
    }
};

// DOM elements
const progressBar = document.getElementById('progressBar');
const dailyGoalElement = document.getElementById('dailyGoal');
const consumedAmountElement = document.getElementById('consumedAmount');
const remainingAmountElement = document.getElementById('remainingAmount');
const customAmountInput = document.getElementById('customAmount');
const settingsDialog = document.getElementById('settingsDialog');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const currentTimeElement = document.getElementById('currentTime');
const themeToggle = document.getElementById('themeToggle');

// Initialize the application
function initApp() {
    // Load user data from storage
    loadUserData();
    
    // Update UI elements
    updateWaterDisplay();
    
    // Initialize 3D model
    initWaterModel();
    
    // Initialize charts
    initWeeklyChart();
    
    // Start clock
    updateClock();
    setInterval(updateClock, 60000); // Update every minute
    
    // Check reminder schedule
    checkReminders();
    setInterval(checkReminders, 60000); // Check every minute
    
    // Load theme preference
    loadThemePreference();
    
    // Set up event listeners
    setupEventListeners();
}

// Update the water display elements
function updateWaterDisplay() {
    const percentage = Math.min(Math.round((waterData.consumed / waterData.goal) * 100), 100);
    
    // Update progress bar
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    
    // Update stats
    dailyGoalElement.textContent = `${waterData.goal}${waterData.unit}`;
    consumedAmountElement.textContent = `${waterData.consumed}${waterData.unit}`;
    remainingAmountElement.textContent = `${Math.max(waterData.goal - waterData.consumed, 0)}${waterData.unit}`;
    
    // Update 3D water model height
    updateWaterLevel(percentage / 100);
}

// Add water to the daily count
function addWater(amount) {
    waterData.consumed += amount;
    
    // Save data
    saveUserData();
    
    // Update UI
    updateWaterDisplay();
    
    // Show notification
    showNotification(`Added ${amount}${waterData.unit} of water!`);
    
    // Check if goal reached
    if (waterData.consumed >= waterData.goal && waterData.consumed - amount < waterData.goal) {
        showNotification("Congratulations! Daily goal reached! 🎉");
    }
    
    // Update chart data
    updateTodayInChart();
}

// Add custom amount of water
function addCustomWater() {
    const amount = parseInt(customAmountInput.value);
    
    if (amount && amount > 0) {
        addWater(amount);
        customAmountInput.value = ''; // Clear input field
    } else {
        showNotification("Please enter a valid amount", "error");
    }
}

// Show settings dialog
function showSettings() {
    // Populate settings form with current values
    document.getElementById('goalInput').value = waterData.goal;
    
    // Select the correct unit radio button
    if (waterData.unit === 'ml') {
        document.getElementById('unitML').checked = true;
    } else {
        document.getElementById('unitOZ').checked = true;
    }
    
    // Set checkboxes
    document.getElementById('soundNotification').checked = waterData.settings.soundNotifications;
    document.getElementById('desktopNotification').checked = waterData.settings.desktopNotifications;
    
    // Show dialog
    settingsDialog.classList.add('show');
}

// Close settings dialog
function closeSettings() {
    settingsDialog.classList.remove('show');
}

// Save settings
function saveSettings() {
    // Get values from form
    waterData.goal = parseInt(document.getElementById('goalInput').value);
    waterData.unit = document.getElementById('unitML').checked ? 'ml' : 'oz';
    
    waterData.settings.soundNotifications = document.getElementById('soundNotification').checked;
    waterData.settings.desktopNotifications = document.getElementById('desktopNotification').checked;
    
    // Save data
    saveUserData();
    
    // Update UI
    updateWaterDisplay();
    
    // Close dialog
    closeSettings();
    
    // Show confirmation
    showNotification("Settings saved successfully!");
}

// Save reminder settings
function saveReminders() {
    waterData.reminders.enabled = document.getElementById('reminderToggle').checked;
    
    // Update reminder times
    waterData.reminders.times.morning = document.getElementById('morning').checked;
    waterData.reminders.times.midmorning = document.getElementById('midmorning').checked;
    waterData.reminders.times.lunch = document.getElementById('lunch').checked;
    waterData.reminders.times.afternoon = document.getElementById('afternoon').checked;
    waterData.reminders.times.evening = document.getElementById('evening').checked;
    waterData.reminders.times.night = document.getElementById('night').checked;
    
    // Save data
    saveUserData();
    
    // Show confirmation
    showNotification("Reminder settings saved!");
}

// Show notification
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    
    // Set notification type (could add different colors for different types)
    notification.className = 'notification';
    if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '';
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
    
    // Play sound if enabled
    if (waterData.settings.soundNotifications) {
        playNotificationSound();
    }
}

// Play notification sound
function playNotificationSound() {
    // Simple beep sound
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 1000;
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
}

// Update the clock
function updateClock() {
    const now = new Date();
    const options = { hour: 'numeric', minute: '2-digit' };
    currentTimeElement.textContent = now.toLocaleTimeString(undefined, options);
    
    // Check for reminders
    checkReminders();
}

// Check reminders based on current time
function checkReminders() {
    if (!waterData.reminders.enabled) return;
    
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Define reminder times
    const reminderTimes = {
        morning: { hour: 8, minute: 0 },
        midmorning: { hour: 10, minute: 30 },
        lunch: { hour: 13, minute: 0 },
        afternoon: { hour: 15, minute: 30 },
        evening: { hour: 18, minute: 0 },
        night: { hour: 20, minute: 30 }
    };
    
    // Check each reminder time
    for (const [reminder, time] of Object.entries(reminderTimes)) {
        if (waterData.reminders.times[reminder] && hour === time.hour && minute === time.minute) {
            if (waterData.settings.desktopNotifications && "Notification" in window) {
                // Show desktop notification if enabled and supported
                if (Notification.permission === "granted") {
                    new Notification("HydroTrack Pro", {
                        body: "Time to drink some water! 💧",
                        icon: "/assets/icons/favicon.ico"
                    });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission();
                }
            }
            
            // Show in-app notification
            showNotification("Time to drink some water! 💧");
        }
    }
}

// Export data as JSON
function exportData() {
    const dataStr = JSON.stringify(waterData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'hydrotrack-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification("Data exported successfully!");
}

// Clear all data
function clearData() {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
        localStorage.removeItem('hydrotrackData');
        
        // Reset to default values
        waterData = {
            goal: 2500,
            consumed: 0,
            unit: 'ml',
            reminders: {
                enabled: true,
                times: {
                    morning: true,
                    midmorning: true,
                    lunch: true,
                    afternoon: true,
                    evening: true,
                    night: false
                }
            },
            settings: {
                soundNotifications: true,
                desktopNotifications: true
            }
        };
        
        // Update UI
        updateWaterDisplay();
        initWeeklyChart();
        
        showNotification("All data has been cleared.");
        closeSettings();
    }
}

// Dark/Light Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // Update icon
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    
    // Save preference
    localStorage.setItem('darkTheme', document.body.classList.contains('dark-theme'));
}
// Load theme preference
function loadThemePreference() {
    const darkTheme = localStorage.getItem('darkTheme') === 'true';
    
    if (darkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Custom amount input enter key
    customAmountInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            addCustomWater();
        }
    });
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);