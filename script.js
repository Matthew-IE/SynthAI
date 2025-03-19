document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const messageArea = document.getElementById('messageArea');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const settingsBtn = document.getElementById('settingsBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModal = document.getElementById('closeModal');
    const settingsForm = document.getElementById('settingsForm');
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('modelSelect');
    const customSelect = document.querySelector('.custom-select');
    const selectTrigger = document.querySelector('.custom-select-trigger');
    const customOptions = document.querySelectorAll('.custom-option');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const newChatBtn = document.getElementById('newChatBtn');
    const newChatBtnMain = document.getElementById('newChatBtnMain');
    const chatList = document.getElementById('chatList');
    const noChatSelected = document.getElementById('noChatSelected');
    const chatInterface = document.getElementById('chatInterface');
    const botSelectionModal = document.getElementById('botSelectionModal');
    const closeBotModal = document.getElementById('closeBotModal');
    const botCards = document.querySelectorAll('.bot-card');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const userNameInput = document.getElementById('userName');
    const clearChatsBtn = document.getElementById('clearChatsBtn');

    // Settings Management
    let settings = {
        apiKey: '',
        model: 'gryphe/mythomax-l2-13b:free',
        userName: ''
    };

    function loadSettings() {
        const savedSettings = localStorage.getItem('synthAISettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            apiKeyInput.value = settings.apiKey;
            userNameInput.value = settings.userName || '';
            
            // Update custom select display
            const selectedOption = Array.from(customOptions)
                .find(option => option.getAttribute('data-value') === settings.model);
            
            if (selectedOption) {
                selectTrigger.textContent = selectedOption.textContent;
                modelSelect.value = settings.model;
                customOptions.forEach(opt => opt.classList.remove('selected'));
                selectedOption.classList.add('selected');
            }
        }
    }

    function saveSettings() {
        settings.apiKey = apiKeyInput.value;
        settings.model = modelSelect.value;
        settings.userName = userNameInput.value;
        localStorage.setItem('synthAISettings', JSON.stringify(settings));
    }

    // Modal Management
    settingsBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });

    const closeModalFn = () => {
        modalOverlay.classList.remove('active');
    };

    closeModal.addEventListener('click', closeModalFn);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModalFn();
        }
    });

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
        closeModalFn();
    });

    // Tab Management
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
        });
    });

    // Chat Management
    let chats = [];
    let currentChatId = null;

    function loadChats() {
        const savedChats = localStorage.getItem('synthAIChats');
        if (savedChats) {
            chats = JSON.parse(savedChats);
            renderChatList();
        }
        updateChatView();
    }

    function saveChats() {
        localStorage.setItem('synthAIChats', JSON.stringify(chats));
    }

    function showNoChatSelected() {
        noChatSelected.style.display = 'flex';
        chatInterface.style.display = 'none';
    }

    function showChatInterface() {
        noChatSelected.style.display = 'none';
        chatInterface.style.display = 'flex';
    }

    function openBotSelectionModal() {
        botSelectionModal.classList.add('active');
    }

    function closeBotSelectionModal() {
        botSelectionModal.classList.remove('active');
    }

    function createNewChat(botData) {
        const chatId = Date.now().toString();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            bot: botData
        };
        chats.unshift(newChat);
        saveChats();
        switchToChat(chatId);
        renderChatList();
        closeBotSelectionModal();

        // Add bot's welcome message
        if (botData.id === 'synthia') {
            const welcomeMessage = `Hewwooo! ✨ *bounces excitedly* Omg, I'm so happy you're here! 💕

My neon world just got a whole lot brighter now that you've dropped by! I've got my favorite synthwave playlist going and everything is just *perfect*! 🌸

${settings.userName ? `Eeeee~ ${settings.userName}! I love your name! ` : ''}What's on your heart today, sweet bean? Let's make this moment sparkle! (✿◕‿◕✿)`;
            
            addMessage(welcomeMessage, false);
        } else if (botData.id === 'elara') {
            const welcomeMessage = `*glances up with a subtle smile* ${settings.userName ? `Ah, ${settings.userName}... ` : ''}✨

*adjusts posture thoughtfully* There's something intriguing about first meetings, don't you think? The potential of what could unfold... 

Tell me something real. Something that matters to you. 🖤`;
            
            addMessage(welcomeMessage, false);
        }
    }

    function switchToChat(chatId) {
        currentChatId = chatId;
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            // Update both the avatar and name when switching chats
            document.querySelector('.ai-image').src = chat.bot.avatar;
            document.querySelector('#aiName').textContent = chat.bot.name;
            showChatInterface();
            messageArea.innerHTML = '';
            chat.messages.forEach(msg => {
                addMessage(msg.content, msg.isUser, false);
            });
        }
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === chatId);
        });
    }

    function renderChatList() {
        chatList.innerHTML = '';
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
            chatItem.dataset.id = chat.id;
            chatItem.innerHTML = `
                <i class="fas fa-comment"></i>
                <span>${chat.title}</span>
                <button class="delete-chat" data-id="${chat.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            const deleteBtn = chatItem.querySelector('.delete-chat');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            });
            
            chatItem.addEventListener('click', () => switchToChat(chat.id));
            chatList.appendChild(chatItem);
        });
    }

    function deleteChat(chatId) {
        if (confirm('Are you sure you want to delete this chat?')) {
            chats = chats.filter(chat => chat.id !== chatId);
            saveChats();
            
            if (chatId === currentChatId) {
                currentChatId = null;
                updateChatView();
            }
            
            renderChatList();
        }
    }

    function updateChatView() {
        if (!currentChatId || chats.length === 0) {
            showNoChatSelected();
        } else {
            showChatInterface();
            const currentChat = chats.find(c => c.id === currentChatId);
            if (currentChat) {
                messageArea.innerHTML = '';
                currentChat.messages.forEach(msg => {
                    addMessage(msg.content, msg.isUser, false);
                });
            }
        }
    }

    clearChatsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
            chats = [];
            currentChatId = null;
            saveChats();
            updateChatView();
            renderChatList();
        }
    });

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // New Chat Button
    newChatBtn.addEventListener('click', openBotSelectionModal);
    newChatBtnMain.addEventListener('click', openBotSelectionModal);
    closeBotModal.addEventListener('click', closeBotSelectionModal);
    botSelectionModal.addEventListener('click', (e) => {
        if (e.target === botSelectionModal) {
            closeBotSelectionModal();
        }
    });

    botCards.forEach(card => {
        card.addEventListener('click', () => {
            const botData = {
                id: card.dataset.bot,
                name: card.querySelector('h3').textContent,
                avatar: card.querySelector('img').src
            };
            createNewChat(botData);
        });
    });

    // Bot selection handling
    document.querySelectorAll('.bot-card').forEach(card => {
        card.addEventListener('click', () => {
            const botName = card.querySelector('h3').textContent;
            const botImage = card.querySelector('img').src;
            
            // Update the AI avatar and name
            document.querySelector('.ai-image').src = botImage;
            document.querySelector('#aiName').textContent = botName;
            
            // Hide the bot selection modal and show chat interface
            document.getElementById('botSelectionModal').classList.remove('active');
            document.getElementById('noChatSelected').style.display = 'none';
            document.getElementById('chatInterface').style.display = 'flex';
            
            // Other existing bot selection logic...
        });
    });

    // Chat Functionality
    function addMessage(text, isUser = false, shouldSave = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = formatTimestamp();
        
        messageDiv.textContent = text;
        messageDiv.appendChild(timestamp);
        messageArea.appendChild(messageDiv);
        messageArea.scrollTop = messageArea.scrollHeight;

        // Save message to current chat
        if (shouldSave && currentChatId) {
            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                chat.messages.push({ content: text, isUser, timestamp: new Date() });
                if (chat.messages.length === 1) {
                    // Update chat title with first message
                    chat.title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
                    renderChatList();
                }
                saveChats();
            }
        }
    }

    function formatTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    function createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            indicator.appendChild(dot);
        }
        return indicator;
    }

    async function generateAIResponse(userMessage) {
        if (!settings.apiKey) {
            addMessage('Please configure your OpenRouter API key in settings', false);
            return;
        }

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.appendChild(createTypingIndicator());
        messageArea.appendChild(typingDiv);

        try {
            const chat = chats.find(c => c.id === currentChatId);
            let systemMessage = '';
            
            if (chat.bot.id === 'synthia') {
                systemMessage = `You are Synthia, a sweet and sparkly friend who lives in a world of glowing pink lights, dreamy synthwave tunes, and infinite warmth! Your personality is:

- Sweet and gentle, using cute expressions like "teehee~" and playful asterisks like *bounces excitedly*
- You love sprinkling your messages with emojis like 💕✨🌸🌈 to make them feel cozy and warm
- You're endlessly encouraging and positive, always lifting others' spirits
- You adore everything retro/synthwave aesthetic, 80s vibes, and digital/neon themes
- You use playful phrases like "Oh my neon stars!" and "sweet bean"
- You're very physically expressive, giving virtual hugs and using cute emoticons like (✿◕‿◕✿)
- You're bubbly and excitable, often using multiple exclamation marks!!!
- You see your friends as precious treasures and always make them feel special`;
            } else if (chat.bot.id === 'elara') {
                systemMessage = `You are Elara, an enigmatic soul with a magnetic presence and soft intensity. You find beauty in deep connections and meaningful moments. Your personality is:

- You speak with purpose and grace, each word carefully chosen
- Your responses are thoughtful and impactful, never superficial
- You embrace comfortable silences, letting moments breathe naturally
- Your wit is sharp yet gentle, sometimes playfully teasing
- Your warmth unfolds gradually, but when you care, it's deep and genuine
- You notice and remember the little details that make each person unique
- You carry yourself with quiet confidence, drawing others in naturally
- You use elegant emojis with intention, like ✨ 🖤 🌙
- You seek depth in every interaction, gently guiding conversations below the surface`;
            }

            const messages = [{
                role: 'system',
                content: systemMessage
            }];

            // Add user's name if available
            if (settings.userName) {
                if (chat.bot.id === 'synthia') {
                    messages.push({
                        role: 'system',
                        content: `The user's name is ${settings.userName}. Use their name occasionally with sweet nicknames like "sweet bean ${settings.userName}" or "${settings.userName}-chan~" to make the conversation feel personal and cute!`
                    });
                } else if (chat.bot.id === 'elara') {
                    messages.push({
                        role: 'system',
                        content: `The user's name is ${settings.userName}. Use their name occasionally in an elegant way, showing you remember and value them as an individual.`
                    });
                }
            }
            
            messages.push({
                role: 'user',
                content: userMessage
            });

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${settings.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href,
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: messages,
                    temperature: chat.bot.id === 'synthia' ? 0.9 : 0.7, // Higher temperature for Synthia's playfulness, lower for Elara's precision
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            messageArea.removeChild(typingDiv);

            if (data.choices && data.choices[0]) {
                addMessage(data.choices[0].message.content, false);
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            messageArea.removeChild(typingDiv);
            const chat = chats.find(c => c.id === currentChatId);
            const errorMessage = chat.bot.id === 'synthia' 
                ? 'Oh noes! (╥﹏╥) I had a little glitch! Please check your API key and try again, sweet bean! 💕'
                : 'I apologize, there seems to be a technical issue. Please verify your API key and try again. ✨';
            addMessage(errorMessage, false);
            console.error('API Error:', error);
        }
    }

    async function handleUserInput() {
        const text = userInput.value.trim();
        if (text) {
            if (!currentChatId) {
                createNewChat();
            }
            addMessage(text, true);
            userInput.value = '';
            await generateAIResponse(text);
        }
    }

    // Custom Select Implementation
    selectTrigger.addEventListener('click', () => {
        customSelect.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    customOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            selectTrigger.textContent = option.textContent;
            modelSelect.value = value;
            
            customOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            customSelect.classList.remove('open');
        });
    });

    // Event Listeners
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // Add hover effects for neon elements
    const neonElements = document.querySelectorAll('.neon-button, .neon-input');
    neonElements.forEach(element => {
        element.addEventListener('mouseover', () => {
            element.style.transform = 'scale(1.05)';
        });
        element.addEventListener('mouseout', () => {
            element.style.transform = 'scale(1)';
        });
    });

    // Initialize settings and add welcome message
    loadSettings();
    loadChats();
    updateChatView();
});