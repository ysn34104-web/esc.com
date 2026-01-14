// App state
        const appState = {
            currentDate: new Date(),
            selectedDate: new Date(),
            routineData: JSON.parse(localStorage.getItem('acneRoutineData')) || {},
            tasks: [
                { 
                    id: 'mouthwashMorning', 
                    name: 'Mouth Wash', 
                    frequency: 'Morning routine', 
                    icon: 'fa-teeth',
                    iconClass: 'task-icon-1',
                    completed: false 
                },
                { 
                    id: 'mouthwashNight', 
                    name: 'Mouth Wash', 
                    frequency: 'Night routine', 
                    icon: 'fa-teeth',
                    iconClass: 'task-icon-2',
                    completed: false 
                },
                { 
                    id: 'acneCream', 
                    name: 'Apply Acne Cream', 
                    frequency: 'Before sleeping', 
                    icon: 'fa-cream',
                    iconClass: 'task-icon-3',
                    completed: false 
                },
                { 
                    id: 'water', 
                    name: 'Drink 8 Glasses of Water', 
                    frequency: 'Throughout the day', 
                    icon: 'fa-glass-water',
                    iconClass: 'task-icon-4',
                    completed: false 
                }
            ]
        };

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Set up event listeners
            setupEventListeners();
            
            // Display today's date
            updateDateDisplay();
            
            // Initialize tasks
            loadTasksForDate(appState.selectedDate);
            
            // Generate calendar
            generateCalendar();
            
            // Update progress
            updateProgress();
            
            // Check if 30 days are completed
            check30DayCompletion();
        });

        // Set up event listeners
        function setupEventListeners() {
            // Calendar navigation
            document.getElementById('prevBtn').addEventListener('click', () => changeDay(-1));
            document.getElementById('nextBtn').addEventListener('click', () => changeDay(1));
            document.getElementById('todayBtn').addEventListener('click', goToToday);
            
            // Restart button
            document.getElementById('restartBtn').addEventListener('click', restartRoutine);
        }

        // Update date display
        function updateDateDisplay() {
            const todayElement = document.getElementById('todayDate');
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            todayElement.textContent = appState.selectedDate.toLocaleDateString('en-US', options);
        }

        // Load tasks for a specific date
        function loadTasksForDate(date) {
            const dateKey = formatDateKey(date);
            const savedTasks = appState.routineData[dateKey];
            
            // Reset tasks
            appState.tasks.forEach(task => task.completed = false);
            
            // Load saved tasks if they exist
            if (savedTasks) {
                appState.tasks.forEach(task => {
                    if (savedTasks[task.id]) {
                        task.completed = savedTasks[task.id];
                    }
                });
            }
            
            renderTasks();
        }

        // Render tasks in the UI
        function renderTasks() {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            appState.tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskElement.innerHTML = `
                    <div class="task-icon ${task.iconClass}">
                        <i class="fas ${task.icon}"></i>
                    </div>
                    <div class="task-details">
                        <div class="task-name">${task.name}</div>
                        <div class="task-frequency">
                            <i class="fas fa-clock"></i> ${task.frequency}
                        </div>
                    </div>
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                `;
                
                // Add click event to toggle task completion
                const checkbox = taskElement.querySelector('.task-checkbox');
                checkbox.addEventListener('click', () => toggleTaskCompletion(task.id));
                
                taskList.appendChild(taskElement);
            });
            
            // Update motivation message
            updateMotivationMessage();
        }

        // Toggle task completion
        function toggleTaskCompletion(taskId) {
            const task = appState.tasks.find(t => t.id === taskId);
            if (!task) return;
            
            task.completed = !task.completed;
            
            // Save to app state
            const dateKey = formatDateKey(appState.selectedDate);
            if (!appState.routineData[dateKey]) {
                appState.routineData[dateKey] = {};
            }
            
            appState.routineData[dateKey][taskId] = task.completed;
            
            // Save to localStorage
            localStorage.setItem('acneRoutineData', JSON.stringify(appState.routineData));
            
            // Re-render tasks
            renderTasks();
            
            // Update progress
            updateProgress();
            
            // Update calendar
            updateCalendarDay(appState.selectedDate);
            
            // Check if 30 days are completed
            check30DayCompletion();
            
            // Show a subtle animation effect
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`).closest('.task-item');
            if (task.completed) {
                taskElement.style.animation = 'none';
                setTimeout(() => {
                    taskElement.style.animation = 'fadeIn 0.5s ease';
                }, 10);
            }
        }

        // Format date as YYYY-MM-DD key
        function formatDateKey(date) {
            return date.toISOString().split('T')[0];
        }

        // Generate calendar for the current month
        function generateCalendar() {
            const calendarGrid = document.getElementById('calendarGrid');
            
            // Clear existing days (keep headers)
            const dayElements = calendarGrid.querySelectorAll('.calendar-day');
            dayElements.forEach(day => {
                if (!day.classList.contains('calendar-day-header')) {
                    day.remove();
                }
            });
            
            // Get the current date
            const today = new Date();
            const currentDay = today.getDate();
            
            // Create 30 days for the plan
            for (let day = 1; day <= 30; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.dataset.day = day;
                
                // Create a date object for this day
                const dayDate = new Date(today);
                dayDate.setDate(day);
                
                // Check if this is the selected day
                if (day === appState.selectedDate.getDate()) {
                    dayElement.classList.add('active');
                }
                
                dayElement.innerHTML = `
                    <div class="day-number">${day}</div>
                    <div class="day-progress" id="progress-${day}"></div>
                `;
                
                // Add click event
                dayElement.addEventListener('click', () => selectDay(day));
                
                calendarGrid.appendChild(dayElement);
            }
            
            // Update progress for all days
            updateAllCalendarDays();
        }

        // Select a specific day
        function selectDay(day) {
            const selectedDate = new Date();
            selectedDate.setDate(day);
            appState.selectedDate = selectedDate;
            
            // Update active day in calendar
            document.querySelectorAll('.calendar-day').forEach(dayElement => {
                dayElement.classList.remove('active');
                if (parseInt(dayElement.dataset.day) === day) {
                    dayElement.classList.add('active');
                }
            });
            
            // Load tasks for selected date
            loadTasksForDate(selectedDate);
            
            // Update date display
            updateDateDisplay();
            
            // Add a subtle animation
            const calendarGrid = document.getElementById('calendarGrid');
            calendarGrid.style.opacity = '0.9';
            setTimeout(() => {
                calendarGrid.style.opacity = '1';
            }, 300);
        }

        // Update progress for all calendar days
        function updateAllCalendarDays() {
            const today = new Date();
            
            for (let day = 1; day <= 30; day++) {
                const dayDate = new Date(today);
                dayDate.setDate(day);
                updateCalendarDay(dayDate);
            }
        }

        // Update progress for a specific day in calendar
        function updateCalendarDay(date) {
            const day = date.getDate();
            const dateKey = formatDateKey(date);
            const dayData = appState.routineData[dateKey];
            
            const progressElement = document.getElementById(`progress-${day}`);
            if (!progressElement) return;
            
            if (dayData) {
                // Calculate completion percentage
                const completedTasks = Object.values(dayData).filter(Boolean).length;
                const totalTasks = 4;
                const completionPercentage = (completedTasks / totalTasks) * 100;
                
                progressElement.style.transform = `scaleX(${completionPercentage / 100})`;
                
                // Set color based on completion
                progressElement.className = 'day-progress';
                if (completionPercentage === 100) {
                    progressElement.classList.add('high');
                } else if (completionPercentage >= 50) {
                    progressElement.classList.add('medium');
                } else {
                    progressElement.classList.add('low');
                }
            } else {
                progressElement.style.transform = 'scaleX(0)';
                progressElement.className = 'day-progress';
            }
        }

        // Update overall progress
        function updateProgress() {
            // Calculate completed days
            let fullyCompletedDays = 0;
            let totalCompletion = 0;
            let currentStreak = 0;
            let bestStreak = 0;
            
            // Get today's date
            const today = new Date();
            const currentDay = today.getDate();
            
            // Check each of the 30 days
            for (let day = 1; day <= 30; day++) {
                const dayDate = new Date(today);
                dayDate.setDate(day);
                const dateKey = formatDateKey(dayDate);
                const dayData = appState.routineData[dateKey];
                
                if (dayData) {
                    // Count completed tasks
                    const completedTasks = Object.values(dayData).filter(Boolean).length;
                    totalCompletion += completedTasks;
                    
                    // Check if day is fully completed
                    if (completedTasks === 4) {
                        fullyCompletedDays++;
                        
                        // Update streak
                        if (day <= currentDay) {
                            currentStreak++;
                            bestStreak = Math.max(bestStreak, currentStreak);
                        }
                    } else {
                        if (day <= currentDay) {
                            currentStreak = 0;
                        }
                    }
                } else {
                    if (day <= currentDay) {
                        currentStreak = 0;
                    }
                }
            }
            
            // Calculate overall completion percentage
            const totalPossibleTasks = 30 * 4;
            const overallCompletion = totalCompletion / totalPossibleTasks * 100;
            
            // Update UI
            document.getElementById('progressBar').style.width = `${overallCompletion}%`;
            document.getElementById('overallPercentage').textContent = `${overallCompletion.toFixed(1)}%`;
            
            document.getElementById('fullDays').textContent = fullyCompletedDays;
            document.getElementById('completionRate').textContent = `${overallCompletion.toFixed(1)}%`;
            document.getElementById('currentStreak').textContent = currentStreak;
        }

        // Update motivation message
        function updateMotivationMessage() {
            const messageElement = document.getElementById('motivationMessage');
            const completedTasks = appState.tasks.filter(task => task.completed).length;
            const totalTasks = appState.tasks.length;
            
            let message = '';
            let icon = 'fa-heart';
            
            if (completedTasks === 0) {
                message = "Start your day right! Complete your first task to begin your clear skin journey.";
                icon = 'fa-seedling';
            } else if (completedTasks === totalTasks) {
                message = "Amazing! You've completed all tasks for today. Your skin will thank you!";
                icon = 'fa-trophy';
            } else if (completedTasks >= totalTasks / 2) {
                message = "You're doing great! Keep going to complete all tasks for today.";
                icon = 'fa-thumbs-up';
            } else {
                message = "Consistency is key to clear skin! You've got this!";
                icon = 'fa-heart';
            }
            
            messageElement.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        }

        // Check if 30 days are completed
        function check30DayCompletion() {
            // Count days with data
            let daysWithData = 0;
            const today = new Date();
            
            for (let day = 1; day <= 30; day++) {
                const dayDate = new Date(today);
                dayDate.setDate(day);
                const dateKey = formatDateKey(dayDate);
                
                if (appState.routineData[dateKey]) {
                    daysWithData++;
                }
            }
            
            // If all 30 days have data, show results
            if (daysWithData >= 30) {
                showResults();
            }
        }

        // Show results section
        function showResults() {
            // Calculate final statistics
            let fullyCompletedDays = 0;
            let totalCompletion = 0;
            let bestStreak = 0;
            let currentStreak = 0;
            
            for (let day = 1; day <= 30; day++) {
                const dayDate = new Date();
                dayDate.setDate(day);
                const dateKey = formatDateKey(dayDate);
                const dayData = appState.routineData[dateKey];
                
                if (dayData) {
                    const completedTasks = Object.values(dayData).filter(Boolean).length;
                    totalCompletion += completedTasks;
                    
                    if (completedTasks === 4) {
                        fullyCompletedDays++;
                        currentStreak++;
                        bestStreak = Math.max(bestStreak, currentStreak);
                    } else {
                        currentStreak = 0;
                    }
                } else {
                    currentStreak = 0;
                }
            }
            
            const overallCompletion = (totalCompletion / (30 * 4)) * 100;
            
            // Update results UI
            document.getElementById('resultFullDays').textContent = fullyCompletedDays;
            document.getElementById('resultConsistency').textContent = `${overallCompletion.toFixed(1)}%`;
            document.getElementById('resultBestStreak').textContent = bestStreak;
            
            // Update results message based on consistency
            const messageElement = document.querySelector('.results-message');
            if (overallCompletion >= 90) {
                messageElement.textContent = "Outstanding! You've shown incredible consistency in your 30-day acne clear journey. Your skin is now clearer, healthier, and glowing. Keep up these excellent habits for lasting results!";
            } else if (overallCompletion >= 70) {
                messageElement.textContent = "Great job! You've made significant progress in your 30-day acne clear journey. Your skin is noticeably improved. Continue with your routine for even better results!";
            } else {
                messageElement.textContent = "Congratulations on completing your 30-day journey! You've taken important steps toward clearer skin. With a bit more consistency, you'll see even better results in your next 30-day plan!";
            }
            
            // Show results section
            document.getElementById('resultsSection').classList.add('active');
            
            // Scroll to results
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        }

        // Change day (navigate forward/backward)
        function changeDay(direction) {
            const newDate = new Date(appState.selectedDate);
            newDate.setDate(newDate.getDate() + direction);
            
            // Limit to 30 days
            if (newDate.getDate() < 1) newDate.setDate(1);
            if (newDate.getDate() > 30) newDate.setDate(30);
            
            appState.selectedDate = newDate;
            selectDay(newDate.getDate());
        }

        // Go to today
        function goToToday() {
            const today = new Date();
            const currentDay = Math.min(today.getDate(), 30);
            appState.selectedDate = new Date();
            appState.selectedDate.setDate(currentDay);
            selectDay(currentDay);
        }

        // Restart routine
        function restartRoutine() {
            if (confirm("Are you sure you want to start a new 30-day journey? This will reset all your progress.")) {
                // Clear data
                appState.routineData = {};
                localStorage.removeItem('acneRoutineData');
                
                // Reset tasks
                appState.tasks.forEach(task => task.completed = false);
                
                // Hide results
                document.getElementById('resultsSection').classList.remove('active');
                
                // Reset to today
                const today = new Date();
                const currentDay = Math.min(today.getDate(), 30);
                appState.selectedDate = new Date();
                appState.selectedDate.setDate(currentDay);
                
                // Update UI
                selectDay(currentDay);
                renderTasks();
                updateProgress();
                updateAllCalendarDays();
                
                // Show success animation
                const logoCircle = document.querySelector('.logo-circle');
                logoCircle.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    logoCircle.style.transform = 'scale(1)';
                }, 300);
            }
        }
