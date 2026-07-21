const socket = io();

// UI Screens
const screenLobby = document.getElementById('screen-lobby');
const screenContent = document.getElementById('screen-content');
const screenQuiz = document.getElementById('screen-quiz');
const screenMinigame = document.getElementById('screen-minigame');
const screenFinal = document.getElementById('screen-final');
const screenThermometer = document.getElementById('screen-thermometer');

// Layout elements
const presentGridLayout = document.getElementById('present-grid-layout');
const presentRankingSidebar = document.getElementById('present-ranking-sidebar');
const presentLeaderboardList = document.getElementById('present-leaderboard-list');

// Nav controllers elements
const btnPresentPrev = document.getElementById('btn-present-prev');
const btnPresentNext = document.getElementById('btn-present-next');
const btnPresentAction = document.getElementById('btn-present-action');
const presentSlideNumCurrent = document.getElementById('present-slide-num-current');
const presentSlideNumTotal = document.getElementById('present-slide-num-total');

// Screen state helper
function showScreen(screenEl) {
  const customCover = document.getElementById('screen-custom-cover');
  const customS10 = document.getElementById('screen-custom-slide10');
  const customS13 = document.getElementById('screen-custom-slide13');
  const customS14 = document.getElementById('screen-custom-slide14');
  const customS16 = document.getElementById('screen-custom-slide16');
  const customS17 = document.getElementById('screen-custom-slide17');
  const customS21 = document.getElementById('screen-custom-slide21');
  const customS22 = document.getElementById('screen-custom-slide22');
  const customS23 = document.getElementById('screen-custom-slide23');
  const customS25 = document.getElementById('screen-custom-slide25');
  const customS27 = document.getElementById('screen-custom-slide27');
  const customS28 = document.getElementById('screen-custom-slide28');
  
  [screenLobby, screenContent, screenQuiz, screenMinigame, screenFinal, screenThermometer, customCover, customS10, customS13, customS14, customS16, customS17, customS21, customS22, customS23, customS25, customS27, customS28].forEach(s => {
    if (s && s !== screenEl) {
      s.classList.remove('active-screen', 'exit-screen');
      s.style.display = 'none';
    }
  });

  if (screenEl) {
    screenEl.style.display = 'flex';
    requestAnimationFrame(() => {
      screenEl.classList.add('active-screen');
    });
  }
}

// Elements mapping
const instructionsUrl = document.getElementById('instructions-url');
const lobbyPlayersCount = document.getElementById('lobby-players-count');

// Content elements
const presentSlideImg = document.getElementById('present-slide-img');

// Quiz elements
const quizQuestionText = document.getElementById('quiz-question-text');
const quizOptionsBox = document.getElementById('quiz-options-box');
const quizSlideContextImg = document.getElementById('quiz-slide-context-img');
const quizStatsChartBox = document.getElementById('quiz-stats-chart-box');
const quizExplanationBox = document.getElementById('quiz-explanation-box');
const quizExplanationText = document.getElementById('quiz-explanation-text');
const quizStatusBadge = document.getElementById('quiz-status-badge');
const quizTimerVal = document.getElementById('quiz-timer-val');
const timerMetaBox = document.getElementById('timer-meta-box');
const quizAnsweredCount = document.getElementById('quiz-answered-count');

// Minigame elements
const minigamePresentStatus = document.getElementById('minigame-present-status');

// Podium elements
const winnerCongratsText = document.getElementById('winner-congrats-text');
const name1st = document.getElementById('name-1st');
const score1st = document.getElementById('score-1st');
const name2nd = document.getElementById('name-2nd');
const score2nd = document.getElementById('score-2nd');
const name3rd = document.getElementById('name-3rd');
const score3rd = document.getElementById('score-3rd');

// State tracking
let currentStatus = 'lobby';
let currentSlideData = null;
let currentSlideIndex = 0;
let totalSlidesCount = 18; // Sourced dynamically

// Dynamic address setup
instructionsUrl.textContent = `${window.location.protocol}//${window.location.host}`;

socket.on('sync_state', (data) => {
  currentStatus = data.status;
  const slide = data.slide;
  currentSlideData = slide;
  currentSlideIndex = data.currentSlideIndex || 0;
  
  // Set slide numbers counter
  presentSlideNumCurrent.textContent = data.status === 'lobby' ? '0' : data.currentSlideIndex + 1;
  
  // Set nav disabled properties
  btnPresentPrev.disabled = (data.status === 'lobby' || data.currentSlideIndex === 0);
  btnPresentNext.disabled = (data.status === 'lobby' || data.currentSlideIndex >= totalSlidesCount - 1);
  
  // Sidebar visibility layout adjustment: hide ranking sidebar on podium final screen
  if (data.status === 'final') {
    presentRankingSidebar.style.display = 'none';
    presentGridLayout.style.gridTemplateColumns = '1fr';
  } else {
    presentRankingSidebar.style.display = 'block';
    presentGridLayout.style.gridTemplateColumns = '2.8fr 1fr';
  }
  
  showScreenForState(data, slide);
  
  // Render active ranking on sync
  if (data.leaderboard) {
    renderLeaderboard(data.leaderboard);
  }
});

let activePresentActionEvent = null;
let isPresentActionTriggerBound = false;

// Smart Action helper for projector
function setupPresentAction(label, socketEvent) {
  if (!btnPresentAction) return;
  if (!label || !socketEvent) {
    btnPresentAction.style.display = 'none';
    activePresentActionEvent = null;
    return;
  }
  
  btnPresentAction.textContent = label;
  btnPresentAction.style.display = 'inline-flex';
  activePresentActionEvent = socketEvent;
  
  if (!isPresentActionTriggerBound) {
    isPresentActionTriggerBound = true;
    btnPresentAction.addEventListener('click', () => {
      if (!activePresentActionEvent) return;
      if (activePresentActionEvent === 'admin_change_slide_next') {
        socket.emit('admin_change_slide', { direction: 'next' });
      } else {
        socket.emit(activePresentActionEvent);
      }
    });
  }
}

// Global Keyboard Navigation (PowerPoint/Clicker Support)
document.addEventListener('keydown', (e) => {
  // Prevent default scrolling for spacebar and arrow keys
  if (['ArrowRight', 'ArrowLeft', ' ', 'PageDown', 'PageUp'].includes(e.key)) {
    if (e.key === ' ') e.preventDefault();
  }

  // NEXT / FORWARD ACTION
  if (['ArrowRight', ' ', 'Enter', 'PageDown'].includes(e.key)) {
    if (activePresentActionEvent) {
      if (activePresentActionEvent === 'admin_change_slide_next') {
        socket.emit('admin_change_slide', { direction: 'next' });
      } else {
        socket.emit(activePresentActionEvent);
      }
    } else {
      socket.emit('admin_change_slide', { direction: 'next' });
    }
  } 
  // PREVIOUS / BACKWARD ACTION
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
    socket.emit('admin_change_slide', { direction: 'prev' });
  }
});

function showScreenForState(data, slide) {
  if (data.status === 'lobby') {
    showScreen(screenLobby);
    setupPresentAction('Iniciar Apresentação', 'admin_start');
  } else if (data.status === 'content') {
    if (slide) {
      // Quiz slides in "content" state: show question in standby (not yet released)
      if (slide.type === 'quiz') {
        quizQuestionText.textContent = slide.question;
        renderQuizOptions(slide.options, slide.correct, false);
        if (slide.image) {
          quizSlideContextImg.src = slide.image;
          quizSlideContextImg.style.display = 'block';
        } else {
          quizSlideContextImg.style.display = 'none';
        }
        quizStatsChartBox.style.display = 'none';
        quizExplanationBox.style.display = 'none';
        quizStatusBadge.textContent = '🔒 AGUARDANDO LIBERAÇÃO';
        quizStatusBadge.style.color = '#94a3b8';
        timerMetaBox.style.display = 'none';
        quizAnsweredCount.textContent = '—';
        clearAnsweredBubbles();
        showScreen(screenQuiz);
        setupPresentAction('Liberar Pergunta', 'admin_release_quiz');
      } else if (data.currentSlideIndex === 0) {
        showScreen(document.getElementById('screen-custom-cover'));
        setupPresentAction('Próximo Slide', 'admin_change_slide_next');
      } else if (slide.id === 'slide_10') {
        showScreen(document.getElementById('screen-custom-slide10'));
        triggerSlide10Animation(false);
        setupPresentAction('Próximo Slide', 'admin_change_slide_next');
      } else if (slide.id === 'slide_13') {
        showScreen(document.getElementById('screen-custom-slide13'));
        setupPresentAction('Próximo Slide', 'admin_change_slide_next');
      } else if (slide.id === 'slide_14') {
        showScreen(document.getElementById('screen-custom-slide14'));
        setupPresentAction('Próximo Slide', 'admin_change_slide_next');
      } else if (slide.id === 'slide_16') {
        showScreen(document.getElementById('screen-custom-slide16'));
        triggerSlide16Animation();
        setupPresentAction('Próximo Slide', 'admin_change_slide_next');
      } else if (slide.id === 'slide_17') {
        showScreen(document.getElementById('screen-custom-slide17'));
        triggerSlide17Animation();
        setupPresentAction('Próximo Slide', 'admin_change_slide_next');
      } else {
        // Regular content slide with image
        showScreen(screenContent);
        if (slide.image && presentSlideImg) {
          presentSlideImg.src = slide.image;
          presentSlideImg.style.display = 'block';
        }
        if (typeof Reveal !== 'undefined' && revealInitialized) {
          Reveal.slide(data.currentSlideIndex);
        }
        setupPresentAction('Próximo Slide', 'admin_change_slide_next');
      }
    }
  } else if (data.status === 'quiz_active') {
    if (slide) {
      quizQuestionText.textContent = slide.question;
      if (slide.inputType === 'text') {
        const quizOptionsBox = document.getElementById('quiz-options-box');
        if (quizOptionsBox) {
          quizOptionsBox.innerHTML = '<div style="color: var(--color-text-secondary); font-style: italic; font-size: 1.5rem; text-align: center; margin-top: 30px;">Pergunta de Texto Livre<br><span style="font-size: 1rem;">Responda pelo seu celular!</span></div>';
        }
      } else {
        renderQuizOptions(slide.options, slide.correct, false);
      }
      
      if (slide.image) {
        quizSlideContextImg.src = slide.image;
        quizSlideContextImg.style.display = 'block';
      } else {
        quizSlideContextImg.style.display = 'none';
      }
      
      quizStatsChartBox.style.display = 'none';
      quizExplanationBox.style.display = 'none';
      
      quizStatusBadge.textContent = 'VALENDO PONTOS!';
      quizStatusBadge.style.color = '#fbbf24';
      timerMetaBox.style.display = 'flex';
      quizAnsweredCount.textContent = data.answeredCount || 0;
      
      clearAnsweredBubbles();
      showScreen(screenQuiz);
      setupPresentAction('Revelar Resposta', 'admin_reveal_answer');
    }
  } else if (data.status === 'quiz_revealed') {
    if (slide) {
      quizQuestionText.textContent = slide.question;
      if (slide.inputType === 'text') {
        const quizOptionsBox = document.getElementById('quiz-options-box');
        if (quizOptionsBox) {
          quizOptionsBox.innerHTML = '<div style="color: var(--color-text-secondary); font-style: italic; font-size: 1.5rem; text-align: center; margin-top: 30px;">Pergunta de Texto Livre<br><span style="font-size: 1rem;">Respostas gravadas!</span></div>';
        }
      } else {
        renderQuizOptions(slide.options, slide.correct, true);
      }
      
      if (slide.image) {
        quizSlideContextImg.src = slide.image;
        quizSlideContextImg.style.display = 'block';
      } else {
        quizSlideContextImg.style.display = 'none';
      }
      
      quizStatsChartBox.style.display = slide.inputType === 'text' ? 'none' : 'flex';
      quizExplanationText.textContent = slide.explanation;
      quizExplanationBox.style.display = 'block';
      
      quizStatusBadge.textContent = 'RESPOSTA REVELADA';
      quizStatusBadge.style.color = '#10b981';
      timerMetaBox.style.display = 'none';
      
      showScreen(screenQuiz);
      setupPresentAction('Próximo Slide', 'admin_change_slide_next');
    }
  } else if (data.status === 'thermometer') {
    const score = data.vulnerabilityScore || 0;
    const thermometerVal = document.getElementById('thermometer-value');
    const thermometerFill = document.getElementById('thermometer-fill');
    
    if (thermometerVal) {
      thermometerVal.textContent = '0%';
      // Simple count up animation
      let startScore = 0;
      const interval = setInterval(() => {
        startScore += Math.max(1, Math.floor(score / 20));
        if (startScore >= score) {
          startScore = score;
          clearInterval(interval);
        }
        thermometerVal.textContent = startScore + '%';
      }, 50);
    }
    
    if (thermometerFill) {
      setTimeout(() => {
        thermometerFill.style.height = score + '%';
      }, 100);
    }
    
    showScreen(screenThermometer);
    setupPresentAction('Próximo Slide', 'admin_change_slide_next');
  } else if (data.status === 'minigame_active') {
    minigamePresentStatus.textContent = 'JOGO EM ANDAMENTO! DEFENDAM OS CELULARES!';
    showScreen(screenMinigame);
    setupPresentAction('Encerrar Jogo', 'admin_end_minigame');
  } else if (data.status === 'final') {
    showScreen(screenFinal);
    renderPodium(data.leaderboard);
    setupPresentAction(null, null);
  }
}

// Stats chart answers progress sync
socket.on('answer_progress', (data) => {
  quizAnsweredCount.textContent = data.answeredCount;
  
  const total = data.answeredCount || 1;
  const letters = ['A', 'B', 'C', 'D', 'E'];
  
  letters.forEach(letter => {
    const count = data.answersCount[letter] || 0;
    const percentage = Math.round((count / total) * 100);
    
    const barEl = document.getElementById(`bar-${letter}`);
    const countEl = document.getElementById(`count-${letter}`);
    
    if (barEl && countEl) {
      barEl.style.height = `${percentage}%`;
      countEl.textContent = count;
      
      if (currentStatus === 'quiz_revealed') {
        const correctIndex = currentSlideData ? currentSlideData.correct : -1;
        const letterIndex = letters.indexOf(letter);
        const isThisCorrect = (correctIndex === 'all') || 
                              (Array.isArray(correctIndex) ? correctIndex.includes(letterIndex) : (letterIndex === correctIndex));
        
        if (isThisCorrect) {
          barEl.classList.add('correct');
        } else {
          barEl.classList.remove('correct');
        }
      } else {
        barEl.classList.remove('correct');
      }
    }
  });
});

// Live answered bubble notification
socket.on('player_answered_notify', (data) => {
  const strip = document.getElementById('quiz-answered-bubbles-strip');
  if (!strip) return;

  // Create bubble
  const bubble = document.createElement('div');
  bubble.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(0, 120, 212, 0.25));
    border: 1px solid rgba(99, 102, 241, 0.5);
    border-radius: 30px;
    padding: 4px 10px 4px 6px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #e2e8f0;
    opacity: 0;
    transform: scale(0.6) translateY(10px);
    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    white-space: nowrap;
  `;
  bubble.innerHTML = `<span style="font-size:1rem;">${data.avatar}</span><span>${data.name}</span><span style="color:#a5b4fc; font-size:0.65rem;">✓</span>`;
  strip.appendChild(bubble);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1) translateY(0)';
    });
  });

  // Update answered count display
  if (quizAnsweredCount) {
    quizAnsweredCount.textContent = data.answeredCount;
  }
});

// Clear bubbles strip when quiz is reset (new slide)
function clearAnsweredBubbles() {
  const strip = document.getElementById('quiz-answered-bubbles-strip');
  if (!strip) return;
  // Remove all children except the label span
  const children = Array.from(strip.children);
  children.forEach((child, idx) => {
    if (idx > 0) strip.removeChild(child);
  });
}

// Timer sync
socket.on('timer_update', (data) => {
  quizTimerVal.textContent = `${data.timeLeft}s`;
  if (data.timeLeft <= 5) {
    quizTimerVal.style.color = '#f43f5e';
  } else {
    quizTimerVal.style.color = 'var(--color-accent)';
  }
});

// Fetch total slides count on startup
fetch('/presentation_data.json')
  .then(res => res.json())
  .then(data => {
    totalSlidesCount = data.length;
    presentSlideNumTotal.textContent = totalSlidesCount;
  });

// Bind Navigation controls to socket actions
btnPresentPrev.addEventListener('click', () => {
  socket.emit('admin_change_slide', { direction: 'prev' });
});

btnPresentNext.addEventListener('click', () => {
  socket.emit('admin_change_slide', { direction: 'next' });
});

// Start presentation from projector lobby
const btnPresentStart = document.getElementById('btn-present-start');
if (btnPresentStart) {
  btnPresentStart.addEventListener('click', () => {
    socket.emit('admin_start');
  });
}

// Render Quiz options lists helper
function renderQuizOptions(options, correctIndex, revealCorrect) {
  const containerBarE = document.getElementById('container-bar-E');
  if (containerBarE) {
    containerBarE.style.display = (options && options.length >= 5) ? 'flex' : 'none';
  }
  
  quizOptionsBox.innerHTML = '';
  options.forEach((opt, idx) => {
    const letter = ['A', 'B', 'C', 'D', 'E'][idx];
    const card = document.createElement('div');
    card.className = 'present-option-card';
    
    const isThisCorrect = (correctIndex === 'all') || 
                          (Array.isArray(correctIndex) ? correctIndex.includes(idx) : (idx === correctIndex));
    
    if (revealCorrect && isThisCorrect) {
      card.classList.add('correct');
    } else if (revealCorrect) {
      card.classList.add('wrong');
    }
    
    card.innerHTML = `
      <div class="present-option-letter">${letter}</div>
      <div>${opt}</div>
    `;
    quizOptionsBox.appendChild(card);
  });
}

// Render dynamic sidebar ranking leaderboard rows
function renderLeaderboard(players) {
  if (currentStatus === 'lobby') return; // Handled by lobby online players list update
  
  presentLeaderboardList.innerHTML = '';
  if (!players || players.length === 0) {
    presentLeaderboardList.innerHTML = `<div style="text-align: center; color: var(--color-text-secondary); margin-top: 40px; font-size: 0.9rem;">
      Nenhum participante conectado.
    </div>`;
    return;
  }
  
  // Show top 8 players on projector view
  players.slice(0, 8).forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = `player-row ${p.active ? '' : 'inactive'}`;
    row.innerHTML = `
      <div class="player-row-left">
        <span class="player-rank">${idx + 1}</span>
        <span class="player-name">${p.name} ${!p.active ? '(off)' : ''}</span>
      </div>
      <span class="player-score">${p.score} pts</span>
    `;
    presentLeaderboardList.appendChild(row);
  });
}

// Lobby connection count updates
socket.on('lobby_update', (data) => {
  lobbyPlayersCount.textContent = data.totalPlayers;
  
  if (currentStatus === 'lobby') {
    presentLeaderboardList.innerHTML = '';
    if (data.players.length === 0) {
      presentLeaderboardList.innerHTML = `<div style="text-align: center; color: var(--color-text-secondary); margin-top: 40px; font-size: 0.9rem;">
        Nenhum participante conectado ainda.
      </div>`;
      return;
    }
    
    data.players.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = 'player-row';
      row.innerHTML = `
        <div class="player-row-left">
          <span class="player-rank">${idx + 1}</span>
          <span class="player-name">${p}</span>
        </div>
        <span class="player-score" style="color: #10b981;">Online</span>
      `;
      presentLeaderboardList.appendChild(row);
    });
  }
});

// Render final winners podium
function renderPodium(players) {
  document.getElementById('podium-1st').style.height = '0px';
  document.getElementById('podium-2nd').style.height = '0px';
  document.getElementById('podium-3rd').style.height = '0px';
  
  winnerCongratsText.textContent = '';
  
  if (!players || players.length === 0) return;
  
  const p1 = players[0];
  const p2 = players[1] || null;
  const p3 = players[2] || null;
  
  name1st.textContent = p1.name;
  score1st.textContent = `${p1.score} pts`;
  winnerCongratsText.textContent = `Parabéns ${p1.name}! Você é o grande campeão da segurança! 🎉`;
  
  if (p2) {
    name2nd.textContent = p2.name;
    score2nd.textContent = `${p2.score} pts`;
  }
  if (p3) {
    name3rd.textContent = p3.name;
    score3rd.textContent = `${p3.score} pts`;
  }
  
  setTimeout(() => {
    document.getElementById('podium-1st').style.height = '240px';
    if (p2) document.getElementById('podium-2nd').style.height = '170px';
    if (p3) document.getElementById('podium-3rd').style.height = '120px';
    
    // Confetti!
    triggerConfetti();
  }, 500);
}

// Confetti Generator
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999';
  
  let particles = [];
  const colors = ['#6366f1', '#8b5cf6', '#fbbf24', '#10b981', '#f43f5e'];
  
  for (let i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    particles = particles.filter(p => p.y <= canvas.height);
    
    if (particles.length > 0) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  requestAnimationFrame(draw);
}

// Window resize sync for canvas
window.addEventListener('resize', () => {
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// Force game reload on reset
socket.on('reset_game', () => {
  window.location.reload();
});

// Keyboard navigation (Arrow keys & presentation clickers support)
window.addEventListener('keydown', (e) => {
  // Ignore keydowns inside input or textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault(); // Prevent page scrolling/space actions
    
    if (currentStatus === 'lobby') {
      socket.emit('admin_start');
    } else if (btnPresentAction && btnPresentAction.style.display !== 'none') {
      btnPresentAction.click();
    } else if (!btnPresentNext.disabled) {
      btnPresentNext.click();
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    if (!btnPresentPrev.disabled) {
      btnPresentPrev.click();
    }
  }
});

// Fullscreen button event handler
const btnFullscreen = document.getElementById('btn-fullscreen');
if (btnFullscreen) {
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error entering full-screen mode: ${err.message}`);
      });
      btnFullscreen.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4"/>
        </svg>
        Sair Tela Cheia
      `;
    } else {
      document.exitFullscreen();
      btnFullscreen.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
        Tela Cheia
      `;
    }
  });
}

let slide10Timeouts = [];

// Slide 10 custom interactive animated chart trigger
function triggerSlide10Animation(isAdmin) {
  slide10Timeouts.forEach(clearTimeout);
  slide10Timeouts = [];

  const prefix = isAdmin ? 'admin-' : '';
  const barHeights = isAdmin 
    ? ['240px', '160px', '90px', '50px', '25px']
    : ['260px', '170px', '95px', '55px', '30px'];
    
  // Reset elements to initial unanimated state
  for (let i = 1; i <= 5; i++) {
    const bar = document.getElementById(`${prefix}s10-bar-${i}`);
    const val = document.getElementById(`${prefix}s10-val-${i}`);
    if (bar && val) {
      bar.style.height = '0px';
      val.style.opacity = '0';
    }
  }
  
  for (let i = 1; i <= 3; i++) {
    const card = document.getElementById(`${prefix}s10-card-${i}`);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = isAdmin ? 'translateX(20px)' : 'translateX(30px)';
    }
  }
  
  // Animate elements chronologically with distinct delays
  const mainTimeout = setTimeout(() => {
    // 1. Smartphones (16 years)
    slide10Timeouts.push(setTimeout(() => {
      const bar = document.getElementById(`${prefix}s10-bar-1`);
      const val = document.getElementById(`${prefix}s10-val-1`);
      if (bar) bar.style.height = barHeights[0];
      if (val) val.style.opacity = '1';
    }, 100));
    
    // 2. Internet (7 years)
    slide10Timeouts.push(setTimeout(() => {
      const bar = document.getElementById(`${prefix}s10-bar-2`);
      const val = document.getElementById(`${prefix}s10-val-2`);
      if (bar) bar.style.height = barHeights[1];
      if (val) val.style.opacity = '1';
    }, 600));
    
    // 3. Instagram (2.5 years)
    slide10Timeouts.push(setTimeout(() => {
      const bar = document.getElementById(`${prefix}s10-bar-3`);
      const val = document.getElementById(`${prefix}s10-val-3`);
      if (bar) bar.style.height = barHeights[2];
      if (val) val.style.opacity = '1';
    }, 1100));
    
    // 4. TikTok (< 9 months)
    slide10Timeouts.push(setTimeout(() => {
      const bar = document.getElementById(`${prefix}s10-bar-4`);
      const val = document.getElementById(`${prefix}s10-val-4`);
      if (bar) bar.style.height = barHeights[3];
      if (val) val.style.opacity = '1';
    }, 1600));
    
    // 5. ChatGPT (2 months)
    slide10Timeouts.push(setTimeout(() => {
      const bar = document.getElementById(`${prefix}s10-bar-5`);
      const val = document.getElementById(`${prefix}s10-val-5`);
      if (bar) bar.style.height = barHeights[4];
      if (val) val.style.opacity = '1';
    }, 2100));
    
    // Animate benefits cards with slight delays after the chart builds
    slide10Timeouts.push(setTimeout(() => {
      const card = document.getElementById(`${prefix}s10-card-1`);
      if (card) {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }
    }, 2600));
    
    slide10Timeouts.push(setTimeout(() => {
      const card = document.getElementById(`${prefix}s10-card-2`);
      if (card) {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }
    }, 3000));
    
    slide10Timeouts.push(setTimeout(() => {
      const card = document.getElementById(`${prefix}s10-card-3`);
      if (card) {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }
    }, 3400));
  }, 100);
  slide10Timeouts.push(mainTimeout);
}

let slide16Timeouts = [];

// Slide 16 Animation logic
function triggerSlide16Animation() {
  // Clear existing timeouts to prevent animation overlap when going back and forth
  slide16Timeouts.forEach(clearTimeout);
  slide16Timeouts = [];

  // Reset all elements first
  const els = [
    's16-icons-left',
    's16-word1',
    's16-word2',
    's16-word3',
    's16-word4',
    's16-word5',
    's16-icons-right'
  ];
  
  els.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = id.includes('icons') ? 'scale(0.5)' : 'translateY(20px)';
    }
  });

  // Force reflow
  void document.body.offsetWidth;

  // Set transitions and animate sequentially
  els.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) {
      const t = setTimeout(() => {
        el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.style.opacity = '1';
        el.style.transform = id.includes('icons') ? 'scale(1)' : 'translateY(0)';
      }, 300 + (index * 300)); // Stagger by 300ms
      slide16Timeouts.push(t);
    }
  });
}

let slide17Timeouts = [];

function triggerSlide17Animation() {
  slide17Timeouts.forEach(clearTimeout);
  slide17Timeouts = [];

  const ids = ['s17-copilot-core', 's17-node-apps', 's17-node-graph', 's17-node-llm', 's17-line-apps', 's17-line-graph', 's17-line-llm'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.transition = 'none';
      el.style.opacity = '0';
      if (id === 's17-copilot-core') {
        el.style.transform = 'scale(0.6)';
      } else if (id.includes('node')) {
        if (id.includes('apps') || id.includes('graph')) el.style.transform = 'translateX(-35px)';
        else el.style.transform = 'translateX(35px)';
      }
    }
  });

  void document.body.offsetWidth;

  // 1. Show Center Core with bounce scale
  slide17Timeouts.push(setTimeout(() => {
    const el = document.getElementById('s17-copilot-core');
    if (el) {
      el.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    }
  }, 200));

  // 2. Show Nodes and lines sequentially
  const nodes = ['apps', 'graph', 'llm'];
  nodes.forEach((node, i) => {
    slide17Timeouts.push(setTimeout(() => {
      const elNode = document.getElementById('s17-node-' + node);
      const elLine = document.getElementById('s17-line-' + node);
      if (elNode) {
        elNode.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        elNode.style.opacity = '1';
        elNode.style.transform = 'translateX(0)';
      }
      if (elLine) { elLine.style.opacity = '1'; }
    }, 900 + (i * 500)));
  });

  // 3. Start Particles animation loops
  slide17Timeouts.push(setTimeout(() => {
    animateParticles17();
  }, 3000));
}

function animateParticles17() {
  // Simple implementation to fade particles in/out to simulate flow if SVG animateMotion is not used
  // For now, we will just use a CSS-like infinite glow or skip complex JS animation to save CPU
}

// Initialize Reveal.js dynamically
let revealInitialized = false;

fetch('/presentation_data.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('reveal-slides-container');
    if (!container) return;
    
    data.forEach(slide => {
      const section = document.createElement('section');
      if (slide.image) {
        section.setAttribute('data-background-image', slide.image);
        section.setAttribute('data-background-size', 'contain');
      }
      container.appendChild(section);
    });
    
    Reveal.initialize({
      embedded: true,
      controls: false,
      progress: false,
      keyboard: false,
      overview: false,
      transition: 'convex', // Beautiful 3D transition
      backgroundTransition: 'fade',
      width: 1920,
      height: 1080,
      margin: 0.04,
      minScale: 0.2,
      maxScale: 2.0
    }).then(() => {
      revealInitialized = true;
      // If we are already in content state, sync slide immediately
      if (currentStatus === 'content') {
        Reveal.slide(currentSlideIndex);
      }
    });
  })
  .catch(err => console.error('Error loading slides for Reveal:', err));

window.triggerSlide17Animation = function() {
  console.log('Slide 17 animation triggered');
};

