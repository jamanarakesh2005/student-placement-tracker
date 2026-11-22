
// ===============================================
// PREPPILOT - STUDENT PLACEMENT TRACKER
// Original JavaScript Implementation
// ===============================================

"use strict";


// 1. SELECT HTML ELEMENTS

const elements = {
    taskForm: document.getElementById("taskForm"),
    taskInput: document.getElementById("taskInput"),
    categoryInput: document.getElementById("categoryInput"),
    priorityInput: document.getElementById("priorityInput"),
    deadlineInput: document.getElementById("deadlineInput"),

    taskList: document.getElementById("taskList"),
    searchInput: document.getElementById("searchInput"),
    filterInput: document.getElementById("filterInput"),
    statusFilter: document.getElementById("statusFilter"),

    total: document.getElementById("total"),
    completed: document.getElementById("completed"),
    pending: document.getElementById("pending"),
    percentage: document.getElementById("percentage"),

    progressBar: document.getElementById("progressBar"),
    progressText: document.getElementById("progressText"),
    progressSummary: document.getElementById("progressSummary"),

    taskCount: document.getElementById("taskCount"),
    currentDate: document.getElementById("currentDate"),

    sidebar: document.getElementById("sidebar"),
    menuToggle: document.getElementById("menuToggle")
};


// 2. APPLICATION CONFIGURATION

const STORAGE_KEY = "tasks";

const CATEGORIES = [
    "DSA",
    "Java",
    "Python",
    "Aptitude",
    "Interview"
];

const PRIORITIES = [
    "High",
    "Medium",
    "Low"
];


// 3. APPLICATION STATE

let tasks = loadTasks();

let filters = {
    search: "",
    category: "All",
    status: "All"
};


// 4. GENERATE UNIQUE TASK ID

function generateId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;

}


// 5. LOAD DATA FROM LOCAL STORAGE

function loadTasks() {

    try {

        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData.map((task, index) => {

            const oldTask = task && typeof task === "object"
                ? task
                : {};

            const category = CATEGORIES.includes(oldTask.category)
                ? oldTask.category
                : "DSA";

            const priority = PRIORITIES.includes(oldTask.priority)
                ? oldTask.priority
                : "Medium";

            return {
                id: String(oldTask.id ?? `legacy-${index}`),
                name: String(
                    oldTask.name ??
                    oldTask.title ??
                    oldTask.text ??
                    ""
                ).trim(),
                category,
                priority,
                completed: oldTask.completed === true,
                deadline: isValidDate(oldTask.deadline)
                    ? oldTask.deadline
                    : ""
            };

        }).filter(task => task.name.length > 0);

    } catch (error) {

        console.error("Error loading tasks:", error);

        return [];

    }

}


// 6. SAVE DATA

function saveTasks() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

        return true;

    } catch (error) {

        console.error("Unable to save tasks:", error);

        alert(
            "Your browser could not save the tasks. " +
            "Check available storage."
        );

        return false;

    }

}


// 7. DATE VALIDATION

function isValidDate(value) {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(value + "T00:00:00");

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );

}


// 8. ADD TASK

function addTask(event) {

    event.preventDefault();

    const name = elements.taskInput.value.trim();

    const category = elements.categoryInput.value;

    const priority = elements.priorityInput.value;

    const deadline = elements.deadlineInput.value;

    if (!name) {

        alert("Please enter a task name.");

        elements.taskInput.focus();

        return;

    }

    if (name.length > 120) {

        alert("Task name cannot exceed 120 characters.");

        return;

    }

    if (!CATEGORIES.includes(category)) {

        alert("Please select a valid category.");

        return;

    }

    if (!PRIORITIES.includes(priority)) {

        alert("Please select a valid priority.");

        return;

    }

    if (deadline && !isValidDate(deadline)) {

        alert("Please enter a valid deadline.");

        return;

    }

    const newTask = {
        id: generateId(),
        name,
        category,
        priority,
        deadline,
        completed: false
    };

    tasks.unshift(newTask);

    saveTasks();

    elements.taskForm.reset();

    elements.priorityInput.value = "Medium";

    elements.taskInput.focus();

    renderDashboard();

}


// 9. EDIT TASK

function editTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    const updatedName = prompt(
        "Enter the updated task name:",
        task.name
    );

    if (updatedName === null) return;

    const cleanName = updatedName.trim();

    if (!cleanName) {

        alert("Task name cannot be empty.");

        return;

    }

    if (cleanName.length > 120) {

        alert("Task name cannot exceed 120 characters.");

        return;

    }

    task.name = cleanName;

    saveTasks();

    renderDashboard();

}


// 10. DELETE TASK

function deleteTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    const confirmation = confirm(
        `Are you sure you want to delete "${task.name}"?`
    );

    if (!confirmation) return;

    tasks = tasks.filter(item => item.id !== id);

    saveTasks();

    renderDashboard();

}


// 11. CHANGE TASK COMPLETION

function toggleTask(id, completed) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.completed = completed;

    saveTasks();

    renderDashboard();

}


// 12. CHANGE PRIORITY

function changePriority(id, priority) {

    const task = tasks.find(item => item.id === id);

    if (!task || !PRIORITIES.includes(priority)) return;

    task.priority = priority;

    saveTasks();

    renderDashboard();

}


// 13. CHANGE DEADLINE

function changeDeadline(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    const updatedDeadline = prompt(
        "Enter deadline in YYYY-MM-DD format. Leave blank to remove it:",
        task.deadline
    );

    if (updatedDeadline === null) return;

    const value = updatedDeadline.trim();

    if (value && !isValidDate(value)) {

        alert("Invalid date. Use YYYY-MM-DD format.");

        return;

    }

    task.deadline = value;

    saveTasks();

    renderDashboard();

}


// 14. CREATE HTML ELEMENTS SAFELY

function createElement(tag, className, text) {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;

}


// 15. CREATE ACTION BUTTON

function createButton(label, action, id, extraClass = "") {

    const button = createElement(
        "button",
        extraClass,
        label
    );

    button.type = "button";

    button.dataset.action = action;

    button.dataset.id = id;

    return button;

}


// 16. CREATE PRIORITY SELECT

function createPrioritySelect(task) {

    const select = createElement(
        "select",
        "priority-select"
    );

    select.dataset.action = "priority";

    select.dataset.id = task.id;

    select.setAttribute(
        "aria-label",
        `Priority for ${task.name}`
    );

    PRIORITIES.forEach(priority => {

        const option = createElement(
            "option",
            "",
            priority
        );

        option.value = priority;

        option.selected = task.priority === priority;

        select.appendChild(option);

    });

    return select;

}


// 17. CHECK OVERDUE DEADLINES

function isOverdue(task) {

    if (!task.deadline || task.completed) {
        return false;
    }

    const today = new Date();

    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    return task.deadline < localToday;

}


// 18. BUILD TASK CARD

function createTaskCard(task) {

    const card = createElement(
        "article",
        "task-item"
    );

    card.dataset.id = task.id;

    if (task.completed) {
        card.classList.add("completed-task");
    }

    const details = createElement(
        "div",
        "task-details"
    );

    const title = createElement(
        "div",
        "task-title"
    );

    const checkbox = createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = task.completed;

    checkbox.dataset.action = "toggle";

    checkbox.dataset.id = task.id;

    checkbox.setAttribute(
        "aria-label",
        `Mark ${task.name} as completed`
    );

    const name = createElement(
        "span",
        "task-name",
        task.name
    );

    title.append(checkbox, name);

    const meta = createElement(
        "div",
        "task-meta"
    );

    const category = createElement(
        "span",
        "category-badge",
        task.category
    );

    const priority = createElement(
        "span",
        `priority-badge priority-${task.priority.toLowerCase()}`,
        `${task.priority} Priority`
    );

    const deadlineText = task.deadline
        ? `Due: ${task.deadline}`
        : "No deadline";

    const deadline = createElement(
        "span",
        "deadline",
        deadlineText
    );

    if (isOverdue(task)) {
        deadline.classList.add("overdue");
        deadline.textContent += " · Overdue";
    }

    meta.append(category, priority, deadline);

    details.append(title, meta);

    const actions = createElement(
        "div",
        "task-actions"
    );

    const editButton = createButton(
        "Edit",
        "edit",
        task.id
    );

    const deadlineButton = createButton(
        "Deadline",
        "deadline",
        task.id
    );

    const deleteButton = createButton(
        "Delete",
        "delete",
        task.id
    );

    const prioritySelect = createPrioritySelect(task);

    actions.append(
        editButton,
        deadlineButton,
        prioritySelect,
        deleteButton
    );

    card.append(details, actions);

    return card;

}


// 19. APPLY SEARCH AND FILTERS

function getFilteredTasks() {

    return tasks.filter(task => {

        const matchesSearch = task.name
            .toLowerCase()
            .includes(filters.search);

        const matchesCategory =
            filters.category === "All" ||
            task.category === filters.category;

        const matchesStatus =
            filters.status === "All" ||
            (filters.status === "Completed" && task.completed) ||
            (filters.status === "Pending" && !task.completed);

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
        );

    });

}


// 20. DISPLAY TASKS

function renderTasks() {

    const list = elements.taskList;

    list.replaceChildren();

    const visibleTasks = getFilteredTasks();

    elements.taskCount.textContent =
        `${visibleTasks.length} ${visibleTasks.length === 1 ? "Task" : "Tasks"}`;

    if (visibleTasks.length === 0) {

        const emptyState = createElement(
            "div",
            "empty-state"
        );

        const heading = createElement(
            "h3",
            "",
            tasks.length === 0
                ? "Your preparation journey starts here!"
                : "No matching tasks found"
        );

        const message = createElement(
            "p",
            "",
            tasks.length === 0
                ? "Add your first placement preparation task."
                : "Try changing your search or filters."
        );

        emptyState.append(heading, message);

        list.appendChild(emptyState);

        return;

    }

    const fragment = document.createDocumentFragment();

    visibleTasks.forEach(task => {

        fragment.appendChild(
            createTaskCard(task)
        );

    });

    list.appendChild(fragment);

}


// 21. UPDATE STATISTICS

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    elements.total.textContent = total;

    elements.completed.textContent = completed;

    elements.pending.textContent = pending;

    elements.percentage.textContent = `${progress}%`;

    elements.progressBar.style.width = `${progress}%`;

    elements.progressBar.setAttribute(
        "aria-valuenow",
        progress
    );

    elements.progressText.textContent =
        `${progress}% Completed`;

    elements.progressSummary.textContent =
        `${completed} of ${total} tasks completed`;

}


// 22. UPDATE DASHBOARD

function renderDashboard() {

    renderTasks();

    updateStatistics();

}


// 23. SEARCH EVENT

elements.searchInput.addEventListener(
    "input",
    event => {

        filters.search = event.target.value
            .trim()
            .toLowerCase();

        renderTasks();

    }
);


// 24. CATEGORY FILTER

elements.filterInput.addEventListener(
    "change",
    event => {

        filters.category = event.target.value;

        updateNavigation();

        renderTasks();

    }
);


// 25. STATUS FILTER

elements.statusFilter.addEventListener(
    "change",
    event => {

        filters.status = event.target.value;

        updateNavigation();

        renderTasks();

    }
);


// 26. TASK LIST CLICK EVENTS

elements.taskList.addEventListener(
    "click",
    event => {

        const button = event.target.closest(
            "button[data-action]"
        );

        if (!button) return;

        const id = button.dataset.id;

        const action = button.dataset.action;

        switch (action) {

            case "edit":
                editTask(id);
                break;

            case "delete":
                deleteTask(id);
                break;

            case "deadline":
                changeDeadline(id);
                break;

        }

    }
);


// 27. TASK LIST CHANGE EVENTS

elements.taskList.addEventListener(
    "change",
    event => {

        const target = event.target;

        const action = target.dataset.action;

        const id = target.dataset.id;

        if (!action || !id) return;

        if (action === "toggle") {

            toggleTask(id, target.checked);

        }

        if (action === "priority") {

            changePriority(id, target.value);

        }

    }
);


// 28. SIDEBAR NAVIGATION

function updateNavigation() {

    document.querySelectorAll(".nav-item").forEach(button => {

        const category = button.dataset.category;

        const status = button.dataset.status;

        const activeCategory =
            category !== undefined &&
            category === filters.category &&
            filters.status === "All";

        const activeStatus =
            status !== undefined &&
            status === filters.status &&
            filters.category === "All";

        button.classList.toggle(
            "active",
            activeCategory || activeStatus
        );

    });

}


// 29. SIDEBAR CLICK EVENTS

elements.sidebar.addEventListener(
    "click",
    event => {

        const button = event.target.closest(".nav-item");

        if (!button) return;

        if (button.dataset.category !== undefined) {

            filters.category = button.dataset.category;

            elements.filterInput.value = filters.category;

            filters.status = "All";

            elements.statusFilter.value = "All";

        }

        if (button.dataset.status !== undefined) {

            filters.status = button.dataset.status;

            elements.statusFilter.value = filters.status;

            filters.category = "All";

            elements.filterInput.value = "All";

        }

        updateNavigation();

        renderTasks();

        elements.sidebar.classList.remove("active");

    }
);


// 30. MOBILE SIDEBAR

elements.menuToggle.addEventListener(
    "click",
    () => {

        elements.sidebar.classList.toggle("active");

    }
);


// 31. ADD TASK FORM EVENT

elements.taskForm.addEventListener(
    "submit",
    addTask
);


// 32. DISPLAY CURRENT DATE

function displayDate() {

    const today = new Date();

    elements.currentDate.textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}


// 33. INITIALIZE APPLICATION

function initializeApp() {

    displayDate();

    updateNavigation();

    renderDashboard();

    console.log(
        "PrepPilot dashboard initialized successfully!"
    );

}


// START APPLICATION

initializeApp();
