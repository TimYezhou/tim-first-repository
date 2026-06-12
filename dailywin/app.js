const STORAGE_KEY = 'dailywin_habits';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function addHabit() {
  const input = document.getElementById('habit-input');
  const name = input.value.trim();
  if (!name) return;

  const habits = loadHabits();
  habits.push({ id: Date.now(), name, streak: 0, lastDone: null });
  saveHabits(habits);
  input.value = '';
  render();
}

function toggleHabit(id) {
  const habits = loadHabits();
  const today = todayStr();
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  if (habit.lastDone === today) {
    // Undo check-in: revert streak
    habit.lastDone = null;
    habit.streak = Math.max(0, habit.streak - 1);
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (habit.lastDone === yStr) {
      habit.streak += 1;
    } else {
      habit.streak = 1;
    }
    habit.lastDone = today;
  }

  saveHabits(habits);
  render();
}

function deleteHabit(id) {
  const habits = loadHabits().filter(h => h.id !== id);
  saveHabits(habits);
  render();
}

function streakLabel(habit) {
  const today = todayStr();
  const isDone = habit.lastDone === today;
  if (habit.streak === 0) return 'No streak yet';
  if (habit.streak === 1 && !isDone) return 'Start your streak today!';
  return `<span>${habit.streak} day streak</span> 🔥`;
}

function render() {
  const habits = loadHabits();
  const today = todayStr();
  const list = document.getElementById('habits-list');
  const emptyMsg = document.getElementById('empty-msg');

  list.innerHTML = '';

  if (habits.length === 0) {
    emptyMsg.classList.remove('hidden');
  } else {
    emptyMsg.classList.add('hidden');
    habits.forEach(habit => {
      const isDone = habit.lastDone === today;
      const card = document.createElement('div');
      card.className = 'habit-card' + (isDone ? ' done' : '');

      card.innerHTML = `
        <button class="check-btn" onclick="toggleHabit(${habit.id})">${isDone ? '✓' : ''}</button>
        <div class="habit-info">
          <div class="habit-name">${escapeHtml(habit.name)}</div>
          <div class="habit-streak">${streakLabel(habit)}</div>
        </div>
        <button class="delete-btn" onclick="deleteHabit(${habit.id})">✕</button>
      `;
      list.appendChild(card);
    });
  }
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function setTodayLabel() {
  const label = document.getElementById('today-label');
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  label.textContent = new Date().toLocaleDateString(undefined, opts);
}

document.getElementById('habit-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

setTodayLabel();
render();
