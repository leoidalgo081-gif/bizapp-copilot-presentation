const socket = io();

// UI Elements
const itemCountEl = document.getElementById('player-count');
const statusBadgeEl = document.getElementById('status-badge');

const slideTypeBadge = document.getElementById('slide-type-badge');
const slideNumberLabel = document.getElementById('slide-number-label');
const currentSlideTitle = document.getElementById('current-slide-title');
const currentSlideText = document.getElementById('current-slide-text');

const quizControlArea = document.getElementById('quiz-control-area');
const minigameControlArea = document.getElementById('minigame-control-area');

const slideJumpSelect = document.getElementById('slide-jump-select');
const togglePptIntegration = document.getElementById('toggle-ppt-integration');

let presentationData = [];
let currentSlideIndex = 0;

// Load slides metadata for drop-down jump selector
fetch('/presentation_data.json')
  .then(res => res.json())
  .then(data => {
    presentationData = data;
    populateSlideSelector();
  })
  .catch(err => console.error("Error loading presentation data in admin:", err));

function populateSlideSelector() {
  if (!slideJumpSelect) return;
  slideJumpSelect.innerHTML = '<option value="">Ir para um slide...</option>';
  presentationData.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    const typeTag = s.type === 'quiz' ? '❓ Quiz' : s.type === 'minigame' ? '🎮 Minijogo' : '📄 Slide';
    opt.textContent = `${i + 1}. [${typeTag}] ${s.title || 'Slide ' + (i + 1)}`;
    slideJumpSelect.appendChild(opt);
  });
}

// Connect Socket
socket.on('connect', () => {
  console.log('Admin Panel connected:', socket.id);
});

// Sync State Handler
socket.on('sync_state', (data) => {
  if (data.totalPlayers !== undefined) {
    itemCountEl.textContent = data.totalPlayers;
  }
  
  if (typeof data.currentSlideIndex === 'number') {
    currentSlideIndex = data.currentSlideIndex;
    updateAdminSlideUI(data);
  }

  if (data.pptIntegrationEnabled !== undefined) {
    togglePptIntegration.checked = data.pptIntegrationEnabled;
  }
});

// Lobby Updates
socket.on('lobby_update', (data) => {
  itemCountEl.textContent = data.totalPlayers || 0;
});

function updateAdminSlideUI(data) {
  const slide = data.slide || (presentationData[data.currentSlideIndex] ? presentationData[data.currentSlideIndex] : null);
  const index = data.currentSlideIndex;
  const total = presentationData.length || 89;

  slideNumberLabel.textContent = `Slide ${index + 1} de ${total}`;
  
  if (slideJumpSelect) slideJumpSelect.value = index;

  if (slide) {
    currentSlideTitle.textContent = slide.title || `Slide ${index + 1}`;
    currentSlideText.textContent = slide.question || slide.text || '';

    // Status & Badges
    if (slide.type === 'quiz') {
      slideTypeBadge.textContent = '❓ SLIDE QUIZ';
      slideTypeBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      slideTypeBadge.style.color = '#34d399';
      quizControlArea.style.display = 'block';
      minigameControlArea.style.display = 'none';
    } else if (slide.type === 'minigame') {
      slideTypeBadge.textContent = '🎮 SLIDE MINIJOGO';
      slideTypeBadge.style.background = 'rgba(245, 158, 11, 0.2)';
      slideTypeBadge.style.color = '#fbbf24';
      quizControlArea.style.display = 'none';
      minigameControlArea.style.display = 'block';
    } else {
      slideTypeBadge.textContent = '📄 SLIDE CONTEÚDO';
      slideTypeBadge.style.background = 'rgba(139, 92, 246, 0.2)';
      slideTypeBadge.style.color = '#a78bfa';
      quizControlArea.style.display = 'none';
      minigameControlArea.style.display = 'none';
    }
  }

  // Update Status Badge
  if (data.status === 'quiz_active') {
    statusBadgeEl.textContent = '❓ Pergunta Ativa no Celular';
    statusBadgeEl.style.color = '#fbbf24';
  } else if (data.status === 'quiz_revealed') {
    statusBadgeEl.textContent = '🏆 Resposta e Ranking Exibidos';
    statusBadgeEl.style.color = '#60a5fa';
  } else if (data.status === 'minigame_active') {
    statusBadgeEl.textContent = '🎮 Minijogo em Andamento';
    statusBadgeEl.style.color = '#f43f5e';
  } else {
    statusBadgeEl.textContent = `Slide ${index + 1} Exibido`;
    statusBadgeEl.style.color = '#34d399';
  }
}

// Navigation Actions
function changeSlide(direction) {
  socket.emit('admin_change_slide', { direction });
}

function jumpToSelectedSlide(index) {
  if (index === '') return;
  socket.emit('admin_change_slide', { direction: parseInt(index) });
}

function startPresentation() {
  socket.emit('admin_start');
}

// Quiz Actions
function releaseQuiz() {
  socket.emit('admin_release_quiz');
}

function revealAnswer() {
  socket.emit('admin_reveal_answer');
}

// Minigame Actions
function startMinigame() {
  socket.emit('admin_start_minigame');
}

function endMinigame() {
  socket.emit('admin_end_minigame');
}

// Special Event Actions
function showThermometer() {
  socket.emit('admin_show_thermometer');
}

// PPT Toggle
if (togglePptIntegration) {
  togglePptIntegration.addEventListener('change', (e) => {
    socket.emit('admin_toggle_ppt', { enabled: e.target.checked });
    if (e.target.checked) {
      alert('Integração com PowerPoint Ativada! Certifique-se de que a sua apresentação .pptx está aberta no PowerPoint Desktop.');
    }
  });
}

function resetAll() {
  if (confirm('Deseja realmente resetar toda a sessão e os pontos dos jogadores?')) {
    socket.emit('admin_reset');
  }
}
