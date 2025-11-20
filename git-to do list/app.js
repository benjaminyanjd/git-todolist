const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const remindSelect = document.getElementById("todo-remind");
const list = document.getElementById("todo-list");
const empty = document.getElementById("empty-state");
const total = document.getElementById("total-count");
const done = document.getElementById("done-count");

const state = JSON.parse(localStorage.getItem("todos") ?? "[]");

const persist = () => localStorage.setItem("todos", JSON.stringify(state));

const needsReminder = (item) => {
  if (!item.dueDate || !item.remindBeforeHours || item.completed) return false;
  const due = new Date(item.dueDate).getTime();
  if (Number.isNaN(due)) return false;
  const now = Date.now();
  const remindThreshold = due - item.remindBeforeHours * 60 * 60 * 1000;
  return now >= remindThreshold && now <= due;
};

const formatDate = (value) => {
  if (!value) return "无截止日期";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "无截止日期";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const refresh = () => {
  list.innerHTML = "";
  state.forEach((item) => {
    const li = document.createElement("li");
    if (item.completed) li.classList.add("completed");
    if (needsReminder(item)) li.classList.add("due-soon");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completed;
    checkbox.addEventListener("change", () => {
      item.completed = !item.completed;
      persist();
      refresh();
    });

    const content = document.createElement("div");
    content.className = "content";

    const text = document.createElement("span");
    text.textContent = item.text;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = `截止：${formatDate(item.dueDate)}`;

    content.append(text, meta);

    if (needsReminder(item)) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "需要提醒";
      content.appendChild(badge);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => {
      const index = state.findIndex((todo) => todo.id === item.id);
      state.splice(index, 1);
      persist();
      refresh();
    });

    li.append(checkbox, content, remove);
    list.appendChild(li);
  });

  const count = state.length;
  const completed = state.filter((todo) => todo.completed).length;
  empty.style.display = count ? "none" : "block";
  total.textContent = `共计：${count}`;
  done.textContent = `已完成：${completed}`;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const dueDateValue = dateInput.value;
  const remindHours = Number(remindSelect.value);

  state.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
    dueDate: dueDateValue || null,
    remindBeforeHours: remindHours,
  });

  persist();
  refresh();
  form.reset();
  input.focus();
});

refresh();
setInterval(refresh, 60_000);

