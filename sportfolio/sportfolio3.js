// sportfolio3.js
// - Vista solitaria (abrir/cerrar secciones)
// - Chart.js (gráfica pruebas + frecuencia cardiaca)
// - Pestañas aprendizaje
// - Ajedrez vs máquina + QUIZ tipo Kahoot

document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------
    VISTA SOLITARIA
  ------------------------*/
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".page-section");
  const closeBtns = document.querySelectorAll(".close-section");

  function openSection(id, push = true) {
    const target = document.getElementById(id);
    if (!target) return;
    sections.forEach((s) => s.classList.remove("active"));
    document.body.classList.add("solo-view");
    target.classList.add("active");

    const heading = target.querySelector("h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }

    if (push) history.pushState({ section: id }, "", `#${id}`);
  }

  function closeSection(push = true) {
    sections.forEach((s) => s.classList.remove("active"));
    document.body.classList.remove("solo-view");

    sections.forEach((s) => {
      const h = s.querySelector("h2");
      if (h) h.removeAttribute("tabindex");
    });

    if (push) {
      history.pushState({}, "", window.location.pathname + window.location.search);
    }

    const firstNav = document.querySelector(".nav-link");
    if (firstNav) firstNav.focus();
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id =
        link.dataset.target ||
        (link.getAttribute("href") || "").replace("#", "");
      openSection(id, true);
    });
  });

  closeBtns.forEach((btn) =>
    btn.addEventListener("click", () => closeSection(true))
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("solo-view")) {
      closeSection(true);
    }
  });

  window.addEventListener("popstate", (e) => {
    const state = e.state;
    if (state && state.section) {
      openSection(state.section, false);
    } else if (location.hash) {
      const id = location.hash.replace("#", "");
      if (document.getElementById(id)) openSection(id, false);
      else closeSection(false);
    } else {
      closeSection(false);
    }
  });

  if (location.hash) {
    const id = location.hash.replace("#", "");
    if (document.getElementById(id)) {
      history.replaceState({ section: id }, "", `#${id}`);
      openSection(id, false);
    }
  }

  /* -----------------------
    LOCALSTORAGE GRÁFICA PRUEBAS
  ------------------------*/
  const STORAGE_KEY = "pruebasChartData";

  function saveChartToLocal() {
    if (!window.pruebasChart) return;
    try {
      const payload = {
        labels: window.pruebasChart.data.labels,
        data: window.pruebasChart.data.datasets[0].data,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      // ignorar errores
    }
  }

  function loadChartFromLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  /* -----------------------
    INICIALIZAR GRÁFICA PRUEBAS FÍSICAS
  ------------------------*/
  const defaultLabels = [
    "1000m",
    "coursa navet",
    "Flexión sentada",
    "Flexión de pie",
    "Vueltas 5x10",
    "30m",
    "50m",
    "100m",
    "Salto vertical",
    "Salto horizontal",
    "Lanzamiento de bola",
    "Abdominales 30s",
  ];
  const defaultValues = [4, 3.5, 6, 6, 10, 2, 5, 4, 4, 4.5, 4.5, 7];

  const canvas = document.getElementById("pruebasChart");
  if (canvas && window.Chart) {
    const saved = loadChartFromLocal();
    const labels =
      saved && Array.isArray(saved.labels) && saved.labels.length
        ? saved.labels
        : defaultLabels;
    const values =
      saved && Array.isArray(saved.data) && saved.data.length
        ? saved.data
        : defaultValues;

    const ctx = canvas.getContext("2d");
    window.pruebasChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.slice(),
        datasets: [
          {
            label: "Puntuación",
            data: values.slice(),
            backgroundColor: [
              "rgba(75,192,192,0.6)",
              "rgba(153,102,255,0.6)",
              "rgba(255,159,64,0.6)",
              "rgba(54,162,235,0.6)",
              "rgba(255,99,132,0.6)",
              "rgba(255,206,86,0.6)",
              "rgba(201,203,207,0.6)",
              "rgba(100,181,246,0.6)",
              "rgba(129,199,132,0.6)",
              "rgba(239,83,80,0.6)",
              "rgba(171,71,188,0.6)",
              "rgba(255,112,67,0.6)",
            ],
            borderColor: "rgba(0,0,0,0.6)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 12,
            ticks: {
              stepSize: 0.5,
              callback: function (value) {
                return Number.isInteger(value) ? value : value.toFixed(1);
              },
            },
          },
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Pruebas físicas — puntuación",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const v = context.parsed.y;
                return (Number.isInteger(v) ? v : v.toFixed(1)) + " pts";
              },
            },
          },
        },
      },
    });
  }

  // API gráfica
  function setChartData(labels, values) {
    if (!window.pruebasChart) return;
    window.pruebasChart.data.labels = labels.slice();
    window.pruebasChart.data.datasets[0].data = values.slice();
    window.pruebasChart.update();
    saveChartToLocal();
  }

  function addChartItem(label, value) {
    if (!window.pruebasChart) return;
    window.pruebasChart.data.labels.push(label);
    window.pruebasChart.data.datasets[0].data.push(Number(value));
    window.pruebasChart.update();
    saveChartToLocal();
  }

  function updateChartValue(label, newValue) {
    if (!window.pruebasChart) return;
    const i = window.pruebasChart.data.labels.indexOf(label);
    if (i === -1) return;
    window.pruebasChart.data.datasets[0].data[i] = Number(newValue);
    window.pruebasChart.update();
    saveChartToLocal();
  }

  function removeChartItem(label) {
    if (!window.pruebasChart) return;
    const i = window.pruebasChart.data.labels.indexOf(label);
    if (i === -1) return;
    window.pruebasChart.data.labels.splice(i, 1);
    window.pruebasChart.data.datasets[0].data.splice(i, 1);
    window.pruebasChart.update();
    saveChartToLocal();
  }

  window.setChartData = setChartData;
  window.addChartItem = addChartItem;
  window.updateChartValue = updateChartValue;
  window.removeChartItem = removeChartItem;
  window.saveChartToLocal = saveChartToLocal;
  window.loadChartFromLocal = loadChartFromLocal;

  /* -----------------------
    GRÁFICA FRECUENCIA CARDIACA
  ------------------------*/
  const frecCanvas = document.getElementById("frecuenciaChart");
  if (frecCanvas && window.Chart) {
    const frecCtx = frecCanvas.getContext("2d");
    const labelsFrec = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const dataFrec = [72, 76, 80, 104, 156, 120, 132, 84, 164, 104];

    new Chart(frecCtx, {
      type: "bar",
      data: {
        labels: labelsFrec,
        datasets: [
          {
            label: "PPM",
            data: dataFrec,
            backgroundColor: "rgba(255, 165, 0, 0.85)",
            borderColor: "rgba(255, 165, 0, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Frecuencia cardiaca según actividad",
            font: {
              size: 18,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.parsed.y + " ppm";
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Actividad (1 a 10)",
            },
            grid: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: "PPM",
            },
            beginAtZero: true,
            suggestedMax: 180,
            grid: {
              borderDash: [4, 4],
            },
          },
        },
      },
    });
  }

  /* -----------------------
    PESTAÑAS APRENDIZAJE
  ------------------------*/
  const tabs = document.querySelectorAll(".aprendizaje-tab");
  const parts = document.querySelectorAll(".aprendizaje-part");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const partId = tab.dataset.part;

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      parts.forEach((p) => {
        if (p.dataset.part === partId) p.classList.add("active");
        else p.classList.remove("active");
      });
    });
  });

  /* -----------------------
    AJEDREZ VS MÁQUINA + QUIZ TIPO KAHOOT
  ------------------------*/
  const boardElement = document.getElementById("chess-board");
  const turnElement = document.getElementById("chess-turn");
  const whiteCapturesEl = document.getElementById("white-captures");
  const blackCapturesEl = document.getElementById("black-captures");
  const resetBtn = document.getElementById("chess-reset");

  // elementos del quiz
  const quizModal = document.getElementById("quiz-modal");
  const quizQuestionEl = document.getElementById("quiz-question");
  const quizOptionsEl = document.getElementById("quiz-options");

  if (boardElement && turnElement && whiteCapturesEl && blackCapturesEl) {
    // ================== PREGUNTAS ==================
    const quizQuestions = [
      {
        id: 1,
        text: "1. ¿Qué puede causar comer de forma muy irregular?",
        options: [
          { key: "A", text: "A. Aumentar la flexibilidad" },
          { key: "B", text: "B. Bajones de energía y peores rendimientos" },
          { key: "C", text: "C. Mejorar la concentración" },
          { key: "D", text: "D. Dormir mejor" },
        ],
        correctKey: "B",
      },
      {
        id: 2,
        text: "2. ¿Qué es el flato?",
        options: [
          { key: "A", text: "A. Un dolor muscular causado por ácido láctico" },
          { key: "B", text: "B. Un dolor en el pecho por falta de oxígeno" },
          {
            key: "C",
            text: "C. Un dolor breve y punzante en el abdomen durante actividad intensa",
          },
          {
            key: "D",
            text: "D. Una lesión del diafragma por sobreesfuerzo",
          },
        ],
        correctKey: "C",
      },
      {
        id: 3,
        text: "3. Verdadero o falso: El ácido láctico aparece cuando el cuerpo trabaja a alta intensidad sin suficiente oxígeno.",
        options: [
          { key: "V", text: "Verdadero" },
          { key: "F", text: "Falso" },
        ],
        correctKey: "V",
      },
      {
        id: 4,
        text: "4. ¿Cuál de estas NO es una recomendación para reducir el flato?",
        options: [
          { key: "A", text: "A. Bajar el ritmo" },
          { key: "B", text: "B. Respirar profundamente" },
          { key: "C", text: "C. Mantener buena hidratación" },
          { key: "D", text: "D. Aguantar el dolor sin parar" },
        ],
        correctKey: "D",
      },
      {
        id: 5,
        text: "5. En mis pruebas físicas, ¿cuál fue la puntuación más alta?",
        options: [
          { key: "A", text: "A. Flexión sentada" },
          { key: "B", text: "B. Sprint 30m" },
          { key: "C", text: "C. Vueltas 5x10 (10 puntos)" },
          { key: "D", text: "D. Abdominales 30s" },
        ],
        correctKey: "C",
      },
      {
        id: 6,
        text: "6. Verdadero o falso: Las agujetas aparecen 1–2 horas después de hacer ejercicio intenso.",
        options: [
          { key: "V", text: "Verdadero" },
          {
            key: "F",
            text: "Falso (aparecen entre 24 y 72 horas)",
          },
        ],
        correctKey: "F",
      },
    ];

    let quizActive = false;
    let quizIndex = 0; // de 0 a 5 (6 preguntas)
    let whiteCaptures = 0;
    let blackCaptures = 0;

    function openQuizModal(question) {
      if (!quizModal || !quizQuestionEl || !quizOptionsEl) return;
      quizQuestionEl.textContent = question.text;
      quizOptionsEl.innerHTML = "";

      question.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option-btn";
        btn.textContent = opt.text;
        btn.dataset.correct = opt.key === question.correctKey ? "true" : "false";
        btn.addEventListener("click", () => handleQuizAnswer(btn));
        quizOptionsEl.appendChild(btn);
      });

      quizModal.classList.remove("quiz-hidden");
      quizModal.setAttribute("aria-hidden", "false");
      boardElement.classList.add("quiz-locked");
      quizActive = true;
    }

    function closeQuizModal() {
      if (!quizModal) return;
      quizModal.classList.add("quiz-hidden");
      quizModal.setAttribute("aria-hidden", "true");
      boardElement.classList.remove("quiz-locked");
      quizActive = false;
    }

    function handleQuizAnswer(btn) {
      const isCorrect = btn.dataset.correct === "true";
      if (isCorrect) {
        alert("✅ ¡Correcto! Continúas la partida.");
        quizIndex = Math.min(quizIndex + 1, quizQuestions.length);
        closeQuizModal();
      } else {
        alert("❌ Respuesta incorrecta. Se reinicia la partida y las preguntas.");
        closeQuizModal();
        quizIndex = 0;
        resetBoard();
      }
    }

    function checkQuizTrigger() {
      // Cada 3 fichas negras capturadas por blancas
      if (!quizActive && quizIndex < quizQuestions.length) {
        if (whiteCaptures > 0 && whiteCaptures % 3 === 0) {
          const question = quizQuestions[quizIndex];
          openQuizModal(question);
        }
      }
    }

    // ================== AJEDREZ ==================
    const initialBoard = [
      ["r", "n", "b", "q", "k", "b", "n", "r"],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ];

    let board = [];
    let whiteTurn = true; // true = turno de blancas (tú)
    let gameOver = false;
    let selected = null; // {row, col}

    const pieceToChar = {
      P: "♙",
      R: "♖",
      N: "♘",
      B: "♗",
      Q: "♕",
      K: "♔",
      p: "♟",
      r: "♜",
      n: "♞",
      b: "♝",
      q: "♛",
      k: "♚",
    };

    function isWhite(piece) {
      return piece && piece === piece.toUpperCase();
    }

    function isBlack(piece) {
      return piece && piece === piece.toLowerCase();
    }

    function inBounds(r, c) {
      return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    function updateCaptures() {
      whiteCapturesEl.textContent = whiteCaptures;
      blackCapturesEl.textContent = blackCaptures;
    }

    function findKing(isWhiteSide) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (!p) continue;
          if (p.toLowerCase() === "k" && isWhite(p) === isWhiteSide) {
            return { row: r, col: c };
          }
        }
      }
      return null;
    }

    function isSquareAttacked(row, col, byWhite) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (!p) continue;
          if (isWhite(p) !== byWhite) continue;

          if (baseLegalMove(r, c, row, col)) {
            return true;
          }
        }
      }
      return false;
    }

    function isKingInCheck(isWhiteSide) {
      const kingPos = findKing(isWhiteSide);
      if (!kingPos) return true;
      return isSquareAttacked(kingPos.row, kingPos.col, !isWhiteSide);
    }

    function setTurnLabel(custom) {
      if (custom) {
        turnElement.textContent = custom;
        return;
      }
      if (gameOver) return;

      const inCheckWhite = isKingInCheck(true);
      const inCheckBlack = isKingInCheck(false);

      if (whiteTurn && inCheckWhite) {
        turnElement.textContent = "Turno: blancas (tú) — ¡estás en jaque!";
      } else if (!whiteTurn && inCheckBlack) {
        turnElement.textContent = "Turno: negras (máquina) — está en jaque.";
      } else if (whiteTurn) {
        turnElement.textContent = "Turno: blancas (tú)";
      } else {
        turnElement.textContent = "Turno: negras (máquina)";
      }
    }

    function setGameOverState(message) {
      gameOver = true;
      if (boardElement) {
        boardElement.classList.add("game-over");
      }
      turnElement.textContent =
        message + " Si quieres jugar otra vez, pulsa «Reiniciar partida».";
    }

    function resetBoard() {
      board = initialBoard.map((row) => row.slice());
      whiteTurn = true;
      gameOver = false;
      selected = null;
      whiteCaptures = 0;
      blackCaptures = 0;
      quizActive = false;
      quizIndex = 0;

      if (quizModal) {
        quizModal.classList.add("quiz-hidden");
        quizModal.setAttribute("aria-hidden", "true");
      }
      boardElement.classList.remove("quiz-locked");

      if (boardElement) {
        boardElement.classList.remove("game-over");
      }

      updateCaptures();
      renderBoard();
      setTurnLabel();
    }

    function clearHighlights() {
      const squares = boardElement.querySelectorAll(".chess-square");
      squares.forEach((sq) => {
        sq.classList.remove("selected");
        sq.classList.remove("possible");
      });
    }

    function renderBoard() {
      boardElement.innerHTML = "";
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const sq = document.createElement("button");
          sq.type = "button";
          sq.classList.add("chess-square");
          const isDark = (r + c) % 2 === 1;
          sq.classList.add(isDark ? "dark" : "light");
          sq.dataset.row = r;
          sq.dataset.col = c;

          const piece = board[r][c];
          if (piece) {
            sq.textContent = pieceToChar[piece] || "";
          }

          if (!gameOver && whiteTurn && !quizActive && piece && isWhite(piece)) {
            sq.classList.add("player-selectable");
          }

          if (selected && selected.row === r && selected.col === c) {
            sq.classList.add("selected");
          }

          sq.addEventListener("click", () => onSquareClick(r, c));
          boardElement.appendChild(sq);
        }
      }
      updateCaptures();
    }

    // ---------- MOVIMIENTOS ---------- //
    function isPathClear(fromR, fromC, toR, toC) {
      const dr = toR - fromR;
      const dc = toC - fromC;
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

      let r = fromR + stepR;
      let c = fromC + stepC;
      while (r !== toR || c !== toC) {
        if (board[r][c] !== null) return false;
        r += stepR;
        c += stepC;
      }
      return true;
    }

    function baseLegalMove(fromR, fromC, toR, toC) {
      if (!inBounds(fromR, fromC) || !inBounds(toR, toC)) return false;
      if (fromR === toR && fromC === toC) return false;

      const piece = board[fromR][fromC];
      if (!piece) return false;

      const target = board[toR][toC];
      if (
        target &&
        ((isWhite(piece) && isWhite(target)) ||
          (isBlack(piece) && isBlack(target)))
      ) {
        return false;
      }

      const dr = toR - fromR;
      const dc = toC - fromC;
      const absDr = Math.abs(dr);
      const absDc = Math.abs(dc);

      switch (piece.toLowerCase()) {
        case "p": {
          const isW = isWhite(piece);
          const dir = isW ? -1 : 1;
          const startRow = isW ? 6 : 1;

          if (dc === 0 && dr === dir && !target) return true;

          if (
            dc === 0 &&
            dr === 2 * dir &&
            fromR === startRow &&
            !target &&
            board[fromR + dir][fromC] === null
          ) {
            return true;
          }

          if (
            absDc === 1 &&
            dr === dir &&
            target &&
            ((isW && isBlack(target)) || (!isW && isWhite(target)))
          ) {
            return true;
          }

          return false;
        }

        case "r": {
          if (dr !== 0 && dc !== 0) return false;
          return isPathClear(fromR, fromC, toR, toC);
        }

        case "b": {
          if (absDr !== absDc) return false;
          return isPathClear(fromR, fromC, toR, toC);
        }

        case "q": {
          if (dr === 0 || dc === 0 || absDr === absDc) {
            return isPathClear(fromR, fromC, toR, toC);
          }
          return false;
        }

        case "n": {
          return (
            (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2)
          );
        }

        case "k": {
          return absDr <= 1 && absDc <= 1;
        }

        default:
          return false;
      }
    }

    function wouldLeaveKingInCheck(fromR, fromC, toR, toC) {
      const piece = board[fromR][fromC];
      if (!piece) return false;

      const isW = isWhite(piece);
      const savedFrom = board[fromR][fromC];
      const savedTo = board[toR][toC];

      board[fromR][fromC] = null;
      board[toR][toC] = savedFrom;

      const kingPos = findKing(isW);
      let inCheck = false;
      if (!kingPos) {
        inCheck = true;
      } else {
        inCheck = isSquareAttacked(kingPos.row, kingPos.col, !isW);
      }

      board[fromR][fromC] = savedFrom;
      board[toR][toC] = savedTo;

      return inCheck;
    }

    function fullLegalMove(fromR, fromC, toR, toC, turnIsWhite) {
      const piece = board[fromR][fromC];
      if (!piece) return false;
      if (turnIsWhite !== isWhite(piece)) return false;
      if (!baseLegalMove(fromR, fromC, toR, toC)) return false;
      if (wouldLeaveKingInCheck(fromR, fromC, toR, toC)) return false;
      return true;
    }

    function generateAllLegalMoves(turnIsWhite) {
      const moves = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (!piece) continue;
          if (isWhite(piece) !== turnIsWhite) continue;
          for (let rr = 0; rr < 8; rr++) {
            for (let cc = 0; cc < 8; cc++) {
              if (fullLegalMove(r, c, rr, cc, turnIsWhite)) {
                moves.push({ fromR: r, fromC: c, toR: rr, toC: cc });
              }
            }
          }
        }
      }
      return moves;
    }

    function movePiece(fromR, fromC, toR, toC, byWhiteSide) {
      const piece = board[fromR][fromC];
      const target = board[toR][toC];

      if (target) {
        if (byWhiteSide) whiteCaptures++;
        else blackCaptures++;
      }

      board[fromR][fromC] = null;
      board[toR][toC] = piece;

      if (piece === "P" && toR === 0) board[toR][toC] = "Q";
      if (piece === "p" && toR === 7) board[toR][toC] = "q";

      updateCaptures();

      if (byWhiteSide && target && isBlack(target)) {
        checkQuizTrigger();
      }
    }

    function highlightPossible(fromR, fromC) {
      clearHighlights();
      const squares = boardElement.querySelectorAll(".chess-square");
      squares.forEach((sq) => {
        const r = parseInt(sq.dataset.row, 10);
        const c = parseInt(sq.dataset.col, 10);
        if (fullLegalMove(fromR, fromC, r, c, true)) {
          sq.classList.add("possible");
        }
      });
    }

    function checkGameOver(lastMoveByWhite) {
      const opponentIsWhite = !lastMoveByWhite;
      const moves = generateAllLegalMoves(opponentIsWhite);
      const kingPos = findKing(opponentIsWhite);
      const attackerIsWhite = lastMoveByWhite;
      let kingInCheck = false;

      if (kingPos) {
        kingInCheck = isSquareAttacked(
          kingPos.row,
          kingPos.col,
          attackerIsWhite
        );
      } else {
        kingInCheck = true;
      }

      if (moves.length === 0) {
        if (kingInCheck) {
          if (opponentIsWhite) {
            setGameOverState("Has perdido: ¡jaque mate de la máquina!");
          } else {
            setGameOverState("¡Has ganado: jaque mate a la máquina!");
          }
        } else {
          setGameOverState("Partida terminada: tablas.");
        }
        return true;
      }

      return false;
    }

    // ---------- INTERACCIÓN JUGADOR ---------- //
    function onSquareClick(r, c) {
      if (gameOver) return;
      if (!whiteTurn) return;
      if (quizActive) return;

      const piece = board[r][c];

      if (!selected) {
        if (!piece || !isWhite(piece)) return;
        selected = { row: r, col: c };
        highlightPossible(r, c);
        renderBoard();
        return;
      }

      const { row: fromR, col: fromC } = selected;

      if (fromR === r && fromC === c) {
        selected = null;
        clearHighlights();
        renderBoard();
        return;
      }

      if (piece && isWhite(piece) && !fullLegalMove(fromR, fromC, r, c, true)) {
        selected = { row: r, col: c };
        highlightPossible(r, c);
        renderBoard();
        return;
      }

      if (!fullLegalMove(fromR, fromC, r, c, true)) {
        return;
      }

      movePiece(fromR, fromC, r, c, true);
      selected = null;
      clearHighlights();
      whiteTurn = false;
      renderBoard();

      if (checkGameOver(true)) {
        return;
      }

      setTurnLabel();
      setTimeout(machineMove, 250);
    }

    // ---------- IA SIMPLE ---------- //
    function machineMove() {
      if (gameOver) return;
      if (whiteTurn) return;
      // ¡OJO! Aquí antes estaba: if (quizActive) return;  (LO HEMOS QUITADO)

      const moves = generateAllLegalMoves(false);
      if (moves.length === 0) {
        if (checkGameOver(false)) return;
      }

      const captureMoves = moves.filter((m) => {
        const target = board[m.toR][m.toC];
        return target && isWhite(target);
      });

      let chosen;
      if (captureMoves.length > 0) {
        chosen = captureMoves[Math.floor(Math.random() * captureMoves.length)];
      } else {
        chosen = moves[Math.floor(Math.random() * moves.length)];
      }

      movePiece(chosen.fromR, chosen.fromC, chosen.toR, chosen.toC, false);
      whiteTurn = true;
      renderBoard();

      if (checkGameOver(false)) {
        return;
      }

      setTurnLabel();
    }

    // ---------- INICIO ---------- //
    resetBoard();

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resetBoard();
      });
    }
  }
});
