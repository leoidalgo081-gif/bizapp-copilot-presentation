const express = require('express');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3030;

// Global Game State
const state = {
  currentSlideIndex: 0,
  // States: 'lobby', 'content', 'quiz_active', 'quiz_revealed', 'minigame_active', 'final'
  status: 'lobby', 
  players: {}, // key: socket.id, value: { id, name, avatar, score, active, answered, answerCorrect, scoreGained }
  currentQuestionStartTime: null,
  answersCount: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  answeredCount: 0,
  pptIntegrationEnabled: false,
  logs: []
};

// Helper to control PowerPoint via PowerShell COM
function controlPowerPoint(action, slideIndex = null) {
  if (!state.pptIntegrationEnabled) return;
  
  let psCommand = '';
  if (action === 'start') {
    psCommand = `$ppt = [System.Runtime.Interopservices.Marshal]::GetActiveObject('PowerPoint.Application'); $ppt.ActivePresentation.SlideShowSettings.Run()`;
  } else if (action === 'goto' && slideIndex !== null) {
    const pptSlideNumber = slideIndex + 1; // PPT is 1-indexed
    psCommand = `$ppt = [System.Runtime.Interopservices.Marshal]::GetActiveObject('PowerPoint.Application'); $ppt.ActivePresentation.SlideShowWindow.View.GotoSlide(${pptSlideNumber})`;
  }
  
  if (psCommand) {
    exec(`powershell.exe -Command "${psCommand}"`, (err) => {
      if (err) console.error('[PPT ERROR]', err.message);
      else console.log('[PPT SUCCESS]', action, slideIndex !== null ? slideIndex : '');
    });
  }
}

// Load presentation data
let presentationData = [];
try {
  const dataPath = path.join(__dirname, 'presentation_data.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  presentationData = JSON.parse(rawData);
  console.log(`Loaded ${presentationData.length} slides/questions.`);
} catch (error) {
  console.error("Error loading presentation_data.json:", error);
}

// Disable caching for development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/extracted_images', express.static(path.join(__dirname, 'extracted_images')));

// Route to serve presentation data to clients
app.get('/presentation_data.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'presentation_data.json'));
});

// Route to download presentation PDF
app.get('/download-pdf', (req, res) => {
  const pdfPath = path.join(__dirname, 'Template Apresentação com Copilot - Bizapp 2026.pdf');
  res.download(pdfPath, 'Apresentacao-Copilot-Bizapp-2026.pdf', (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: "PDF no longer available." });
    }
  });
});

// Get current slide
function getCurrentSlide() {
  if (state.currentSlideIndex >= 0 && state.currentSlideIndex < presentationData.length) {
    return presentationData[state.currentSlideIndex];
  }
  return null;
}

// Calculate leaderboard
function getLeaderboard() {
  return Object.values(state.players)
    .sort((a, b) => b.score - a.score)
    .map(p => ({ name: p.name, score: p.score, active: p.active, avatar: p.avatar }));
}

// Log actions
function addLog(action, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details
  };
  state.logs.push(logEntry);
  console.log(`[LOG] ${action}:`, JSON.stringify(details));
}

// End current quiz and broadcast revealed answer & updated leaderboard ranking
function endQuiz() {
  if (state.status !== 'quiz_active') return;
  
  state.status = 'quiz_revealed';
  const slide = getCurrentSlide();
  
  addLog('quiz_ended', { slideIndex: state.currentSlideIndex });
  
  // Broadcast revealed answer and updated rankings to ALL clients & projector
  io.emit('sync_state', {
    status: state.status,
    currentSlideIndex: state.currentSlideIndex,
    slide: slide,
    leaderboard: getLeaderboard()
  });

  // Send individual score feedback to each player
  Object.values(state.players).forEach(p => {
    io.to(p.id).emit('quiz_result', {
      answered: p.answered,
      correct: p.answerCorrect,
      scoreGained: p.scoreGained,
      totalScore: p.score
    });
  });
}

// Socket Connection Handler
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  
  // Send current state on connection
  socket.emit('sync_state', {
    status: state.status,
    currentSlideIndex: state.currentSlideIndex,
    slide: state.status !== 'lobby' ? getCurrentSlide() : null,
    totalPlayers: Object.values(state.players).filter(p => p.active).length,
    leaderboard: getLeaderboard(),
    pptIntegrationEnabled: state.pptIntegrationEnabled
  });

  // Player joins lobby
  socket.on('join_game', (data) => {
    const name = (data.name || '').trim().substring(0, 16);
    if (!name) {
      socket.emit('error_message', { message: 'Por favor, insira um nome válido.' });
      return;
    }
    
    // Check if name is taken by an active player
    const nameTaken = Object.values(state.players).some(p => p.name.toLowerCase() === name.toLowerCase() && p.active);
    if (nameTaken) {
      socket.emit('error_message', { message: 'Este nome já está em uso.' });
      return;
    }

    state.players[socket.id] = {
      id: socket.id,
      name: name,
      avatar: data.avatar || '🚗',
      score: 0,
      active: true,
      answered: false,
      answerCorrect: false,
      scoreGained: 0
    };

    addLog('player_join', { name, socketId: socket.id });
    
    socket.emit('join_success', { name, score: 0 });
    
    socket.emit('sync_state', {
      status: state.status,
      currentSlideIndex: state.currentSlideIndex,
      slide: state.status !== 'lobby' ? getCurrentSlide() : null,
      leaderboard: getLeaderboard()
    });

    io.emit('lobby_update', {
      players: Object.values(state.players).filter(p => p.active).map(p => p.name),
      totalPlayers: Object.values(state.players).filter(p => p.active).length
    });
  });

  // Player answers a question
  socket.on('submit_answer', (data) => {
    const player = state.players[socket.id];
    if (!player || !player.active) return;
    if (state.status !== 'quiz_active') return;
    if (player.answered) return;

    const currentSlide = getCurrentSlide();
    if (!currentSlide || currentSlide.type !== 'quiz') return;

    const selectedOptionIndex = parseInt(data.optionIndex);
    let isCorrect = false;
    let optionLetter = '?';
    
    if (currentSlide.correct === "all" || currentSlide.correct === -1) {
      isCorrect = true;
    } else if (Array.isArray(currentSlide.correct)) {
      isCorrect = currentSlide.correct.includes(selectedOptionIndex);
    } else {
      isCorrect = selectedOptionIndex === currentSlide.correct;
    }
    optionLetter = ['A', 'B', 'C', 'D', 'E'][selectedOptionIndex] || '?';
    
    const timeTakenMs = Date.now() - state.currentQuestionStartTime;
    const timeLimitMs = 20000;
    let speedBonus = 0;
    if (isCorrect) {
      speedBonus = Math.max(0, Math.round(500 * (1 - (timeTakenMs / timeLimitMs))));
    }
    
    const basePoints = currentSlide.points || 1000;
    const scoreGained = isCorrect ? (basePoints + speedBonus) : 0;

    player.answered = true;
    player.answerCorrect = isCorrect;
    player.scoreGained = scoreGained;
    player.score += scoreGained;
    
    state.answersCount[optionLetter] = (state.answersCount[optionLetter] || 0) + 1;
    state.answeredCount++;

    addLog('player_answer', {
      name: player.name,
      option: optionLetter,
      correct: isCorrect,
      timeTakenMs,
      scoreGained,
      totalScore: player.score
    });

    socket.emit('answer_received', { scoreGained, isCorrect });
    
    io.emit('answer_progress', {
      answeredCount: state.answeredCount,
      answersCount: state.answersCount
    });
  });

  // Minigame score submission
  socket.on('submit_minigame_score', (data) => {
    const player = state.players[socket.id];
    if (!player || !player.active) return;
    
    const minigameScore = Math.max(0, Math.min(2000, parseInt(data.score) || 0));
    player.score += minigameScore;
    
    socket.emit('minigame_score_received', {
      minigameScore,
      newTotalScore: player.score
    });
  });

  // ADMIN CONTROLS

  socket.on('admin_start', () => {
    state.status = 'content';
    state.currentSlideIndex = 0;
    addLog('admin_start_presentation', { slideIndex: 0 });
    
    controlPowerPoint('start');
    
    io.emit('sync_state', {
      status: state.status,
      currentSlideIndex: state.currentSlideIndex,
      slide: getCurrentSlide(),
      leaderboard: getLeaderboard()
    });
  });

  socket.on('admin_change_slide', (data) => {
    const direction = data.direction;
    let newIndex = state.currentSlideIndex;

    if (direction === 'next') {
      newIndex = Math.min(presentationData.length - 1, state.currentSlideIndex + 1);
    } else if (direction === 'prev') {
      newIndex = Math.max(0, state.currentSlideIndex - 1);
    } else if (typeof direction === 'number') {
      newIndex = Math.max(0, Math.min(presentationData.length - 1, direction));
    }

    state.currentSlideIndex = newIndex;
    const slide = getCurrentSlide();
    
    controlPowerPoint('goto', newIndex);
    
    state.answeredCount = 0;
    state.answersCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    
    Object.values(state.players).forEach(p => {
      p.answered = false;
      p.answerCorrect = false;
      p.scoreGained = 0;
    });

    state.status = 'content';

    addLog('admin_slide_change', { newIndex, type: slide ? slide.type : 'none', status: state.status });

    io.emit('sync_state', {
      status: state.status,
      currentSlideIndex: state.currentSlideIndex,
      slide: slide,
      leaderboard: getLeaderboard()
    });
  });

  socket.on('admin_release_quiz', () => {
    const slide = getCurrentSlide();
    if (!slide || slide.type !== 'quiz') return;

    state.status = 'quiz_active';
    state.currentQuestionStartTime = Date.now();
    state.answeredCount = 0;
    state.answersCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    addLog('admin_release_quiz', { slideIndex: state.currentSlideIndex, title: slide.title });

    io.emit('sync_state', {
      status: state.status,
      currentSlideIndex: state.currentSlideIndex,
      slide: slide,
      timerDuration: 20
    });
  });

  socket.on('admin_reveal_answer', () => {
    endQuiz();
  });

  socket.on('admin_show_thermometer', () => {
    state.status = 'thermometer';
    
    // Calculate a mock vulnerability score based on recent activity
    let vulnerabilityScore = 68; // default
    if (state.answeredCount > 0) {
      // Find correct option for current slide to calculate actual accuracy
      const slide = getCurrentSlide();
      let correctAnswers = 0;
      if (slide && slide.type === 'quiz') {
        const optionLetter = ['A', 'B', 'C', 'D', 'E'][slide.correct] || 'A';
        if (slide.correct === 'all') correctAnswers = state.answeredCount;
        else correctAnswers = state.answersCount[optionLetter] || 0;
        
        const accuracy = (correctAnswers / state.answeredCount) * 100;
        vulnerabilityScore = Math.max(10, Math.min(95, 100 - accuracy));
      }
    }

    addLog('admin_show_thermometer', { score: vulnerabilityScore });

    io.emit('sync_state', {
      status: state.status,
      currentSlideIndex: state.currentSlideIndex,
      slide: getCurrentSlide(),
      leaderboard: getLeaderboard(),
      vulnerabilityScore: Math.round(vulnerabilityScore)
    });
  });

  socket.on('admin_start_minigame', () => {
    state.status = 'minigame_active';
    addLog('minigame_started', { slideIndex: state.currentSlideIndex });

    io.emit('sync_state', {
      status: state.status,
      currentSlideIndex: state.currentSlideIndex,
      slide: getCurrentSlide(),
      timerDuration: 20
    });
  });

  socket.on('admin_end_minigame', () => {
    state.status = 'content';
    addLog('minigame_ended', { slideIndex: state.currentSlideIndex });
    
    io.emit('sync_state', {
      status: state.status,
      currentSlideIndex: state.currentSlideIndex,
      slide: getCurrentSlide(),
      leaderboard: getLeaderboard()
    });
  });

  socket.on('admin_toggle_ppt', (data) => {
    state.pptIntegrationEnabled = !!data.enabled;
    addLog('admin_toggle_ppt', { enabled: state.pptIntegrationEnabled });
  });

  socket.on('admin_reset', () => {
    state.currentSlideIndex = 0;
    state.status = 'lobby';
    state.players = {};
    state.answeredCount = 0;
    state.answersCount = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    state.logs = [];

    addLog('admin_reset_game', {});
    io.emit('reset_game');
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    if (state.players[socket.id]) {
      if (state.status === 'lobby') {
        delete state.players[socket.id];
      } else {
        state.players[socket.id].active = false;
      }
      io.emit('lobby_update', {
        players: Object.values(state.players).filter(p => p.active).map(p => p.name),
        totalPlayers: Object.values(state.players).filter(p => p.active).length
      });
    }
  });
});

// Run server
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` SERVER RUNNING: http://localhost:${PORT}`);
  console.log(` Admin control screen: http://localhost:${PORT}/admin.html`);
  console.log(` Presenter screen: http://localhost:${PORT}/present.html`);
  console.log(` Player joining screen: http://localhost:${PORT}/index.html`);
  console.log(`==================================================`);
});
