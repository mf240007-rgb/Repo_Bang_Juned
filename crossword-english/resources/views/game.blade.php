<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1b5e3c" />
    <title>Crossword English Adventure</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="{{ asset('css/style.css') }}" />
  </head>
  <body>
    <main class="app-shell">
      <header class="topbar">
        <button class="brand" id="homeButton" type="button" aria-label="Back to levels">
          <span class="brand-mark">ABC</span>
          <span>
            <strong>Crossword</strong>
            <small>English Adventure</small>
          </span>
        </button>
        <div class="player-stats" aria-label="Game stats">
          <span class="stat"><span>⭐</span><strong id="totalStars">0</strong></span>
          <span class="stat"><span>🏆</span><strong id="totalScore">0</strong></span>
        </div>
      </header>

      <section id="levelScreen" class="screen active" aria-label="Select level">
        <div class="hero">
          <div>
            <p class="eyebrow">Choose your mission</p>
            <h1>English<br />Crossword</h1>
            <p>Unlock every level and grow your English vocabulary.</p>
          </div>
          <div class="hero-illustration" aria-hidden="true">
            <div class="globe">🌍</div>
            <div class="word-card">EXPLORE</div>
          </div>
        </div>
        <div class="level-heading">
          <h2>Adventure Map</h2>
          <span id="progressText">0/6 completed</span>
        </div>
        <div id="levelGrid" class="level-grid"></div>
      </section>

      <section id="gameScreen" class="screen" aria-label="Crossword game">
        <div class="game-header">
          <button id="backButton" class="icon-button" type="button" aria-label="Back">←</button>
          <div class="level-title">
            <span id="levelNumber">LEVEL 1</span>
            <h1 id="levelTitle">Animals</h1>
          </div>
          <div class="game-actions">
            <span class="timer" title="Elapsed time">⏱ <strong id="timer">00:00</strong></span>
            <span class="score" title="Current score">⭐ <strong id="levelScore">100</strong></span>
          </div>
        </div>

        <div class="game-layout">
          <div class="board-panel">
            <div id="crossword" class="crossword" role="grid" aria-label="Crossword board"></div>
          </div>

          <aside class="clue-panel">
            <div class="clue-tabs">
              <button class="clue-tab active" type="button" data-direction="across">Across</button>
              <button class="clue-tab" type="button" data-direction="down">Down</button>
            </div>
            <div id="clueList" class="clue-list"></div>
          </aside>
        </div>

        <div class="game-controls">
          <button id="resetButton" class="control-button secondary" type="button">↻ Reset</button>
          <button id="hintButton" class="control-button hint" type="button">💡 Hint <span id="hintCount">3</span></button>
          <button id="checkButton" class="control-button primary" type="button">Check Answer</button>
        </div>
      </section>
    </main>

    <div id="resultModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="resultTitle">
      <div class="modal-card">
        <div id="resultIcon" class="result-icon">🎉</div>
        <p class="eyebrow" id="resultEyebrow">Level complete</p>
        <h2 id="resultTitle">Amazing!</h2>
        <p id="resultMessage">You solved every word.</p>
        <div class="result-stats">
          <div><span>Score</span><strong id="resultScore">100</strong></div>
          <div><span>Time</span><strong id="resultTime">00:00</strong></div>
        </div>
        <div id="starResult" class="star-result">⭐⭐⭐</div>
        <div class="modal-actions">
          <button id="retryButton" class="control-button secondary" type="button">Play Again</button>
          <button id="nextButton" class="control-button primary" type="button">Next Level</button>
        </div>
      </div>
    </div>

    <script src="{{ asset('js/app.js') }}"></script>
  </body>
</html>