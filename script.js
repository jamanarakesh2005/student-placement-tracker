
const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = task.name;
    label.style.textDecoration =
      task.completed ? "line-through" : "none";

    const completeButton = document.createElement("button");
    completeButton.textContent =
      task.completed ? "Undo" : "Complete";

    completeButton.addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.append(label, completeButton, deleteButton);
    list.appendChild(li);
  });

  const completed = tasks.filter(
    task => task.completed
  ).length;

  document.getElementById("total").textContent = tasks.length;
  document.getElementById("completed").textContent = completed;
  document.getElementById("pending").textContent =
    tasks.length - completed;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = input.value.trim();

  if (!name) return;

  tasks.push({
    name: name,
    completed: false
  });

  saveTasks();
  renderTasks();

  input.value = "";
});

renderTasks();