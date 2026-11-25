const levels = [
  {
    title: "Animals",
    icon: "🐼",
    size: 9,
    words: [
      { word: "CAT", clue: "A small animal that says meow" },
      { word: "DOG", clue: "A pet known as man's friend" },
      { word: "FISH", clue: "An animal that swims underwater" },
      { word: "OWL", clue: "A bird that usually hunts at night" },
      { word: "BIRD", clue: "An animal with feathers and wings" },
      { word: "FOX", clue: "A clever wild animal with a bushy tail" }
    ]
  },
  {
    title: "Food",
    icon: "🍎",
    size: 9,
    words: [
      { word: "APPLE", clue: "A round fruit that may be red or green" },
      { word: "BREAD", clue: "A baked food made mainly from flour" },
      { word: "RICE", clue: "Small white grains eaten in many countries" },
      { word: "EGG", clue: "A food produced by a hen" },
      { word: "MILK", clue: "A white drink from cows" },
      { word: "CAKE", clue: "A sweet baked food for celebrations" }
    ]
  },
  {
    title: "School",
    icon: "✏️",
    size: 10,
    words: [
      { word: "PENCIL", clue: "You use this to write or draw" },
      { word: "BOOK", clue: "A collection of pages to read" },
      { word: "CLASS", clue: "A group of students learning together" },
      { word: "RULER", clue: "A tool used to measure or draw lines" },
      { word: "PAPER", clue: "The material where you write answers" },
      { word: "DESK", clue: "A table used by a student" }
    ]
  },
  {
    title: "Daily Activities",
    icon: "☀️",
    size: 11,
    words: [
      { word: "WAKE", clue: "To stop sleeping" },
      { word: "EAT", clue: "To put food in your mouth" },
      { word: "STUDY", clue: "To learn new information" },
      { word: "SLEEP", clue: "To rest with your eyes closed at night" },
      { word: "COOK", clue: "To prepare food using heat" },
      { word: "WALK", clue: "To move using your feet" }
    ]
  },
  {
    title: "Places",
    icon: "🏙️",
    size: 11,
    words: [
      { word: "HOSPITAL", clue: "A place where sick people receive care" },
      { word: "MARKET", clue: "A place where you buy and sell goods" },
      { word: "SCHOOL", clue: "A place where students learn" },
      { word: "HOTEL", clue: "A place where travelers stay" },
      { word: "BEACH", clue: "Sandy land beside the sea" },
      { word: "LIBRARY", clue: "A place with many books to borrow" }
    ]
  },
  {
    title: "Adjectives",
    icon: "✨",
    size: 12,
    words: [
      { word: "HAPPY", clue: "Feeling or showing joy" },
      { word: "BRAVE", clue: "Ready to face danger or difficulty" },
      { word: "TALL", clue: "Having great height" },
      { word: "QUICK", clue: "Moving fast" },
      { word: "STRONG", clue: "Having great physical power" },
      { word: "COLD", clue: "Having a low temperature" },
      { word: "BEAUTIFUL", clue: "Very pleasant to look at" }
    ]
  }
];

const state = {
  level: 0,
  progress: loadProgress(),
  activeWord: null,
  direction: "across",
  hints: 3,
  score: 100,
  seconds: 0,
  timerId: null,
  placements: []
};

const $ = (selector) => document.querySelector(selector);
const screens = {
  levels: $("#levelScreen"),
  game: $("#gameScreen")
};

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("crosswordEnglishProgress")) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem("crosswordEnglishProgress", JSON.stringify(state.progress));
}

function unlockedLevel(index) {
  return index === 0 || Boolean(state.progress[index - 1]);
}

function renderLevels() {
  const grid = $("#levelGrid");
  grid.innerHTML = "";

  levels.forEach((level, index) => {
    const unlocked = unlockedLevel(index);
    const saved = state.progress[index];
    const card = document.createElement("button");
    card.type = "button";
    card.className = `level-card ${saved ? "completed" : ""} ${unlocked ? "" : "locked"}`;
    card.disabled = !unlocked;
    card.innerHTML = `
      <div class="level-card-top">
        <span class="level-icon">${level.icon}</span>
        ${unlocked ? `<span class="level-stars">${saved ? "⭐".repeat(saved.stars) : "☆☆☆"}</span>` : '<span class="lock">🔒</span>'}
      </div>
      <h3>${index + 1}. ${level.title}</h3>
      <p>${unlocked ? `${level.words.length} English words` : "Complete the previous level"}</p>
    `;
    card.addEventListener("click", () => startLevel(index));
    grid.appendChild(card);
  });

  const completedCount = Object.keys(state.progress).length;
  const stars = Object.values(state.progress).reduce((sum, item) => sum + (item?.stars || 0), 0);
  const score = Object.values(state.progress).reduce((sum, item) => sum + (item?.score || 0), 0);
  $("#progressText").textContent = `${completedCount}/${levels.length} completed`;
  $("#totalStars").textContent = stars;
  $("#totalScore").textContent = score;
}

function placeWords(words, size) {
  const grid = new Map();
  const placements = [];

  const first = [...words].sort((a, b) => b.word.length - a.word.length)[0];
  const remaining = words.filter((item) => item !== first);
  const firstDirection = "across";
  const row = Math.floor(size / 2);
  const col = Math.floor((size - first.word.length) / 2);
  placements.push({ ...first, row, col, direction: firstDirection, number: 1 });
  for (let i = 0; i < first.word.length; i++) grid.set(`${row},${col + i}`, first.word[i]);

  remaining.forEach((item) => {
    let best = null;

    for (let i = 0; i < item.word.length; i++) {
      for (const [key, letter] of grid.entries()) {
        if (letter !== item.word[i]) continue;
        const [baseRow, baseCol] = key.split(",").map(Number);

        for (const direction of ["across", "down"]) {
          const rowCandidate = direction === "across" ? baseRow : baseRow - i;
          const colCandidate = direction === "across" ? baseCol - i : baseCol;
          const result = placementFits(item.word, rowCandidate, colCandidate, direction, grid, size);
          if (result.valid) {
            const overlap = result.overlaps;
            if (!best || overlap > best.overlaps) {
              best = { row: rowCandidate, col: colCandidate, direction, overlaps: overlap };
            }
          }
        }
      }
    }

    if (best) {
      const placement = { ...item, ...best, number: placements.length + 1 };
      placements.push(placement);
      for (let i = 0; i < item.word.length; i++) {
        const r = best.direction === "down" ? best.row + i : best.row;
        const c = best.direction === "across" ? best.col + i : best.col;
        grid.set(`${r},${c}`, item.word[i]);
      }
    }
  });

  return placements;
}

function placementFits(word, row, col, direction, grid, size) {
  let overlaps = 0;
  for (let i = 0; i < word.length; i++) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;
    if (r < 0 || c < 0 || r >= size || c >= size) return { valid: false };

    const key = `${r},${c}`;
    const existing = grid.get(key);
    if (existing && existing !== word[i]) return { valid: false };
    if (existing) overlaps++;

    const sideA = direction === "across" ? `${r - 1},${c}` : `${r},${c - 1}`;
    const sideB = direction === "across" ? `${r + 1},${c}` : `${r},${c + 1}`;
    if (!existing && (grid.has(sideA) || grid.has(sideB))) return { valid: false };
  }

  const before = direction === "across" ? `${row},${col - 1}` : `${row - 1},${col}`;
  const endRow = direction === "down" ? row + word.length : row;
  const endCol = direction === "across" ? col + word.length : col;
  const after = `${endRow},${endCol}`;
  if (grid.has(before) || grid.has(after)) return { valid: false };

  return { valid: overlaps > 0 || grid.size === 0, overlaps };
}

function startLevel(index) {
  state.level = index;
  state.hints = 3;
  state.score = 100;
  state.seconds = 0;
  state.direction = "across";
  state.placements = placeWords(levels[index].words, levels[index].size);

  $("#levelNumber").textContent = `LEVEL ${index + 1}`;
  $("#levelTitle").textContent = levels[index].title;
  $("#levelScore").textContent = state.score;
  $("#hintCount").textContent = state.hints;
  $("#timer").textContent = "00:00";
  $("#resultModal").classList.remove("open");

  screens.levels.classList.remove("active");
  screens.game.classList.add("active");
  renderCrossword();
  renderClues();

  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.seconds++;
    $("#timer").textContent = formatTime(state.seconds);
  }, 1000);
}

function renderCrossword() {
  const level = levels[state.level];
  const crossword = $("#crossword");
  crossword.innerHTML = "";
  crossword.style.setProperty("--cols", level.size);

  const occupied = new Map();
  state.placements.forEach((placement) => {
    for (let i = 0; i < placement.word.length; i++) {
      const r = placement.direction === "down" ? placement.row + i : placement.row;
      const c = placement.direction === "across" ? placement.col + i : placement.col;
      occupied.set(`${r},${c}`, placement.word[i]);
    }
  });

  for (let r = 0; r < level.size; r++) {
    for (let c = 0; c < level.size; c++) {
      const key = `${r},${c}`;
      const cell = document.createElement("div");
      cell.className = occupied.has(key) ? "cell" : "cell blank";
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (occupied.has(key)) {
        const number = state.placements
          .filter((p) => p.row === r && p.col === c)
          .map((p) => p.number)[0];
        if (number) {
          const numberLabel = document.createElement("span");
          numberLabel.className = "cell-number";
          numberLabel.textContent = number;
          cell.appendChild(numberLabel);
        }

        const input = document.createElement("input");
        input.maxLength = 1;
        input.autocomplete = "off";
        input.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}`);
        input.dataset.answer = occupied.get(key);
        input.addEventListener("focus", () => selectCell(r, c));
        input.addEventListener("input", (event) => handleInput(event, r, c));
        input.addEventListener("keydown", (event) => handleKey(event, r, c));
        cell.appendChild(input);
      }
      crossword.appendChild(cell);
    }
  }
}

function renderClues() {
  const list = $("#clueList");
  list.innerHTML = "";
  const directionPlacements = state.placements.filter((item) => item.direction === state.direction);

  directionPlacements.forEach((placement) => {
    const clue = document.createElement("button");
    clue.type = "button";
    clue.className = "clue-item";
    clue.dataset.word = placement.word;
    clue.innerHTML = `<strong>${placement.number}</strong><span>${placement.clue}</span>`;
    clue.addEventListener("click", () => selectWord(placement));
    list.appendChild(clue);
  });
}

function selectWord(placement) {
  state.activeWord = placement.word;
  state.direction = placement.direction;
  document.querySelectorAll(".clue-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.direction === state.direction);
  });
  renderClues();
  highlightWord(placement);
  const firstInput = getCell(placement.row, placement.col).querySelector("input");
  firstInput?.focus();
}

function selectCell(row, col) {
  const matching = state.placements.filter((placement) => {
    return placementCells(placement).some((cell) => cell.row === row && cell.col === col);
  });

  let placement = matching.find((item) => item.direction === state.direction);
  if (!placement) placement = matching[0];
  if (!placement) return;

  state.direction = placement.direction;
  state.activeWord = placement.word;
  document.querySelectorAll(".clue-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.direction === state.direction);
  });
  highlightWord(placement);
  renderClues();
  document.querySelectorAll(".clue-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.word === placement.word);
  });
}

function highlightWord(placement) {
  document.querySelectorAll(".cell").forEach((cell) => cell.classList.remove("active-word", "selected"));
  placementCells(placement).forEach(({ row, col }) => {
    getCell(row, col)?.classList.add("active-word");
  });
  getCell(placement.row, placement.col)?.classList.add("selected");
}

function placementCells(placement) {
  const cells = [];
  for (let i = 0; i < placement.word.length; i++) {
    cells.push({
      row: placement.direction === "down" ? placement.row + i : placement.row,
      col: placement.direction === "across" ? placement.col + i : placement.col
    });
  }
  return cells;
}

function getCell(row, col) {
  return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function handleInput(event, row, col) {
  event.target.value = event.target.value.replace(/[^a-z]/gi, "").toUpperCase().slice(-1);
  document.querySelectorAll(".cell.correct, .cell.wrong").forEach((cell) => {
    cell.classList.remove("correct", "wrong");
  });

  if (event.target.value) moveNext(row, col);
}

function moveNext(row, col) {
  const placement = state.placements.find((item) => item.word === state.activeWord);
  if (!placement) return;
  const index = placementCells(placement).findIndex((cell) => cell.row === row && cell.col === col);
  const next = placementCells(placement)[index + 1];
  if (next) getCell(next.row, next.col)?.querySelector("input")?.focus();
}

function handleKey(event, row, col) {
  if (event.key === "Backspace" && !event.target.value) {
    event.preventEvent = true;
  }

  const offsets = {
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0]
  };
  if (offsets[event.key]) {
    event.preventDefault();
    const [dr, dc] = offsets[event.key];
    getCell(row + dr, col + dc)?.querySelector("input")?.focus();
  }
}

function checkAnswer() {
  let filled = 0;
  let correct = 0;
  let allCorrect = true;

  document.querySelectorAll(".cell:not(.blank) input").forEach((input) => {
    input.parentElement.classList.remove("correct", "wrong");
    if (input.value) filled++;
    if (input.value.toUpperCase() === input.dataset.answer) {
      correct++;
      input.parentElement.classList.add("correct");
    } else {
      allCorrect = false;
      if (input.value) input.parentElement.classList.add("wrong");
    }
  });

  const total = document.querySelectorAll(".cell:not(.blank) input").length;
  if (filled < total) {
    allCorrect = false;
    state.score = Math.max(0, state.score - 2);
    $("#levelScore").textContent = state.score;
  }

  if (allCorrect) finishLevel();
}

function useHint() {
  if (state.hints <= 0) return;
  const placement = state.placements.find((item) => item.word === state.activeWord)
    || state.placements.find((item) => item.direction === state.direction);
  if (!placement) return;

  const emptyOrWrong = placementCells(placement).find(({ row, col }) => {
    const input = getCell(row, col)?.querySelector("input");
    return input && input.value.toUpperCase() !== input.dataset.answer;
  });

  if (!emptyOrWrong) return;
  const input = getCell(emptyOrWrong.row, emptyOrWrong.col).querySelector("input");
  input.value = input.dataset.answer;
  input.parentElement.classList.add("correct");
  state.hints--;
  state.score = Math.max(0, state.score - 5);
  $("#hintCount").textContent = state.hints;
  $("#levelScore").textContent = state.score;
}

function resetBoard() {
  document.querySelectorAll(".cell input").forEach((input) => {
    input.value = "";
    input.parentElement.classList.remove("correct", "wrong");
  });
  state.hints = 3;
  state.score = 100;
  $("#hintCount").textContent = state.hints;
  $("#levelScore").textContent = state.score;
}

function finishLevel() {
  clearInterval(state.timerId);
  const timeBonus = Math.max(0, 100 - state.seconds);
  const finalScore = state.score + timeBonus;
  const stars = finalScore >= 160 ? 3 : finalScore >= 120 ? 2 : 1;

  const previous = state.progress[state.level];
  if (!previous || finalScore > previous.score) {
    state.progress[state.level] = { score: finalScore, stars };
  }
  saveProgress();

  $("#resultTitle").textContent = stars === 3 ? "Amazing!" : stars === 2 ? "Great work!" : "Level complete!";
  $("#resultMessage").textContent = `You solved the ${levels[state.level].title} crossword.`;
  $("#resultScore").textContent = finalScore;
  $("#resultTime").textContent = formatTime(state.seconds);
  $("#starResult").textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
  $("#nextButton").textContent = state.level === levels.length - 1 ? "Level Map" : "Next Level";
  $("#resultModal").classList.add("open");

  renderLevels();
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function showLevels() {
  clearInterval(state.timerId);
  screens.game.classList.remove("active");
  screens.levels.classList.add("active");
  $("#resultModal").classList.remove("open");
  renderLevels();
}

document.querySelectorAll(".clue-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.direction = tab.dataset.direction;
    document.querySelectorAll(".clue-tab").forEach((item) => item.classList.toggle("active", item === tab));
    renderClues();
  });
});

$("#backButton").addEventListener("click", showLevels);
$("#homeButton").addEventListener("click", showLevels);
$("#checkButton").addEventListener("click", checkAnswer);
$("#hintButton").addEventListener("click", useHint);
$("#resetButton").addEventListener("click", resetBoard);
$("#retryButton").addEventListener("click", () => startLevel(state.level));
$("#nextButton").addEventListener("click", () => {
  if (state.level < levels.length - 1) startLevel(state.level + 1);
  else showLevels();
});
$("#resultModal").addEventListener("click", (event) => {
  if (event.target === $("#resultModal")) showLevels();
});

renderLevels();
