// // chart.js - Chart visualization for HydroTrack Pro

// // Global variables
// let weeklyChart;
// let weeklyData = [];

// // Initialize the weekly chart
// function initWeeklyChart() {
//     const ctx = document.getElementById('weeklyChart');
    
//     if (!ctx) return;
    
//     // Generate or load weekly data
//     weeklyData = loadWeeklyData();
    
//     // Create chart
//     weeklyChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
//             datasets: [
//                 {
//                     label: 'Water Intake (ml)',
//                     data: weeklyData.map(day => day.amount),
//                     backgroundColor: generateGradientColors(),
//                     borderColor: 'rgba(8, 145, 178, 0.8)',
//                     borderWidth: 1,
//                     borderRadius: 6,
//                     maxBarThickness: 35
//                 },
//                 {
//                     label: 'Daily Goal',
//                     data: Array(7).fill(waterData.goal),
//                     type: 'line',
//                     borderColor: 'rgba(8, 145, 178, 0.5)',
//                     borderDash: [5, 5],
//                     borderWidth: 2,
//                     pointRadius: 0,
//                     fill: false
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     display: false
//                 },
//                 tooltip: {
//                     mode: 'index',
//                     intersect: false,
//                     callbacks: {
//                         label: function(context) {
//                             const label = context.dataset.label || '';
//                             const value = context.raw || 0;
//                             const percentage = (value / waterData.goal * 100).toFixed(0);
                            
//                             if (context.datasetIndex === 0) {
//                                 return `${label}: ${value}ml (${percentage}% of goal)`;
//                             } else {
//                                 return `${label}: ${value}ml`;
//                             }
//                         }
//                     }
//                 }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     grid: {
//                         color: 'rgba(0, 0, 0, 0.05)'
//                     },
//                     ticks: {
//                         callback: function(value) {
//                             return value + waterData.unit;
//                         }
//                     }
//                 },
//                 x: {
//                     grid: {
//                         display: false
//                     }
//                 }
//             }
//         }
//     });
// }

// // Generate gradient colors for chart bars
// function generateGradientColors() {
//     const colors = [];
//     const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
//     const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday
    
//     for (let i = 0; i < 7; i++) {
//         if (i === todayIndex) {
//             // Highlight today's bar
//             colors.push('rgba(8, 145, 178, 0.9)');
//         } else if (i < todayIndex) {
//             // Past days
//             colors.push('rgba(125, 211, 252, 0.7)');
//         } else {
//             // Future days
//             colors.push('rgba(224, 242, 254, 0.5)');
//         }
//     }
    
//     return colors;
// }

// // Load weekly data from storage or generate sample data
// function loadWeeklyData() {
//     // Try to load from storage
//     const storedData = localStorage.getItem('hydrotrackWeeklyData');
    
//     if (storedData) {
//         return JSON.parse(storedData);
//     }
    
//     // Generate sample data if not available
//     const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
//     const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday
    
//     const data = [];
    
//     for (let i = 0; i < 7; i++) {
//         if (i === todayIndex) {
//             // Today's data
//             data.push({
//                 day: i,
//                 amount: waterData.consumed
//             });
//         } else if (i < todayIndex) {
//             // Past days with random data
//             const randomPercentage = 0.7 + Math.random() * 0.5; // 70-120% of goal
//             data.push({
//                 day: i,
//                 amount: Math.round(waterData.goal * randomPercentage)
//             });
//         } else {
//             // Future days
//             data.push({
//                 day: i,
//                 amount: 0
//             });
//         }
//     }
    
//     // Save to storage
//     saveWeeklyData(data);
    
//     return data;
// }

// // Save weekly data to storage
// function saveWeeklyData(data) {
//     localStorage.setItem('hydrotrackWeeklyData', JSON.stringify(data));
// }

// // Update today's data in the chart
// function updateTodayInChart() {
//     if (!weeklyChart) return;
    
//     // Get today's index
//     const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
//     const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday
    
//     // Update data
//     weeklyData[todayIndex].amount = waterData.consumed;
//     saveWeeklyData(weeklyData);
    
//     // Update chart
//     weeklyChart.data.datasets[0].data[todayIndex] = waterData.consumed;
//     weeklyChart.update();
// }

// // Reset weekly data (called on a new week)
// function resetWeeklyData() {
//     weeklyData = Array(7).fill().map((_, i) => ({
//         day: i,
//         amount: 0
//     }));
    
//     // Update today's data
//     const today = new Date().getDay();
//     const todayIndex = today === 0 ? 6 : today - 1;
//     weeklyData[todayIndex].amount = waterData.consumed;
    
//     // Save and update chart
//     saveWeeklyData(weeklyData);
    
//     if (weeklyChart) {
//         weeklyChart.data.datasets[0].data = weeklyData.map(day => day.amount);
//         weeklyChart.update();
//     }
// }

// // Check if we need to reset weekly data (new week)
// function checkWeekReset() {
//     const lastReset = localStorage.getItem('lastWeekReset');
//     const now = new Date();
//     const weekStart = new Date(now);
    
//     // Set to start of week (Monday)
//     weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
//     weekStart.setHours(0, 0, 0, 0);
    
//     if (!lastReset || new Date(lastReset) < weekStart) {
//         // New week, reset data
//         resetWeeklyData();
//         localStorage.setItem('lastWeekReset', weekStart.toISOString());
//     }
// }

// // Create detailed history chart (for future implementation)
// function createHistoryChart() {
//     // This function can be expanded to create a more detailed history view
//     // showing water intake over longer periods (months, years)
// }

// // Export chart as image
// function exportChartAsImage() {
//     if (!weeklyChart) return;
    
//     const canvas = weeklyChart.canvas;
//     const link = document.createElement('a');
//     link.download = 'water-intake-chart.png';
//     link.href = canvas.toDataURL('image/png');
//     link.click();
// }


// chart.js - Chart visualization for HydroTrack Pro

// Global variables
let weeklyChart;
let weeklyData = [];

// Initialize the weekly chart
function initWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    
    if (!ctx) return;
    
    // Generate or load weekly data
    weeklyData = loadWeeklyData();
    
    // Create chart with improved size settings
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [
                {
                    label: 'Water Intake (ml)',
                    data: weeklyData.map(day => day.amount),
                    backgroundColor: generateGradientColors(),
                    borderColor: 'rgba(8, 145, 178, 0.8)',
                    borderWidth: 1,
                    borderRadius: 6,
                    maxBarThickness: 30,  // Reduced from 35 for better proportions
                    barPercentage: 0.7    // Added to control bar width
                },
                {
                    label: 'Daily Goal',
                    data: Array(7).fill(waterData.goal),
                    type: 'line',
                    borderColor: 'rgba(8, 145, 178, 0.5)',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,  // Changed to true for better responsiveness
            aspectRatio: 2,             // Set aspect ratio to control height relative to width
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 20,
                    bottom: 10
                }
            },
            plugins: {
                legend: {
                    display: true,       // Changed to show legend for better clarity
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            const percentage = (value / waterData.goal * 100).toFixed(0);
                            
                            if (context.datasetIndex === 0) {
                                return `${label}: ${value}ml (${percentage}% of goal)`;
                            } else {
                                return `${label}: ${value}ml`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + waterData.unit;
                        },
                        font: {
                            size: 11  // Smaller font size for Y-axis
                        },
                        maxTicksLimit: 8  // Limit number of ticks for cleaner appearance
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11  // Smaller font size for X-axis
                        }
                    }
                }
            }
        }
    });
}

// Generate gradient colors for chart bars
function generateGradientColors() {
    const colors = [];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday
    
    for (let i = 0; i < 7; i++) {
        if (i === todayIndex) {
            // Highlight today's bar
            colors.push('rgba(8, 145, 178, 0.9)');
        } else if (i < todayIndex) {
            // Past days
            colors.push('rgba(125, 211, 252, 0.7)');
        } else {
            // Future days
            colors.push('rgba(224, 242, 254, 0.5)');
        }
    }
    
    return colors;
}

// Load weekly data from storage or generate sample data
function loadWeeklyData() {
    // Try to load from storage
    const storedData = localStorage.getItem('hydrotrackWeeklyData');
    
    if (storedData) {
        return JSON.parse(storedData);
    }
    
    // Generate sample data if not available
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday
    
    const data = [];
    
    for (let i = 0; i < 7; i++) {
        if (i === todayIndex) {
            // Today's data
            data.push({
                day: i,
                amount: waterData.consumed
            });
        } else if (i < todayIndex) {
            // Past days with random data
            const randomPercentage = 0.7 + Math.random() * 0.5; // 70-120% of goal
            data.push({
                day: i,
                amount: Math.round(waterData.goal * randomPercentage)
            });
        } else {
            // Future days
            data.push({
                day: i,
                amount: 0
            });
        }
    }
    
    // Save to storage
    saveWeeklyData(data);
    
    return data;
}

// Save weekly data to storage
function saveWeeklyData(data) {
    localStorage.setItem('hydrotrackWeeklyData', JSON.stringify(data));
}

// Update today's data in the chart
function updateTodayInChart() {
    if (!weeklyChart) return;
    
    // Get today's index
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0 = Monday, 6 = Sunday
    
    // Update data
    weeklyData[todayIndex].amount = waterData.consumed;
    saveWeeklyData(weeklyData);
    
    // Update chart
    weeklyChart.data.datasets[0].data[todayIndex] = waterData.consumed;
    weeklyChart.update();
}

// Reset weekly data (called on a new week)
function resetWeeklyData() {
    weeklyData = Array(7).fill().map((_, i) => ({
        day: i,
        amount: 0
    }));
    
    // Update today's data
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;
    weeklyData[todayIndex].amount = waterData.consumed;
    
    // Save and update chart
    saveWeeklyData(weeklyData);
    
    if (weeklyChart) {
        weeklyChart.data.datasets[0].data = weeklyData.map(day => day.amount);
        weeklyChart.update();
    }
}

// Check if we need to reset weekly data (new week)
function checkWeekReset() {
    const lastReset = localStorage.getItem('lastWeekReset');
    const now = new Date();
    const weekStart = new Date(now);
    
    // Set to start of week (Monday)
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    
    if (!lastReset || new Date(lastReset) < weekStart) {
        // New week, reset data
        resetWeeklyData();
        localStorage.setItem('lastWeekReset', weekStart.toISOString());
    }
}

// Create detailed history chart (for future implementation)
function createHistoryChart() {
    // This function can be expanded to create a more detailed history view
    // showing water intake over longer periods (months, years)
}

// Export chart as image
function exportChartAsImage() {
    if (!weeklyChart) return;
    
    const canvas = weeklyChart.canvas;
    const link = document.createElement('a');
    link.download = 'water-intake-chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Resize handler to ensure chart fits container properly
function handleChartResize() {
    if (weeklyChart) {
        weeklyChart.resize();
    }
}

// Add resize event listener
window.addEventListener('resize', handleChartResize);

// Function to manually adjust chart size for specific container
function adjustChartToContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !weeklyChart) return;
    
    const containerWidth = container.clientWidth;
    
    // If container is narrow, change aspect ratio
    if (containerWidth < 500) {
        weeklyChart.options.aspectRatio = 1.5;
    } else {
        weeklyChart.options.aspectRatio = 2;
    }
    
    weeklyChart.update();
}