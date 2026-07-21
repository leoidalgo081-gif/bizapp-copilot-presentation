import json

questions_15 = [
    {
        "id": "quiz_1",
        "type": "quiz",
        "title": "Pergunta 1: Os Riscos da IA nas Empresas",
        "question": "Quais os principais riscos para uma empresa ao liberar IA sem governança prévia?",
        "options": [
            "Vazamento de dados estratégicos, violação da LGPD e oversharing por permissões legadas.",
            "Redução da velocidade da conexão de internet corporativa.",
            "Incompatibilidade física entre os computadores Windows e Mac.",
            "Aumento no consumo elétrico dos servidores de e-mail."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Exato! Sem governança, o Copilot herda permissões mal configuradas e pode expor dados restritos a qualquer funcionário."
    },
    {
        "id": "quiz_2",
        "type": "quiz",
        "title": "Pergunta 2: Responsabilidade em Incidentes de IA",
        "question": "Se o Diretor descobre que relatórios financeiros vazaram via Copilot porque a pasta estava aberta a 'Todos', quem é o responsável?",
        "options": [
            "A Governança de TI e Segurança da empresa, por não alinhar o escopo do SharePoint e as regras do Purview.",
            "Apenas o Diretor, pois ele deveria ter trancado os arquivos.",
            "A Microsoft, por ter disponibilizado a ferramenta de busca de IA.",
            "Apenas o funcionário recém-contratado que fez a pergunta à IA."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Correto! A segurança da IA é uma responsabilidade interna de Governança de TI da empresa (Matriz Compartilhada)."
    },
    {
        "id": "quiz_3",
        "type": "quiz",
        "title": "Pergunta 3: Fundamento do Copilot",
        "question": "Qual o primeiro passo indispensável antes de distribuir licenças do Copilot para a equipe?",
        "options": [
            "Sanear permissões legadas e estruturar a governança de dados no Purview e SharePoint.",
            "Confiar exclusivamente que a engenharia de prompt do usuário irá impedir vazamentos.",
            "Habilitar o Copilot apenas para a equipe de TI e bloquear os diretores.",
            "Assinar um termo de responsabilidade e liberar o ambiente sem travas."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Perfeito! Sanear permissões e rotular dados sensíveis evita que o Copilot encontre informações confidenciais."
    },
    {
        "id": "quiz_purview",
        "type": "quiz",
        "title": "Desafio 1: Microsoft Purview (DLP)",
        "question": "Um funcionário tenta copiar dados de cartão de crédito de uma planilha e enviar para o ChatGPT público ou e-mail externo. O que bloqueia?",
        "options": [
            "O Microsoft Purview Data Loss Prevention (DLP), que detecta a sensibilidade e bloqueia a exfiltração em tempo real.",
            "O Microsoft Defender Antivírus local instalado na máquina.",
            "A auditoria manual semanal da equipe de compliance.",
            "O bloqueio genérico de downloads do navegador corporativo."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Excelente! O Purview DLP bloqueia e criptografa a exfiltração de dados confidenciais instantaneamente!"
    },
    {
        "id": "quiz_5",
        "type": "quiz",
        "title": "Pergunta 5: Rotulagem de Sensibilidade",
        "question": "Como o Purview garante que documentos marcados como 'Confidencial' não sejam exibidos para estagiários no Copilot?",
        "options": [
            "Através de Rótulos de Sensibilidade (Sensitivity Labels) que aplicam criptografia e restrição de acesso nativas.",
            "Alterando o nome do arquivo para incluir a palavra 'SEGREDO'.",
            "Movendo o arquivo para uma lixeira oculta no computador.",
            "Excluindo a conta de e-mail dos estagiários."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Exato! Os Rótulos de Sensibilidade do Purview protegem o documento onde quer que ele vá."
    },
    {
        "id": "quiz_sharepoint",
        "type": "quiz",
        "title": "Desafio 2: SharePoint SAM & Oversharing",
        "question": "Um site antigo do SharePoint continha dados de salários acessíveis a 'Todos'. Como evitar que o Copilot indexe esses dados?",
        "options": [
            "Aplicar Restrição de Acesso ao Site (Site Access Restriction) e governança de Oversharing via SharePoint SAM.",
            "Desativar a busca do Windows 11 no computador.",
            "Excluir o histórico de conversas do Copilot ao final do expediente.",
            "Mudar a extensão do arquivo financeiro de .xlsx para .csv."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Correto! O SharePoint SAM permite trancar sites inteiros e limitar o alcance da busca do Copilot."
    },
    {
        "id": "quiz_7",
        "type": "quiz",
        "title": "Pergunta 7: Restricted SharePoint Search",
        "question": "O recurso 'Restricted SharePoint Search' serve especificamente para:",
        "options": [
            "Limitar temporariamente o alcance da busca do Copilot a uma lista de sites aprovados pela TI.",
            "Bloquear o acesso dos usuários à internet externa.",
            "Impedir que os usuários salvem arquivos na área de trabalho.",
            "Desativar o Microsoft Teams em celulares Android."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Excelente! O Restricted Search é ideal para a fase inicial de implantação do Copilot."
    },
    {
        "id": "quiz_entra",
        "type": "quiz",
        "title": "Desafio 3: Microsoft Entra ID (Zero Trust)",
        "question": "Um atacante tenta utilizar credenciais vazadas para logar no Copilot corporativo a partir de um país anômalo. O que barra o acesso?",
        "options": [
            "Políticas de Acesso Condicional (Conditional Access) do Entra ID com verificação de risco e MFA.",
            "O filtro de SPAM e Phishing do Exchange Online.",
            "A alteração preventiva da senha de Wi-Fi da sede.",
            "A criptografia de disco BitLocker no notebook."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Perfeito! O Entra ID analisa localização, IP e risco do login em tempo real!"
    },
    {
        "id": "quiz_9",
        "type": "quiz",
        "title": "Pergunta 9: Autenticação MFA & Riscos",
        "question": "Por que o Acesso Condicional do Entra ID é superior a senhas tradicionais na proteção de IA?",
        "options": [
            "Porque avalia continuamente o risco do dispositivo, local, aplicativo e exige MFA dinamicamente.",
            "Porque obriga o usuário a mudar a senha a cada 10 minutos.",
            "Porque impede que o usuário abra o navegador Google Chrome.",
            "Porque apaga os dados do computador se a senha for errada uma vez."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Correto! O Acesso Condicional analisa múltiplos sinais de contexto antes de conceder acesso."
    },
    {
        "id": "quiz_intune",
        "type": "quiz",
        "isSandbox": True,
        "title": "Desafio 4: Microsoft Intune (MAM & BYOD)",
        "question": "Em um celular pessoal (BYOD), o usuário tenta copiar um texto confidencial do Copilot e colar no WhatsApp pessoal. O que acontece?",
        "options": [
            "A política de Proteção de Aplicativos (MAM) do Intune bloqueia a cópia entre o app corporativo e o app pessoal.",
            "O celular bloqueia a tela por biometria facial.",
            "A conexão Bluetooth e o GPS são desativados.",
            "O consumo de dados 5G é suspenso temporariamente."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Exatamente! O Intune MAM isola dados corporativos em um contêiner protegido no celular."
    },
    {
        "id": "quiz_11",
        "type": "quiz",
        "title": "Pergunta 11: Remote Wipe (Limpeza Remota)",
        "question": "Se um colaborador perder o celular corporativo com acesso ao Copilot, qual recurso do Intune é acionado?",
        "options": [
            "Selective Wipe / Remote Wipe, apagando remotamente apenas os dados e apps corporativos sem afetar fotos pessoais.",
            "Envio de um sinal de som que toca o hino da empresa no celular.",
            "Bloqueio da linha telefônica junto à operadora móvel.",
            "Formatação física do cartão SIM de telefone."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Excelente! O Intune Selective Wipe apaga os dados da empresa instantaneamente!"
    },
    {
        "id": "quiz_12",
        "type": "quiz",
        "title": "Pergunta 12: Treinamento de LLM Privado",
        "question": "Os dados e prompts enviados ao Microsoft 365 Copilot são usados para treinar os modelos abertos da OpenAI?",
        "options": [
            "NÃO. A Microsoft garante que prompts e dados do Microsoft Graph jamais são usados para treinar modelos públicos.",
            "SIM. Todos os dados enviados viram conhecimento público na web.",
            "SIM, mas apenas se o documento for escrito em inglês.",
            "DEPENDES da quantidade de caracteres do prompt do usuário."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Com certeza! O Microsoft 365 Copilot mantém isolamento total dos dados na nuvem da empresa."
    },
    {
        "id": "quiz_13",
        "type": "quiz",
        "title": "Pergunta 13: Licenciamento Copilot Chat vs M365",
        "question": "Qual a diferença fundamental entre o Copilot Chat gratuito e o Microsoft 365 Copilot pago?",
        "options": [
            "O M365 Copilot possui integração total com o Microsoft Graph (e-mails, SharePoint, Teams) e funciona nos apps.",
            "O Copilot Chat gratuito não funciona em computadores Windows.",
            "O M365 Copilot exige que o usuário digite em código binário.",
            "Não existe nenhuma diferença técnica entre os dois."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Exato! O M365 Copilot conecta a IA diretamente aos arquivos e conversas internas do seu ambiente!"
    },
    {
        "id": "quiz_14",
        "type": "quiz",
        "title": "Pergunta 14: Shadow AI e Riscos Regulatórios",
        "question": "Por que o uso de ferramentas não aprovadas de IA (Shadow AI) gera passivos regulatórios graves de LGPD?",
        "options": [
            "Porque dados pessoais e segredos comerciais são enviados a servidores externos sem controle de retenção ou sigilo.",
            "Porque reduz o armazenamento disponível no disco C do computador.",
            "Porque impede que o Windows receba atualizações de segurança.",
            "Porque altera automaticamente o idioma do sistema para espanhol."
        ],
        "correct": 0,
        "points": 1000,
        "explanation": "Correto! O Shadow AI expõe dados sensíveis a termos de uso públicos que não atendem às exigências da LGPD."
    },
    {
        "id": "quiz_final",
        "type": "quiz",
        "isSandbox": True,
        "title": "Desafio Final: A Estratégia Perfeita de IA",
        "question": "Para implementar o Copilot para 1.000 usuários com 100% de conformidade técnica e segurança, qual é a ordem estratégica correta?",
        "options": [
            "1º Purview (rotulagem) ➔ 2º SharePoint SAM (trancar links) ➔ 3º Entra ID (MFA) ➔ 4º Intune (proteger celulares).",
            "1º Liberar licenças ➔ 2º Aguardar relatórios de uso ➔ 3º Criar regras no Purview após incidentes.",
            "1º Instalar antivírus ➔ 2º Bloquear celulares ➔ 3º Treinar gestores ➔ 4º Liberar sem restrições.",
            "1º Comprar licenças E5 ➔ 2º Trancar todo o SharePoint ➔ 3º Exigir aprovação manual da TI para cada prompt."
        ],
        "correct": 0,
        "points": 1500,
        "explanation": "Sensacional! Você dominou o Framework Oficial de Governança e Segurança em IA da Microsoft! 🏆🚀"
    }
]

with open('presentation_data.json', 'r', encoding='utf-8') as f:
    current_data = json.load(f)

# Retain content slides, remove deleted slide_20/slide_15
content_slides = [s for s in current_data if s.get('type') == 'content' and s.get('id') not in ['slide_20', 'slide_15']]

final_slides = []

# Interleave content slides and 15 quizzes
final_slides.append(content_slides[0]) # slide_9
final_slides.append(content_slides[1]) # slide_10

quiz_idx = 0
content_idx = 2

while quiz_idx < len(questions_15):
    final_slides.append(questions_15[quiz_idx])
    quiz_idx += 1
    if content_idx < len(content_slides):
        final_slides.append(content_slides[content_idx])
        content_idx += 1

with open('presentation_data.json', 'w', encoding='utf-8') as f:
    json.dump(final_slides, f, ensure_ascii=False, indent=2)

print(f'Successfully built presentation_data.json with {len(final_slides)} slides total including 15 quizzes!')
