document.addEventListener('DOMContentLoaded', () => {
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('goal-input');
    const dueDateInput = document.getElementById('due-date');
    const goalList = document.getElementById('goal-list');
    const editGoalsBtn = document.getElementById('edit-goals-btn');
    const updateProgressBtn = document.getElementById('update-progress-btn');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    const achievementsContainer = document.getElementById('achievements');

    let goals = [];

    // Fetch goals from API
    fetch('http://localhost:3000/goals')
        .then(response => response.json())
        .then(data => {
            goals = data;
            goals.forEach(goal => {
                const goalItem = createGoalItem(goal);
                goalList.appendChild(goalItem);
            });
        });

    // Function to add a new goal
    function addGoal(text, dueDate) {
        const goal = {
            text: text,
            dueDate: dueDate,
            milestones: [] // Empty array to store milestones
        };

        fetch('http://localhost:3000/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goal)
        })
        .then(response => response.json())
        .then(data => {
            goals.push(data);
            const goalItem = createGoalItem(data);
            goalList.appendChild(goalItem);
        });

        // Clear input fields after adding goal
        goalInput.value = '';
        dueDateInput.value = '';

        // Example: Adding initial milestones for demonstration
        if (text === 'Learn JavaScript') {
            addMilestone(data, 'Complete Introduction');
            addMilestone(data, 'Finish Variables and Data Types');
            addMilestone(data, 'Master Functions and Scope');
        } else if (text === 'Exercise 3 times a week') {
            addMilestone(data, 'Monday Workout');
            addMilestone(data, 'Wednesday Workout');
            addMilestone(data, 'Friday Workout');
        }
    }

    // Function to create HTML for a goal item
    function createGoalItem(goal) {
        const goalItem = document.createElement('div');
        goalItem.classList.add('goal-item');
        goalItem.dataset.goalId = goal.id;
        goalItem.innerHTML = `
            <p><strong>${goal.text}</strong> - Due: ${goal.dueDate}</p>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
            <ul class="milestones"></ul>
        `;

        const editBtn = goalItem.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            editGoal(goal);
        });

        const deleteBtn = goalItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteGoal(goal);
        });

        // Add existing milestones
        goal.milestones.forEach(milestone => {
            addMilestone(goal, milestone.text, milestone.completed);
        });

        return goalItem;
    }

    // Function to add a milestone to a goal
    function addMilestone(goal, text, completed = false) {
        const milestone = {
            id: Date.now(),
            text: text,
            completed: completed
        };

        goal.milestones.push(milestone);

        fetch(`http://localhost:3000/goals/${goal.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goal)
        });

        const milestoneItem = document.createElement('li');
        milestoneItem.innerHTML = `
            <label>
                <input type="checkbox" class="milestone-checkbox" data-goal-id="${goal.id}" data-milestone-id="${milestone.id}" ${completed ? 'checked' : ''}>
                ${text}
            </label>
        `;
        const milestonesUl = document.querySelector(`.goal-item[data-goal-id="${goal.id}"] ul.milestones`);
        milestonesUl.appendChild(milestoneItem);

        const milestoneCheckbox = milestoneItem.querySelector('.milestone-checkbox');
        milestoneCheckbox.addEventListener('change', () => {
            milestone.completed = milestoneCheckbox.checked;

            const allMilestonesCompleted = goal.milestones.every(m => m.completed);
            if (allMilestonesCompleted) {
                displayAchievement(goal);
            } else {
                removeAchievement(goal);
            }

            fetch(`http://localhost:3000/goals/${goal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(goal)
            });
        });
    }

    // Function to display achievement for a completed goal
    function displayAchievement(goal) {
        const achievementItem = document.createElement('div');
        achievementItem.classList.add('achievement-item');
        achievementItem.dataset.goalId = goal.id;
        achievementItem.innerHTML = `
            <p>Congratulations! Goal "<strong>${goal.text}</strong>" achieved!</p>
        `;
        achievementsContainer.appendChild(achievementItem);

        // Send the achievement to the server
        const achievement = {
            goalId: goal.id,
            message: `Congratulations! Goal "${goal.text}" achieved!`
        };

        fetch('http://localhost:3000/achievements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(achievement)
        });
    }

    // Function to remove achievement if goal is no longer completed
    function removeAchievement(goal) {
        const achievementItem = achievementsContainer.querySelector(`.achievement-item[data-goal-id="${goal.id}"]`);
        if (achievementItem) {
            achievementItem.remove();

            // Remove the achievement from the server
            fetch(`http://localhost:3000/achievements?goalId=${goal.id}`)
                .then(response => response.json())
                .then(achievements => {
                    achievements.forEach(achievement => {
                        fetch(`http://localhost:3000/achievements/${achievement.id}`, {
                            method: 'DELETE'
                        });
                    });
                });
        }
    }

    // Function to edit a goal
    function editGoal(goal) {
        const newText = prompt('Edit goal:', goal.text);
        const newDueDate = prompt('Edit due date:', goal.dueDate);

        if (newText !== null && newText.trim() !== '' && newDueDate !== null && newDueDate.trim() !== '') {
            goal.text = newText;
            goal.dueDate = newDueDate;

            fetch(`http://localhost:3000/goals/${goal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(goal)
            })
            .then(response => response.json())
            .then(updatedGoal => {
                const goalItem = document.querySelector(`.goal-item[data-goal-id="${goal.id}"]`);
                goalItem.innerHTML = `
                    <p><strong>${updatedGoal.text}</strong> - Due: ${updatedGoal.dueDate}</p>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                    <ul class="milestones"></ul>
                `;

                // Re-add milestones for editing
                updatedGoal.milestones.forEach(milestone => {
                    addMilestone(updatedGoal, milestone.text, milestone.completed);
                });
            });
        } else {
            alert('Please enter both goal and due date.');
        }
    }

    // Function to delete a goal
    function deleteGoal(goal) {
        fetch(`http://localhost:3000/goals/${goal.id}`, {
            method: 'DELETE'
        })
        .then(() => {
            goals = goals.filter(g => g.id !== goal.id);

            const goalItem = document.querySelector(`.goal-item[data-goal-id="${goal.id}"]`);
            goalItem.remove();
        });
    }

    // Event listener for goal form submission
    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = goalInput.value.trim();
        const dueDate = dueDateInput.value;
        if (text !== '' && dueDate !== '') {
            addGoal(text, dueDate);
        } else {
            alert('Please enter both goal and due date.');
        }
    });

    // Toggle edit mode functionality
    let editMode = false; // Initial edit mode state
    editGoalsBtn.addEventListener('click', () => {
        editMode = !editMode;
        if (editMode) {
            editGoalsBtn.textContent = 'Set Goals';
            goalList.querySelectorAll('.edit-btn').forEach(editBtn => {
                editBtn.style.display = 'inline-block';
            });
            goalList.querySelectorAll('.delete-btn').forEach(deleteBtn => {
                deleteBtn.style.display = 'inline-block';
            });
        } else {
            editGoalsBtn.textContent = 'Edit Goals';
            goalList.querySelectorAll('.edit-btn').forEach(editBtn => {
                editBtn.style.display = 'none';
            });
            goalList.querySelectorAll('.delete-btn').forEach(deleteBtn => {
                deleteBtn.style.display = 'none';
            });
        }
    });

    // Event listener for update progress button
    updateProgressBtn.addEventListener('click', () => {
        const totalMilestones = document.querySelectorAll('.milestone-checkbox').length;
        let completedMilestones = 0;

        document.querySelectorAll('.milestone-checkbox').forEach(checkbox => {
            if (checkbox.checked) {
                completedMilestones++;
            }
        });

        const progressPercentage = (completedMilestones / totalMilestones) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${Math.round(progressPercentage)}% complete`;

        // Update achievements for each goal
        goals.forEach(goal => {
            const allMilestonesCompleted = goal.milestones.every(m => m.completed);
            if (allMilestonesCompleted) {
                displayAchievement(goal);
            } else {
                removeAchievement(goal);
            }
        });
    });

    // Load and display goals from localStorage on page load
    goals.forEach(goal => {
        const goalItem = createGoalItem(goal);
        goalList.appendChild(goalItem);
    });

    // Initial progress update
    updateProgressBtn.click();
});
