// storage.js - Data storage handling for HydroTrack Pro

// Keys for local storage
const STORAGE_KEYS = {
    USER_DATA: 'hydrotrackData',
    WEEKLY_DATA: 'hydrotrackWeeklyData',
    HISTORY_DATA: 'hydrotrackHistoryData',
    ACHIEVEMENTS: 'hydrotrackAchievements',
    THEME: 'darkTheme',
    LAST_WEEK_RESET: 'lastWeekReset'
};

// Default user data
const DEFAULT_USER_DATA = {
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
    },
    streak: 0,
    lastActive: null
};

// Default achievements data
const DEFAULT_ACHIEVEMENTS = {
    hydroBeginner: {
        id: 'hydroBeginner',
        name: 'Hydro Beginner',
        description: 'Track water for 3 days',
        icon: '💧',
        unlocked: false,
        progress: 0,
        target: 3
    },
    waterWizard: {
        id: 'waterWizard',
        name: 'Water Wizard',
        description: 'Reach daily goal 5 times',
        icon: '🌊',
        unlocked: false,
        progress: 0,
        target: 5
    },
    hydrationStreak: {
        id: 'hydrationStreak',
        name: 'Hydration Streak',
        description: '10 days in a row',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        target: 10
    },
    perfectMonth: {
        id: 'perfectMonth',
        name: 'Perfect Month',
        description: 'Reach goal every day for a month',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        target: 30
    }
};

// Load user data from storage
function loadUserData() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        
        if (storedData) {
            // Parse stored data
            const parsedData = JSON.parse(storedData);
            
            // Update waterData with stored values
            waterData = {
                ...DEFAULT_USER_DATA,
                ...parsedData
            };
            
            // Check if it's a new day
            checkNewDay();
        } else {
            // No stored data, use defaults
            waterData = { ...DEFAULT_USER_DATA };
            
            // Set last active date
            waterData.lastActive = new Date().toISOString().split('T')[0];
            
            // Save the default data
            saveUserData();
        }
        
        // Load achievements
        loadAchievements();
        
        // Check if we need to reset weekly data
        checkWeekReset();
        
        return waterData;
    } catch (error) {
        console.error('Error loading user data:', error);
        return DEFAULT_USER_DATA;
    }
}

// Save user data to storage
function saveUserData() {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(waterData));
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
}

// Load achievements data
function loadAchievements() {
    try {
        const storedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
        
        let achievements = DEFAULT_ACHIEVEMENTS;
        
        if (storedAchievements) {
            // Parse stored achievements
            const parsedAchievements = JSON.parse(storedAchievements);
            
            // Merge with defaults to ensure all achievements exist
            achievements = {
                ...DEFAULT_ACHIEVEMENTS,
                ...parsedAchievements
            };
        }
        
        // Update badges in UI
        updateAchievementBadges(achievements);
        
        return achievements;
    } catch (error) {
        console.error('Error loading achievements:', error);
        return DEFAULT_ACHIEVEMENTS;
    }
}

// Save achievements data
function saveAchievements(achievements) {
    try {
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
        return true;
    } catch (error) {
        console.error('Error saving achievements:', error);
        return false;
    }
}

// Update achievement badges in UI
function updateAchievementBadges(achievements) {
    const badges = document.querySelectorAll('.badge');
    
    // Badges order: hydroBeginner, waterWizard, hydrationStreak, perfectMonth
    const achievementIds = ['hydroBeginner', 'waterWizard', 'hydrationStreak', 'perfectMonth'];
    
    badges.forEach((badge, index) => {
        const achievementId = achievementIds[index];
        const achievement = achievements[achievementId];
        
        if (achievement && achievement.unlocked) {
            badge.classList.remove('locked');
            badge.setAttribute('data-unlocked', 'true');
            badge.innerHTML = `
                ${achievement.icon}
                <span class="badge-tooltip">${achievement.name}: ${achievement.description}</span>
            `;
        } else {
            badge.classList.add('locked');
            badge.setAttribute('data-unlocked', 'false');
        }
    });
}

// Check if it's a new day and reset consumption if needed
function checkNewDay() {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const lastActive = waterData.lastActive;
    
    if (lastActive && lastActive !== today) {
        // It's a new day
        
        // Check if yesterday's goal was reached
        const yesterdayReached = waterData.consumed >= waterData.goal;
        
        // Update streak
        if (yesterdayReached) {
            waterData.streak += 1;
            
            // Check for new achievements
            updateAchievementsProgress({
                goalReached: true,
                daysActive: 1
            });
        } else {
            // Reset streak if goal wasn't met
            waterData.streak = 0;
        }
        
        // Save yesterday's data to history
        saveToHistory(lastActive, waterData.consumed, waterData.goal);
        
        // Reset consumed water for the new day
        waterData.consumed = 0;
        
        // Update last active date
        waterData.lastActive = today;
        
        // Save updated data
        saveUserData();
    } else if (!lastActive) {
        // First time or data reset
        waterData.lastActive = today;
        saveUserData();
    }
}

// Save daily data to history
function saveToHistory(date, consumed, goal) {
    try {
        let history = [];
        const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY_DATA);
        
        if (storedHistory) {
            history = JSON.parse(storedHistory);
        }
        
        // Add new entry
        history.push({
            date,
            consumed,
            goal,
            percentage: Math.round((consumed / goal) * 100)
        });
        
        // Limit history to most recent 90 days
        if (history.length > 90) {
            history = history.slice(-90);
        }
        
        // Save updated history
        localStorage.setItem(STORAGE_KEYS.HISTORY_DATA, JSON.stringify(history));
        
        return true;
    } catch (error) {
        console.error('Error saving history data:', error);
        return false;
    }
}

// Get history data
function getHistoryData() {
    try {
        const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY_DATA);
        
        if (storedHistory) {
            return JSON.parse(storedHistory);
        }
        
        return [];
    } catch (error) {
        console.error('Error getting history data:', error);
        return [];
    }
}

// Update achievements progress
function updateAchievementsProgress(progress) {
    // progress object could contain:
    // - daysActive: number of consecutive days active
    // - goalReached: whether the daily goal was reached
    
    try {
        const storedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
        let achievements = DEFAULT_ACHIEVEMENTS;
        
        if (storedAchievements) {
            achievements = JSON.parse(storedAchievements);
        }
        
        let updated = false;
        
        // Hydro Beginner: Track water for 3 days
        if (progress.daysActive && !achievements.hydroBeginner.unlocked) {
            achievements.hydroBeginner.progress += progress.daysActive;
            
            if (achievements.hydroBeginner.progress >= achievements.hydroBeginner.target) {
                achievements.hydroBeginner.unlocked = true;
                showNotification(`Achievement Unlocked: ${achievements.hydroBeginner.name}!`);
                updated = true;
            }
        }
        
        // Water Wizard: Reach daily goal 5 times
        if (progress.goalReached && !achievements.waterWizard.unlocked) {
            achievements.waterWizard.progress += 1;
            
            if (achievements.waterWizard.progress >= achievements.waterWizard.target) {
                achievements.waterWizard.unlocked = true;
                showNotification(`Achievement Unlocked: ${achievements.waterWizard.name}!`);
                updated = true;
            }
        }
        
        // Hydration Streak: 10 days in a row
        if (!achievements.hydrationStreak.unlocked && waterData.streak >= achievements.hydrationStreak.target) {
            achievements.hydrationStreak.progress = waterData.streak;
            achievements.hydrationStreak.unlocked = true;
            showNotification(`Achievement Unlocked: ${achievements.hydrationStreak.name}!`);
            updated = true;
        } else if (!achievements.hydrationStreak.unlocked) {
            achievements.hydrationStreak.progress = waterData.streak;
        }
        
        // Perfect Month: Reach goal every day for a month
        // This would require tracking consecutive days where goal was reached
        // For simplicity, we'll use the streak for now
        if (!achievements.perfectMonth.unlocked && waterData.streak >= achievements.perfectMonth.target) {
            achievements.perfectMonth.progress = waterData.streak;
            achievements.perfectMonth.unlocked = true;
            showNotification(`Achievement Unlocked: ${achievements.perfectMonth.name}!`);
            updated = true;
        } else if (!achievements.perfectMonth.unlocked) {
            achievements.perfectMonth.progress = waterData.streak;
        }
        
        if (updated) {
            // Update achievements in storage
            saveAchievements(achievements);
            
            // Update UI
            updateAchievementBadges(achievements);
        }
        
        return achievements;
    } catch (error) {
        console.error('Error updating achievements:', error);
        return DEFAULT_ACHIEVEMENTS;
    }
}

// Import data from JSON file
function importData(jsonData) {
    try {
        // Parse the JSON data
        const importedData = JSON.parse(jsonData);
        
        // Validate imported data
        if (!importedData || typeof importedData !== 'object') {
            throw new Error('Invalid data format');
        }
        
        // Update waterData with imported values
        waterData = {
            ...DEFAULT_USER_DATA,
            ...importedData
        };
        
        // Save the imported data
        saveUserData();
        
        // Update UI
        updateWaterDisplay();
        
        // Reload weekly chart
        initWeeklyChart();
        
        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

// Handle file uploads for import
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const result = importData(e.target.result);
        
        if (result) {
            showNotification('Data imported successfully!');
        } else {
            showNotification('Error importing data. Please try again.', 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading file. Please try again.', 'error');
    };
    
    reader.readAsText(file);
}

// Get statistics for the current week
function getWeekStats() {
    const weeklyData = loadWeeklyData();
    
    // Calculate average for days with data
    const daysWithData = weeklyData.filter(day => day.amount > 0);
    
    let average = 0;
    if (daysWithData.length > 0) {
        const sum = daysWithData.reduce((total, day) => total + day.amount, 0);
        average = Math.round(sum / daysWithData.length);
    }
    
    // Calculate goal achievement rate
    const goalsReached = daysWithData.filter(day => day.amount >= waterData.goal).length;
    const goalRate = daysWithData.length > 0 ? Math.round((goalsReached / daysWithData.length) * 100) : 0;
    
    return {
        average,
        goalRate,
        daysTracked: daysWithData.length,
        bestDay: daysWithData.length > 0 ? Math.max(...daysWithData.map(day => day.amount)) : 0
    };
}

// Get monthly statistics
function getMonthStats() {
    const history = getHistoryData();
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter history data for current month
    const monthData = history.filter(entry => {
        const date = new Date(entry.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Calculate average
    let average = 0;
    if (monthData.length > 0) {
        const sum = monthData.reduce((total, day) => total + day.consumed, 0);
        average = Math.round(sum / monthData.length);
    }
    
    // Calculate goal achievement rate
    const goalsReached = monthData.filter(day => day.consumed >= day.goal).length;
    const goalRate = monthData.length > 0 ? Math.round((goalsReached / monthData.length) * 100) : 0;
    
    return {
        average,
        goalRate,
        daysTracked: monthData.length,
        bestDay: monthData.length > 0 ? Math.max(...monthData.map(day => day.consumed)) : 0
    };
}

// Create event listeners for storage events
function setupStorageEventListeners() {
    // Listen for storage changes in other tabs
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEYS.USER_DATA) {
            // Reload user data
            loadUserData();
            
            // Update UI
            updateWaterDisplay();
        } else if (event.key === STORAGE_KEYS.WEEKLY_DATA) {
            // Reload weekly chart
            initWeeklyChart();
        } else if (event.key === STORAGE_KEYS.THEME) {
            // Reload theme
            loadThemePreference();
        }
    });
}