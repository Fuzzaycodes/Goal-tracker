document.addEventListener('DOMContentLoaded', () => {
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('goal-input');
    const dueDateInput = document.getElementById('due-date');
    const goalList = document.getElementById('goal-list');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    const API_URL = 'https://my-json-server.typicode.com/Fuzzaycodes/Goal-tracker/goals'; 

    let goals = [];

    
    loadGoals();

    // Event listener for form submission
    goalForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const goalText = goalInput.value;
        const dueDate = dueDateInput.value;

        if (goalText && dueDate) {
            const newGoal = {
                text: goalText,
                dueDate: dueDate,
                milestones: [],
                progressPercentage: 0,
                completed: false
            };

            if (goalInput.dataset.editingGoalId) {
                await updateGoal(goalInput.dataset.editingGoalId, newGoal);
                delete goalInput.dataset.editingGoalId; 
            } else {
                await createGoal(newGoal);
            }

            goalInput.value = '';
            dueDateInput.value = '';
            loadGoals();
        }
    });

    // Function to render goals
    function renderGoals() {
        goalList.innerHTML = '';
        goals.forEach((goal) => {
            const goalItem = document.createElement('div');
            goalItem.className = 'goal-item p-4 border border-gray-300 rounded-md mb-2';
            goalItem.innerHTML = `
                <h3 class="text-xl font-bold">${goal.text}</h3>
                <p class="text-gray-600">Due: ${goal.dueDate}</p>
                <div class="milestones">
                    <h4 class="font-semibold mb-2">Milestones:</h4>
                    ${goal.milestones.map((milestone, index) => `
                        <label>
                            <input type="checkbox" class="milestone-checkbox" data-goal-id="${goal.id}" data-milestone-index="${index}" ${milestone.completed ? 'checked' : ''}>
                            ${milestone.text}
                        </label><br>
                    `).join('')}
                    <button class="add-milestone-btn bg-blue-500 text-white px-2 py-1 rounded-md mt-2" data-goal-id="${goal.id}">Add Milestone</button>
                    <button class="edit-goal-btn bg-yellow-500 text-white px-2 py-1 rounded-md mt-2" data-goal-id="${goal.id}">Edit</button>
                    <button class="delete-goal-btn bg-red-500 text-white px-2 py-1 rounded-md mt-2" data-goal-id="${goal.id}">Delete</button>
                </div>
            `;
            goalList.appendChild(goalItem);
        });
        updateOverallProgress();
    }

    // Function to create a new goal on the server
    async function createGoal(goal) {
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goal)
        });
        loadGoals();
    }

    // Function to update an existing goal on the server
    async function updateGoal(id, updatedGoal) {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedGoal)
        });
        loadGoals();
    }

    // Function to delete a goal from the server
    async function deleteGoal(id) {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        loadGoals();
    }

    // Function to load goals from the server
    async function loadGoals() {
        const response = await fetch(API_URL);
        goals = await response.json();
        renderGoals();
    }

    // Event listener for the milestone checkbox
    goalList.addEventListener('change', async (event) => {
        if (event.target.classList.contains('milestone-checkbox')) {
            const goalId = event.target.getAttribute('data-goal-id');
            const milestoneIndex = event.target.getAttribute('data-milestone-index');
            const goal = goals.find(g => g.id == goalId);
            if (goal) {
                goal.milestones[milestoneIndex].completed = event.target.checked;
                await updateGoal(goalId, goal);
                updateProgress(goal);
                renderGoals();
            }
        }
    });

    // Event listener for adding, editing, and deleting milestones/goals
    goalList.addEventListener('click', async (event) => {
        const goalId = event.target.getAttribute('data-goal-id');

        if (event.target.classList.contains('add-milestone-btn')) {
            const milestoneText = prompt('Enter milestone:');
            if (milestoneText) {
                const goal = goals.find(g => g.id == goalId);
                if (goal) {
                    goal.milestones.push({ text: milestoneText, completed: false });
                    await updateGoal(goalId, goal);
                    renderGoals();
                }
            }
        } else if (event.target.classList.contains('edit-goal-btn')) {
            const goal = goals.find(g => g.id == goalId);
            if (goal) {
                goalInput.value = goal.text;
                dueDateInput.value = goal.dueDate;
                goalInput.dataset.editingGoalId = goalId;
            }
        } else if (event.target.classList.contains('delete-goal-btn')) {
            if (confirm('Are you sure you want to delete this goal?')) {
                await deleteGoal(goalId);
                renderGoals();
            }
        }
    });

    // Function to update progress
    function updateProgress(goal) {
        const totalMilestones = goal.milestones.length;
        const completedMilestones = goal.milestones.filter(m => m.completed).length;
        goal.progressPercentage = totalMilestones === 0 ? 0 : (completedMilestones / totalMilestones) * 100;
        progressBar.style.width = `${goal.progressPercentage}%`;
        progressText.textContent = `${goal.progressPercentage.toFixed(0)}% complete`;
    }

    // Function to update the overall progress
    function updateOverallProgress() {
        let totalMilestones = 0;
        let completedMilestones = 0;
        goals.forEach(goal => {
            totalMilestones += goal.milestones.length;
            completedMilestones += goal.milestones.filter(m => m.completed).length;
        });
        const overallProgress = totalMilestones === 0 ? 0 : (completedMilestones / totalMilestones) * 100;
        progressBar.style.width = `${overallProgress}%`;
        progressText.textContent = `${overallProgress.toFixed(0)}% complete`;
    }
});
