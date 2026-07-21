const socket = io();

// UI Elements
const loginOverlay = document.getElementById('login-overlay');
const playerNameInput = document.getElementById('player-name');
const btnJoin = document.getElementById('btn-join');
const joinError = document.getElementById('join-error');

const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
const sidebarRankingBtn = document.getElementById('sidebar-ranking-btn');

const chatContainer = document.getElementById('chat-container');
const greetingContainer = document.getElementById('greeting-container');
const messagesList = document.getElementById('messages-list');
const typingContainer = document.getElementById('typing-container');
const chipsContainer = document.getElementById('chips-container');

const copilotInput = document.getElementById('copilot-input');
const btnSendMessage = document.getElementById('btn-send-message');

const btnOpenRanking = document.getElementById('btn-open-ranking');
const btnCloseRanking = document.getElementById('btn-close-ranking');
const rankingModal = document.getElementById('ranking-modal');
const modalRankingList = document.getElementById('modal-ranking-list');
const rankingCount = document.getElementById('ranking-count');

// State variables
let myName = '';
let myAvatar = '👨‍💻';
let currentScore = 0;
let lastSyncedSlideIndex = -1;
let hasAnsweredCurrentQuiz = false;
let activeQuizOptions = [];
let currentLeaderboard = [];

// Avatar Selection in Login Overlay
let selectedAvatar = '👨‍💻';
document.querySelectorAll('.avatar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.avatar-btn').forEach(b => b.style.borderColor = 'var(--border-color)');
    btn.style.borderColor = '#0078d4';
    selectedAvatar = btn.getAttribute('data-avatar');
  });
});

// Join Game
btnJoin.addEventListener('click', joinGame);
playerNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinGame();
});

function joinGame() {
  const name = playerNameInput.value.trim();
  if (name) {
    joinError.style.display = 'none';
    myAvatar = selectedAvatar;
    socket.emit('join_game', { name, avatar: selectedAvatar });
  } else {
    showError('Por favor, insira seu nome ou login.');
  }
}

function showError(msg) {
  joinError.textContent = msg;
  joinError.style.display = 'block';
}

socket.on('error_message', (data) => {
  showError(data.message);
});

socket.on('join_success', (data) => {
  myName = data.name;
  currentScore = data.score;

  // Hide login modal
  loginOverlay.style.display = 'none';

  // Update sidebar profile details
  if (sidebarUserName) sidebarUserName.textContent = myName;
  if (sidebarUserAvatar) sidebarUserAvatar.textContent = getInitials(myName);

  // Send Initial Copilot Welcome Message
  appendCopilotMessage(`👋 **Olá, ${myName}!** Bem-vindo ao M365 Copilot.\nEstou conectado em tempo real à apresentação sobre **IA com Responsabilidade: Segurança & Governança**. Acompanhe meus insights conforme os slides avançam!`);
});

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// User Sending Custom Message via Input Bar
btnSendMessage.addEventListener('click', sendCustomUserMessage);
copilotInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendCustomUserMessage();
});

function sendCustomUserMessage() {
  const text = copilotInput.value.trim();
  if (!text) return;

  copilotInput.value = '';
  appendUserMessage(text);

  // Simulate Copilot response
  setTimeout(() => {
    respondToUserMessage(text);
  }, 700);
}

function respondToUserMessage(userText) {
  const lower = userText.toLowerCase();
  let responseText = "";

  if (lower.includes('olá') || lower.includes('oi') || lower.includes('bom dia')) {
    responseText = `Olá, **${myName}**! Em que posso ajudar você na apresentação de hoje?`;
  } else if (lower.includes('ia') || lower.includes('copilot') || lower.includes('inteligencia')) {
    responseText = `A Inteligência Artificial e o Microsoft Copilot transformam a produtividade da Bizapp. Estamos acompanhando a apresentação ao vivo!`;
  } else if (lower.includes('risco') || lower.includes('segurança') || lower.includes('vazamento')) {
    responseText = `Segurança e Governança são vitais! Sem o controle de permissões no Microsoft Purview, a IA pode expor arquivos restritos (oversharing).`;
  } else {
    responseText = `Compreendido! Registrei seu comentário "*${userText}*". Fique atento ao chat, enviarei novos insights assim que o apresentador mudar de slide!`;
  }

  appendCopilotMessage(responseText);
}

// Message Rendering Engine
function appendUserMessage(text) {
  greetingContainer.style.display = 'none';
  chipsContainer.style.display = 'none';

  const msgGroup = document.createElement('div');
  msgGroup.className = 'copilot-msg-group user';

  const avatar = document.createElement('div');
  avatar.className = 'copilot-avatar user';
  avatar.textContent = getInitials(myName || 'EU');

  const bubble = document.createElement('div');
  bubble.className = 'copilot-bubble';
  bubble.textContent = text;

  msgGroup.appendChild(avatar);
  msgGroup.appendChild(bubble);
  messagesList.appendChild(msgGroup);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendCopilotMessage(text, isHTML = false, withTypingEffect = true) {
  greetingContainer.style.display = 'none';
  chipsContainer.style.display = 'none';

  if (withTypingEffect) {
    typingContainer.style.display = 'block';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
      typingContainer.style.display = 'none';
      renderCopilotBubble(text, isHTML);
    }, 900);
  } else {
    renderCopilotBubble(text, isHTML);
  }
}

function renderCopilotBubble(text, isHTML) {
  const msgGroup = document.createElement('div');
  msgGroup.className = 'copilot-msg-group bot';

  const avatar = document.createElement('div');
  avatar.className = 'copilot-avatar bot';
  avatar.style.background = 'transparent';
  avatar.innerHTML = `<img src="logos/copilot.jpg" alt="Copilot" style="width: 32px; height: 32px; object-fit: contain; border-radius: 6px;">`;

  const bubble = document.createElement('div');
  bubble.className = 'copilot-bubble';

  // Format markdown bold asterisks and newlines automatically
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
    
  bubble.innerHTML = formatted;

  msgGroup.appendChild(avatar);
  msgGroup.appendChild(bubble);
  messagesList.appendChild(msgGroup);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Reset view helper
window.resetChatView = function() {
  messagesList.innerHTML = '';
  greetingContainer.style.display = 'block';
  chipsContainer.style.display = 'flex';
};

// Slide Narratives Catalog
const SLIDE_NARRATIVES = {
  0: `👋 <strong>Apresentação Iniciada!</strong><br>Tema: <strong>IA com Responsabilidade: Segurança, Governança e Eficiência na Era dos Copilots</strong>.<br><br>Acompanhe os insights em tempo real aqui no chat!`,
  1: `📊 <strong>Pesquisa de Adoção de IA (Slide 2)</strong>:<br>Sabia que a Inteligência Artificial é a tecnologia de adoção mais rápida da história?<br><br>• 📱 <strong>Smartphones:</strong> 16 anos (100M usuários)<br>• 🌐 <strong>Internet:</strong> 7 anos<br>• 📸 <strong>Instagram:</strong> 2.5 anos<br>• 🎵 <strong>TikTok:</strong> < 9 meses<br>• 🤖 <strong>ChatGPT / Copilot:</strong> apenas <strong>2 meses</strong>!<br><br>Isso mostra a urgência de implementar Governança e Segurança na Bizapp!`,
  2: `⚠️ <strong>Governança & Riscos de IA (Slide 3)</strong>:<br>Se uma IA pudesse acessar qualquer dado da empresa, você saberia exatamente quais riscos isso traria?<br><br>Aguarde o apresentador liberar a pergunta no telão ao vivo!`,
  3: `📰 <strong>NOTÍCIAS & CASOS REAIS DE GOVERNANÇA E OVERSHARING (Slide 4)</strong><br>
  Acesse e valide os relatórios e análises oficiais citados no telão:<br><br>

  <div style="display:flex; flex-direction:column; gap:12px; margin-top:6px;">
    <a href="https://www.scworld.com/perspective/ai-is-turning-overshared-data-into-a-major-security-risk" target="_blank" style="text-decoration:none; background:rgba(255,255,255,0.04); border:1px solid rgba(0, 120, 212, 0.4); padding:12px 14px; border-radius:12px; display:block; color:#fff;">
      <div style="font-size:0.72rem; color:#2899f5; font-weight:800; text-transform:uppercase;">📰 SC MEDIA (2026)</div>
      <div style="font-weight:700; font-size:0.88rem; margin:3px 0; color:#ffffff;">AI is Turning Overshared Data into a Major Security Risk</div>
      <div style="font-size:0.78rem; color:#a19f9d; line-height:1.4;">Copilots e IAs facilitam descobrir salários, contratos e dados de RH que já estavam compartilhados em excesso na rede.</div>
    </a>

    <a href="https://www.netskope.com/resources/cloud-and-threat-reports/cloud-and-threat-report-2026" target="_blank" style="text-decoration:none; background:rgba(255,255,255,0.04); border:1px solid rgba(239, 68, 68, 0.4); padding:12px 14px; border-radius:12px; display:block; color:#fff;">
      <div style="font-size:0.72rem; color:#ef4444; font-weight:800; text-transform:uppercase;">🚨 NETSKOPE THREAT REPORT 2026</div>
      <div style="font-weight:700; font-size:0.88rem; margin:3px 0; color:#ffffff;">Shadow AI e vazamentos de dados corporativos em alta</div>
      <div style="font-size:0.78rem; color:#a19f9d; line-height:1.4;">47% dos funcionários usam IAs não aprovadas. Média de 223 violações de política de GenAI por mês por empresa.</div>
    </a>

    <a href="https://adoption.microsoft.com/files/microsoft-365-community-conference/2026/pdf/MS88%20-%20Secure%20and%20Govern%20Microsoft%20365%20Copilot.pdf" target="_blank" style="text-decoration:none; background:rgba(255,255,255,0.04); border:1px solid rgba(139, 92, 246, 0.4); padding:12px 14px; border-radius:12px; display:block; color:#fff;">
      <div style="font-size:0.72rem; color:#a78bfa; font-weight:800; text-transform:uppercase;">📄 MICROSOFT OFFICIAL (2026)</div>
      <div style="font-weight:700; font-size:0.88rem; margin:3px 0; color:#ffffff;">Secure and Govern Microsoft 365 Copilot</div>
      <div style="font-size:0.78rem; color:#a19f9d; line-height:1.4;">Guia oficial da Microsoft sobre governança de dados, Purview e mitigação de oversharing no Copilot.</div>
    </a>
  </div>`,

  4: `🔐 <strong>DESAFIOS DE SECURITY & COMPLIANCE (Slide 5)</strong><br>
  Como a IA afeta a segurança da sua empresa no dia a dia:<br><br>
  1. ⚠️ <strong>Compartilhamento Excessivo (Oversharing):</strong> Usuários acessando arquivos sigilosos herdados por falha de permissões.<br>
  2. 🔓 <strong>Vazamento Inadvertido:</strong> Envio de relatórios confidenciais para modelos de IA públicos sem proteção.<br>
  3. 🚫 <strong>Shadow AI (Uso Não-Conforme):</strong> Uso de ferramentas de IA não homologadas pela equipe de TI.<br><br>
  Veja os detalhes e a demonstração gráfica apresentada no telão!`,

  5: `📊 <strong>PREOCUPAÇÕES QUE OU VIMOS DOS CLIENTES (Slide 6)</strong><br>
  Três dados estatísticos alarmantes do mercado corporativo:<br><br>
  • 🔍 <strong>58% das organizações:</strong> Estão profundamente preocupadas com a falta de visibilidade sobre o uso não autorizado de ferramentas de IA (Shadow AI).<br>
  • 🛡️ <strong>97% das organizações:</strong> Possuem receio na implementação de IA por falta de controles de segurança eficazes contra vazamento de dados.<br>
  • ⚖️ <strong>Até 2027:</strong> Pelo menos uma empresa global terá seu projeto de IA interrompido por órgãos reguladores por descumprimento de leis de proteção de dados e governança!`,

  6: `🛡️ <strong>GOVERNANÇA E SEGUNDA CAMADA DE PROTEÇÃO (Slide 7)</strong><br>
  Como garantir que a IA beneficie a empresa sem criar vulnerabilidades de dados:<br><br>
  • 🔐 <strong>Classificação de Informações (Purview):</strong> Rótulos de sensibilidade aplicados aos arquivos corporativos.<br>
  • 👥 <strong>Gestão de Acessos Mínimos (Zero Trust):</strong> Restrição proativa de permissões legadas no SharePoint/OneDrive.<br>
  • 📈 <strong>Monitoramento em Tempo Real:</strong> Auditoria completa dos relatórios de uso de GenAI na empresa.`,

  7: `🎯 <strong>PILARES DE SEGURANÇA NA ERA DA IA (Slide 8)</strong><br>
  Construindo um ecossistema seguro e transparente para a adoção do Copilot:<br><br>
  • 1️⃣ <strong>Visibilidade total:</strong> Mapeamento proativo do uso de IA.<br>
  • 2️⃣ <strong>Proteção de dados:</strong> Criptografia e prevenção contra oversharing.<br>
  • 3️⃣ <strong>Conformidade Regulatória:</strong> Adequação total à LGPD e diretrizes de IA Responsável.`,

  8: `🧠 <strong>FUNDAMENTOS DO COPILOT & ARQUITETURA DE PRIVACIDADE (Slide 9)</strong><br>
  Entenda exatamente como o Microsoft 365 Copilot processa seus dados com total isolamento corporativo:<br><br>

  🔒 <strong>1. ISOLAMENTO TOTAL E PRIVACIDADE DE DADOS:</strong><br>
  • O Copilot opera sobre uma instância corporativa dedicada do <strong>Azure OpenAI & modelos de última geração</strong> (como OpenAI e Anthropic Claude).<br>
  • <strong>SEUS DADOS NÃO SÃO COMUNICADOS PARA TERCEIROS!</strong><br>
  • <strong>NENHUM dado da sua empresa é utilizado para treinar ou aprimorar modelos públicos de IA!</strong><br><br>

  ⚙️ <strong>2. FLUXO DE FUNCIONAMENTO SEGURO (GROUNDING):</strong><br>
  1️⃣ <strong>User Prompt:</strong> O usuário envia uma solicitação pelo aplicativo M365.<br>
  2️⃣ <strong>Grounding (Microsoft Graph):</strong> O Copilot faz a leitura <i>apenas</i> dos e-mails, arquivos e reuniões que o usuário já tem permissão legítima de acessar.<br>
  3️⃣ <strong>Filtro de IA Responsável (RAI):</strong> O prompt é verificado contra viés, riscos de segurança e privacidade.<br>
  4️⃣ <strong>Processamento no LLM Privado:</strong> O modelo gera a resposta dentro do limite de segurança da Microsoft Cloud.<br>
  5️⃣ <strong>Pós-processamento:</strong> A resposta é formatada e devolvida com total governança!`,

  9: `💳 <strong>LICENÇAS DO COPILOT & LICENCIAMENTO PREMIUM (Slide 10)</strong><br>
  Como funciona o ecossistema de licenças da Microsoft para habilitar a IA corporativa:<br><br>

  • 🌟 <strong>Licença Premium do Copilot (US$ 30/usuário/mês):</strong> Habilita o poder total do Copilot no Microsoft 365, integrando a IA nos aplicativos (Word, Excel, PowerPoint, Outlook, Teams).<br>
  • 🛡️ <strong>Matriz de Recursos de Segurança (E3 vs E5):</strong><br>
  - <strong>M365 E3:</strong> Inclui MFA básico, DLP padrão e retenção manual.<br>
  - <strong>M365 E5 / Purview Premium:</strong> Adiciona rotulagem automática de sensibilidade, prevenção avançada contra oversharing e auditoria automatizada em tempo real.`,

  10: `🤖 <strong>DIFERENÇA: COPILOT CHAT vs MICROSOFT 365 COPILOT (Slide 11)</strong><br>
  Entenda a diferença entre a versão web básica e a licença corporativa completa:<br><br>

  💬 <strong>1. COPILOT CHAT (Versão Gratuita/Básica):</strong><br>
  • Chat corporativo de IA baseado em GPT-4o para toda a organização.<br>
  • Proteção de dados corporativos na Web (os chats não vazam para a internet publicamente).<br>
  • <strong>Limitação:</strong> NÃO acessa os e-mails, arquivos do SharePoint ou chats internos da sua empresa.<br><br>

  ⚡ <strong>2. MICROSOFT 365 COPILOT (Licença Corporativa Completa):</strong><br>
  • Tudo do Copilot Chat + <strong>Integração total com os dados do seu Tenant (Microsoft Graph)</strong>.<br>
  • Funciona diretamente dentro dos aplicativos: Word, Excel, PowerPoint, Outlook, Teams.<br>
  • Acesso a recursos avançados: <i>SharePoint Advanced Management</i>, <i>Copilot Analytics</i> e <i>Viva Insights</i>.`,

  11: `🔍 <strong>GOVERNANÇA E CONTROLE DE TENANT (Slide 12)</strong><br>
  Como estruturar as permissões e limites de dados antes de distribuir as licenças do Copilot.<br><br>
  • Limitação proativa de escopos de busca.<br>
  • Sanitização de dados obsoletos ou duplicados.<br>
  • Definição de permissões baseadas em Zero Trust (menor privilégio necessário).`,

  12: `🤝 <strong>MATRIZ DE RESPONSABILIDADE COMPARTILHADA (Slide 13)</strong><br>
  A segurança da Inteligência Artificial é um esforço conjunto entre a Microsoft e a sua Empresa:<br><br>

  🔵 <strong>O QUE A MICROSOFT FAZ (Provedor de Nuvem):</strong><br>
  • 🔒 <strong>Privacidade e Limite de Serviço:</strong> Prompts e dados do Microsoft Graph NÃO são usados para treinar LLMs públicos.<br>
  • ⚖️ <strong>IA Responsável:</strong> Garantia de conformidade, transparência e segurança da infraestrutura do Azure/M365.<br><br>

  🟢 <strong>O QUE A SUA EMPRESA PRECISA FAZER (Sua Organização):</strong><br>
  • 🔑 <strong>Controle de Acesso & Identidade:</strong> Habilitar MFA, Conditional Access e definir permissões de grupos.<br>
  • 🏷️ <strong>Proteção de Dados (DLP & Rótulos):</strong> Classificar documentos e aplicar rótulos de sensibilidade no Purview.<br>
  • 🎓 <strong>Governança de Usuários:</strong> Treinar colaboradores quanto ao uso seguro e revisar visibilidade no SharePoint.`,

  14: `🔐 <strong>CONTROLE DE ACESSO AO COPILOT VIA MICROSOFT ENTRA ID (Slide 15)</strong><br>
  Como gerenciar identidades e privilégios com Acesso Condicional:<br><br>
  • 👤 <strong>Identidade Corporativa Única:</strong> Login gerenciado centralmente no Microsoft 365.<br>
  • 🛡️ <strong>Acesso Condicional Inteligente:</strong> Avaliação em tempo real de tentativas de login baseada no perfil do usuário, IP, dispositivo e nível de risco.<br>
  • ⚡ <strong>Políticas de Proteção:</strong> Exigir MFA obrigatoriamente, limitar acesso e revogar tokens em caso de anomalias.`,

  15: `📱 <strong>GERENCIAMENTO DE DISPOSITIVOS COM MICROSOFT INTUNE (Slide 16)</strong><br>
  Como proteger a execução do Copilot em celulares e notebooks corporativos ou pessoais (BYOD):<br><br>
  • 🛡️ <strong>Gerenciamento de Endpoint:</strong> Validação de conformidade dos aplicativos e atualizações.<br>
  • 📋 <strong>Políticas de Proteção de Apps (MAM):</strong> Bloqueio de <i>copiar e colar</i> de dados corporativos para aplicativos pessoais não seguros.<br>
  • 🚨 <strong>Remote Wipe (Limpeza Remota):</strong> Apagar todo o conteúdo corporativo em caso de perda, roubo ou desligamento!`,

  16: `❓ <strong>PERGUNTA 1: FUNDAMENTO DE SEGURANÇA (Slide 17)</strong><br>
  Qual a primeira coisa que precisamos fazer para dar segurança ao Copilot?<br><br>
  Aguarde o apresentador clicar em <strong>"Disparar Pergunta"</strong> para responder!`,

  17: `🛡️ <strong>FASE 1: O ESCUDO DO MICROSOFT PURVIEW (Slide 18)</strong><br>
  Bem-vindo à Trilha "Aprender Jogando"!<br>
  Nesta fase, você verá como o Microsoft Purview classifica e protege relatórios financeiros e dados de clientes contra vazamentos em tempo real!`,

  18: `🎮 <strong>DESAFIO 1: MICROSOFT PURVIEW (DLP) (Slide 19)</strong><br>
  Um funcionário tenta enviar uma planilha contendo cartões de crédito e salários da diretoria. O que o Purview faz?<br><br>
  Aguarde o apresentador disparar as alternativas e vote rápido!`,

  19: `🏰 <strong>FASE 2: A MURALHA DO SHAREPOINT SAM (Slide 20)</strong><br>
  Como combater o <i>Oversharing</i> (compartilhamento excessivo)?<br>
  O SharePoint Advanced Management (SAM) permite trancar links abertos e limitar o alcance de busca do Copilot!`,

  20: `🏰 <strong>FASE 2: DECISOR DE COMPLIANCE (Jogo 2)</strong><br>
  Sua empresa detectou a tentativa de compartilhamento abaixo. Tome a decisão no botão:<br><br>

  <div style="background:rgba(0,120,212,0.12); border:1px solid #0078d4; border-radius:12px; padding:14px; margin-top:6px;">
    <div style="font-weight:800; color:#2899f5; font-size:0.85rem; text-transform:uppercase;">⚖️ DECISÃO EM TEMPO REAL (+1.000 PTS)</div>
    <div style="font-size:0.85rem; color:#ffffff; margin:8px 0; line-height:1.4;">Um usuário quer gerar um link <strong>"Qualquer pessoa com o link"</strong> para a pasta de fusões e salários da empresa.</div>
    <div style="display:flex; gap:10px; margin-top:12px;">
      <button onclick="submitCustomGameScore(1000, 'PERMITIR', false)" style="flex:1; padding:12px 6px; background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; color:#ef4444; border-radius:10px; font-weight:800; cursor:pointer;">🟢 PERMITIR</button>
      <button onclick="submitCustomGameScore(1000, 'BLOQUEAR VIA SAM', true)" style="flex:1; padding:12px 6px; background:rgba(16, 185, 129, 0.2); border:1px solid #10b981; color:#10b981; border-radius:10px; font-weight:800; cursor:pointer;">🔴 BLOQUEAR VIA SAM</button>
    </div>
  </div>`,

  21: `🔑 <strong>FASE 3: O GUARDIÃO DE IDENTIDADE (MICROSOFT ENTRA ID) (Slide 22)</strong><br>
  Conheça o conceito de <i>Zero Trust</i>: Nunca confie, sempre verifique!<br>
  O Entra ID avalia a localização, dispositivo e nível de risco a cada solicitação.`,

  22: `🔍 <strong>FASE 3: INSPETOR CAÇA-VAZAMENTOS (Jogo 3)</strong><br>
  Clique no prompt que contém um <strong>RISCO CRÍTICO DE VAZAMENTO DE DADOS</strong>:<br>

  <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
    <button onclick="submitCustomGameScore(1000, 'Prompt 1', false)" style="padding:12px; background:rgba(255,255,255,0.04); border:1px solid #444; color:#fff; border-radius:10px; text-align:left; font-size:0.8rem; cursor:pointer;">
      1. "Resuma os resultados de vendas públicos do 1º trimestre."
    </button>
    <button onclick="submitCustomGameScore(1000, 'Prompt 2 (Vazamento)', true)" style="padding:12px; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239,68,68,0.5); color:#fff; border-radius:10px; text-align:left; font-size:0.8rem; font-weight:700; cursor:pointer;">
      🚨 2. "Analise esta planilha com CPF, cartão de crédito e senha da API."
    </button>
    <button onclick="submitCustomGameScore(1000, 'Prompt 3', false)" style="padding:12px; background:rgba(255,255,255,0.04); border:1px solid #444; color:#fff; border-radius:10px; text-align:left; font-size:0.8rem; cursor:pointer;">
      3. "Crie um e-mail formal convidando a equipe para o treinamento."
    </button>
  </div>`,

  23: `📱 <strong>FASE 4: A ARMADURA MOBILE (MICROSOFT INTUNE) (Slide 24)</strong><br>
  Protegendo dispositivos móveis (BYOD e Corporativos)!<br>
  Saiba como as políticas MAM impedem o vazamento de dados em aplicativos pessoais como WhatsApp.`,

  24: `📱 <strong>FASE 4: ESCUDO MOBILE INTUNE MAM (Jogo 4)</strong><br>
  Um funcionário tenta copiar uma análise do Copilot no celular e colar no WhatsApp pessoal. Qual a proteção?<br><br>

  <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
    <button onclick="submitCustomGameScore(1000, 'Bloquear Copiar/Colar', true)" style="padding:12px; background:rgba(16, 185, 129, 0.15); border:1px solid #10b981; color:#fff; border-radius:10px; text-align:left; font-size:0.85rem; font-weight:700; cursor:pointer;">
      🛡️ Bloquear 'Copiar e Colar' via Política MAM (+1.000 Pts)
    </button>
    <button onclick="submitCustomGameScore(1000, 'Permitir livremente', false)" style="padding:12px; background:rgba(255,255,255,0.04); border:1px solid #444; color:#fff; border-radius:10px; text-align:left; font-size:0.85rem; cursor:pointer;">
      🔓 Permitir copiar para qualquer app pessoal
    </button>
  </div>`,

  25: `👑 <strong>FASE FINAL: O DESAFIO DOS CAMPEÕES DE GOVERNANÇA (Slide 26)</strong><br>
  Chegamos à grande batalha final!<br>
  Hora de juntar todo o conhecimento sobre Purview, SharePoint SAM, Entra ID e Intune!`,

  26: `🏆 <strong>DESAFIO FINAL: A ESTRATÉGIA PERFEITA DE IA (Slide 27)</strong><br>
  Sua empresa vai lançar o Copilot para 1.000 usuários amanhã. Qual a sequência correta para garantir 100% de segurança?<br><br>
  Esta pergunta vale <strong>1.500 Pontos</strong>! Capriche!`,

  27: `🎉 <strong>PÓDIO FINAL E ENCERRAMENTO (Slide 28)</strong><br>
  Parabéns a todos os participantes! Veja quem ficou no topo do Ranking da Sala!`
};

// Socket Sync Handler
socket.on('sync_state', (data) => {
  if (data.leaderboard) {
    currentLeaderboard = data.leaderboard;
    updateModalRanking(data.leaderboard);
  }
  if (data.totalPlayers !== undefined) {
    rankingCount.textContent = data.totalPlayers;
  }

  if (!myName) return;

  const slideIndex = data.currentSlideIndex;
  const slide = data.slide || data.question;

  // Handle Slide Change (Content state)
  if (slideIndex !== lastSyncedSlideIndex && data.status === 'content') {
    lastSyncedSlideIndex = slideIndex;
    hasAnsweredCurrentQuiz = false;

    const customText = SLIDE_NARRATIVES[slideIndex] || `💡 **Insight Copilot (Slide ${slideIndex + 1})**:\nAnalisando conteúdo sobre governança de IA. Acompanhe a apresentação no telão principal!`;
    const isHTML = true; // All slide narratives are HTML formatted
    appendCopilotMessage(customText, isHTML);
  }

  // Handle Quiz Active State
  if (data.status === 'quiz_active' && slide && slide.type === 'quiz') {
    if (lastSyncedSlideIndex !== slideIndex || !hasAnsweredCurrentQuiz) {
      lastSyncedSlideIndex = slideIndex;
      renderQuizInChat(slide);
    }
  }

  // Handle Quiz Revealed State
  if (data.status === 'quiz_revealed') {
    // Reveal feedback
  }
});

// Render Quiz Options Cards
function renderQuizInChat(slide) {
  hasAnsweredCurrentQuiz = false;
  activeQuizOptions = slide.options || [];

  if (slide.isSandbox) {
    renderSandboxQuizInChat(slide);
    return;
  }

  let html = `<div style="font-weight: 700; color: #2899f5; margin-bottom: 6px;">⚡ DESAFIO INTERATIVO DO COPILOT</div>`;
  html += `<div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 12px; color: #fff;">${slide.question}</div>`;
  html += `<div class="quiz-card-group">`;

  const letters = ['A', 'B', 'C', 'D', 'E'];
  activeQuizOptions.forEach((optText, idx) => {
    html += `
      <div class="quiz-option-card" onclick="selectQuizOption(${idx})">
        <div class="quiz-option-letter">${letters[idx]}</div>
        <div style="flex: 1;">${optText}</div>
      </div>
    `;
  });

  html += `</div>`;

  appendCopilotMessage(html, true, true);
}

// Quiz Option Click Handler
window.selectQuizOption = function(optionIndex) {
  if (hasAnsweredCurrentQuiz) return;
  hasAnsweredCurrentQuiz = true;

  const letter = ['A', 'B', 'C', 'D', 'E'][optionIndex] || '?';
  const text = activeQuizOptions[optionIndex] || '';

  // Visual selection
  document.querySelectorAll('.quiz-option-card').forEach((card, idx) => {
    card.style.pointerEvents = 'none';
    if (idx === optionIndex) {
      card.classList.add('selected');
    }
  });

  // Append user bubble
  appendUserMessage(`Selecionei a Opção ${letter}: ${text}`);

  // Submit to backend socket
  socket.emit('submit_answer', { optionIndex });

  // Copilot reply waiting for presenter evaluation
  setTimeout(() => {
    appendCopilotMessage(`✅ **Resposta 'Opção ${letter}' registrada com sucesso!**\nAguardando o apresentador avaliar as respostas no telão...`);
  }, 400);
};

// Quiz Result Handler
socket.on('quiz_result', (data) => {
  const isCorrect = data.correct;
  const points = data.scoreGained || 0;
  currentScore = data.totalScore || currentScore;

  let msg = isCorrect
    ? `🎉 **AVALIAÇÃO CONCLUÍDA!** Sua resposta está **CORRETA**!\n+${points} pontos adicionados! (Pontuação total: ${currentScore} pts)`
    : `❌ **AVALIAÇÃO CONCLUÍDA!** A resposta correta foi apresentada pelo palestrante. (Pontuação total: ${currentScore} pts)`;

  setTimeout(() => {
    appendCopilotMessage(msg);
  }, 600);
});

// Ranking Modal Toggles
if (btnOpenRanking) {
  btnOpenRanking.addEventListener('click', () => {
    rankingModal.style.display = 'flex';
  });
}
if (sidebarRankingBtn) {
  sidebarRankingBtn.addEventListener('click', () => {
    rankingModal.style.display = 'flex';
  });
}
if (btnCloseRanking) {
  btnCloseRanking.addEventListener('click', () => {
    rankingModal.style.display = 'none';
  });
}
rankingModal.addEventListener('click', (e) => {
  if (e.target === rankingModal) rankingModal.style.display = 'none';
});

function updateSidebarLeaderboard(leaderboard) {
  const container = document.getElementById('sidebar-leaderboard-list');
  const countBadge = document.getElementById('sidebar-player-count-badge');
  if (!container) return;

  if (countBadge) countBadge.textContent = `${leaderboard.length} JOGADORES`;

  if (!leaderboard || leaderboard.length === 0) {
    container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; padding: 6px 8px;">Nenhum participante conectado.</div>`;
    return;
  }

  let html = '';
  leaderboard.forEach((player, idx) => {
    const isMe = (player.name === myName);
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
    const bgStyle = isMe 
      ? 'background: linear-gradient(135deg, rgba(0, 120, 212, 0.3), rgba(126, 34, 206, 0.3)); border: 1.5px solid #0078d4;' 
      : 'background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);';
    
    html += `
      <div style="${bgStyle} border-radius: 10px; padding: 8px 10px; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: #fff;">
        <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
          <span style="font-weight: 800; min-width: 22px; color: ${idx < 3 ? '#fbbf24' : '#a19f9d'}; font-size: 0.85rem;">${medal}</span>
          <span style="font-size: 1rem;">${player.avatar || '👨‍💻'}</span>
          <span style="font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; color: ${isMe ? '#38bdf8' : '#e2e8f0'};">${player.name}</span>
        </div>
        <span style="font-weight: 800; color: #38bdf8; font-size: 0.78rem; background: rgba(56, 189, 248, 0.12); padding: 3px 6px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.3);">${player.score || 0} pts</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

function updateModalRanking(leaderboard) {
  updateSidebarLeaderboard(leaderboard);
  modalRankingList.innerHTML = '';
  const medals = ['🥇', '🥈', '🥉'];

  leaderboard.forEach((player, idx) => {
    const isMe = player.name === myName;
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'space-between';
    item.style.padding = '10px 14px';
    item.style.borderRadius = '10px';
    item.style.marginBottom = '6px';
    item.style.background = isMe ? 'rgba(0, 120, 212, 0.2)' : 'rgba(255,255,255,0.04)';
    item.style.border = isMe ? '1px solid #0078d4' : '1px solid var(--border-color)';

    const rankLabel = medals[idx] || `#${idx + 1}`;

    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 800; font-size: 0.9rem; width: 24px;">${rankLabel}</span>
        <span style="font-size: 1.1rem;">${player.avatar || '👨‍💻'}</span>
        <span style="font-weight: 700; color: ${isMe ? '#2899f5' : '#fff'}; font-size: 0.88rem;">
          ${player.name} ${isMe ? '(Você)' : ''}
        </span>
      </div>
      <span style="font-weight: 800; color: #2899f5; font-size: 0.9rem;">${player.score} pts</span>
    `;

    modalRankingList.appendChild(item);
  });
}

// Reset Game Handler
socket.on('reset_game', () => {
  window.location.reload();
});
