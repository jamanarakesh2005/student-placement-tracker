
// ========================================
// STUDENT PLACEMENT TRACKER
// Main JavaScript
// ========================================

// 1. Select HTML elements

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("categoryInput");

const taskList = document.getElementById("taskList");

const totalElement = document.getElementById("total");
const completedElement = document.getElementById("completed");
const pendingElement = document.getElementById("pending");
const percentageElement = document.getElementById("percentage");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");
const statusFilter = document.getElementById("statusFilter");

const taskCount = document.getElementById("taskCount");

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");


// 2. LocalStorage key
// Keep the same key as your old project.

const STORAGE_KEY = "tasks";


// 3. Load existing tasks safely

function loadTasks() {

    try {

        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            console.error("Invalid task data in LocalStorage.");
            return [];
        }

        // Upgrade old tasks without deleting their data.
        // Old format: { name, completed }

        return parsedTasks
            .filter(task =>
                task &&
                typeof task.name === "string"
            )
            .map(task => ({
                ...task,
                name: task.name,
                completed: Boolean(task.completed),
                category: [
                    "DSA",
                    "Java",
                    "Python",
                    "Aptitude",
                    "Interview"
                ].includes(task.category)
                    ? task.category
                    : "DSA",
                id: task.id || createId()
            }));

    } catch (error) {

        console.error("Unable to load tasks:", error);
        return [];

    }
}


// 4. Application data

let tasks = loadTasks();


// 5. Generate unique task ID

function createId() {

    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);

}


// 6. Save tasks to LocalStorage

function saveTasks() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error("Unable to save tasks:", error);

        alert(
            "Unable to save tasks. Your browser storage may be full or unavailable."
        );

    }

}


// 7. Add a new task

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskName = taskInput.value.trim();
    const category = categoryInput.value;

    if (taskName === "") {
        alert("Please enter a task name.");
        return;
    }

    const newTask = {

        id: createId(),

        name: taskName,

        category: category,

        completed: false

    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";

    // Show the newly added task even if filters were active.
    searchInput.value = "";
    filterInput.value = "All";
    statusFilter.value = "All";

    updateDashboard();

    taskInput.focus();

});


// 8. Complete or undo a task

function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    saveTasks();

    updateDashboard();

}


// 9. Delete a task

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    updateDashboard();

}


// 10. Display tasks

function renderTasks() {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const selectedCategory = filterInput.value;
    const selectedStatus = statusFilter.value;

    const filteredTasks = tasks.filter(task => {

        const matchesSearch = task.name
            .toLowerCase()
            .includes(searchValue);

        const matchesCategory =
            selectedCategory === "All" ||
            task.category === selectedCategory;

        const matchesStatus =
            selectedStatus === "All" ||
            (selectedStatus === "Completed" && task.completed) ||
            (selectedStatus === "Pending" && !task.completed);

        return matchesSearch &&
            matchesCategory &&
            matchesStatus;

    });

    taskList.innerHTML = "";

    taskCount.textContent =
        `${filteredTasks.length} tasks`;

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-message">
                <h3>No tasks found!</h3>
                <p>Add a new task or change your search filters.</p>
            </div>
        `;

        return;

    }

    filteredTasks.forEach(task => {

        const taskItem = document.createElement("div");

        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        const leftSection = document.createElement("div");
        leftSection.className = "task-left";

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.name} as completed`
        );

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("h4");
        title.textContent = task.name;

        const badge = document.createElement("span");
        badge.className = "category-badge";
        badge.textContent = task.category;

        title.appendChild(badge);

        const status = document.createElement("small");

        status.textContent = task.completed
            ? "Completed"
            : "Pending";

        info.appendChild(title);
        info.appendChild(status);

        leftSection.appendChild(checkbox);
        leftSection.appendChild(info);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Undo button for completed tasks

        if (task.completed) {

            const undoButton = document.createElement("button");

            undoButton.className = "undo-button";
            undoButton.textContent = "Undo";

            undoButton.addEventListener("click", function() {
                toggleTask(task.id);
            });

            actions.appendChild(undoButton);

        }

        // Delete button

        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

        actions.appendChild(deleteButton);

        taskItem.appendChild(leftSection);
        taskItem.appendChild(actions);

        taskList.appendChild(taskItem);

    });

}


// 11. Update statistics

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalElement.textContent = total;

    completedElement.textContent = completed;

    pendingElement.textContent = pending;

    percentageElement.textContent = percentage + "%";

    progressBar.style.width = percentage + "%";

    progressText.textContent =
        percentage + "% completed";

}


// 12. Update complete dashboard

function updateDashboard() {

    updateStatistics();

    renderTasks();

}


// 13. Search functionality

searchInput.addEventListener("input", function() {

    renderTasks();

});


// 14. Category filtering

filterInput.addEventListener("change", function() {

    renderTasks();

});


// 15. Status filtering

statusFilter.addEventListener("change", function() {

    renderTasks();

});


// 16. Sidebar category navigation

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        document.querySelectorAll(".nav-link")
            .forEach(item => {
                item.classList.remove("active");
            });

        this.classList.add("active");

        const category = this.dataset.category;

        filterInput.value = category;

        searchInput.value = "";
        statusFilter.value = "All";

        updateDashboard();

        sidebar.classList.remove("open");

    });

});


// 17. Mobile sidebar toggle

menuToggle.addEventListener("click", function() {

    sidebar.classList.toggle("open");

});


// 18. Display current date

function displayDate() {

    const dateElement =
        document.getElementById("currentDate");

    const today = new Date();

    dateElement.textContent = today.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// 19. Initialize application

function initializeDashboard() {

    saveTasks();

    displayDate();

    updateDashboard();

}


// Start the application

initializeDashboard();
