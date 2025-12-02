// ===== AUTHENTICATION CHECK =====
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    const isGuest = sessionStorage.getItem('isGuest');
    
    updateHeaderButtons(isLoggedIn, isGuest);
    
    if (isLoggedIn) {
        loadChatHistory();
    }
});

// Update header buttons based on login status
function updateHeaderButtons(isLoggedIn, isGuest) {
    const headerButtons = document.getElementById('headerButtons');
    
    if (isLoggedIn) {
        // Logged in user
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        headerButtons.innerHTML = `
            <div class="user-section">
                <span class="user-email">${userEmail}</span>
                <button onclick="clearAndResetChat()" class="clear-button">Clear Chat</button>
                <button onclick="logout()" class="logout-button">Logout</button>
            </div>
        `;
    } else if (isGuest) {
        // Guest user
        headerButtons.innerHTML = `
            <span class="guest-badge">👤 Guest Mode</span>
            <a href="login.html" class="login-btn">Login to Save History</a>
        `;
    } else {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    const saveHistory = confirm('Do you want to save your chat history?');
    
    if (!saveHistory) {
        clearChatHistory();
    }
    
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('isGuest');
    
    window.location.href = 'login.html';
}
// ===== END AUTHENTICATION CHECK =====


// ===== CHAT HISTORY STORAGE FUNCTIONS =====
function saveChatHistory() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) return;
    
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const chatKey = `chatHistory_${userEmail}`;
    
    const messages = [];
    const messageElements = document.querySelectorAll('.message');
    
    messageElements.forEach((msg, index) => {
        if (index === 0) return;
        
        const isUser = msg.classList.contains('user-message');
        const content = msg.querySelector('.message-content').innerHTML;
        
        messages.push({
            isUser: isUser,
            content: content
        });
    });
    
    localStorage.setItem(chatKey, JSON.stringify(messages));
    localStorage.setItem(`${chatKey}_api`, JSON.stringify(chatHistory));
}

function loadChatHistory() {
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (!userEmail) return;
    
    const chatKey = `chatHistory_${userEmail}`;
    const savedMessages = localStorage.getItem(chatKey);
    const savedApiHistory = localStorage.getItem(`${chatKey}_api`);
    
    if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        
        if (messages.length > 0 && suggestionChips) {
            suggestionChips.style.display = 'none';
        }
        
        messages.forEach(msg => {
            const messageDiv = createMessage(msg.content, msg.isUser);
            chatMessages.appendChild(messageDiv);
        });
        
        scrollToBottom();
    }
    
    if (savedApiHistory) {
        const apiHistory = JSON.parse(savedApiHistory);
        chatHistory.length = 1;
        chatHistory.push(...apiHistory.slice(1));
    }
}

function clearChatHistory() {
    const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    if (!userEmail) return;
    
    const chatKey = `chatHistory_${userEmail}`;
    localStorage.removeItem(chatKey);
    localStorage.removeItem(`${chatKey}_api`);
}

function clearAndResetChat() {
    if (confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
        clearChatHistory();
        chatHistory.length = 1;
        
        const allMessages = document.querySelectorAll('.message');
        allMessages.forEach((msg, index) => {
            if (index > 0) {
                msg.remove();
            }
        });
        
        if (suggestionChips) {
            suggestionChips.style.display = 'flex';
        }
        
        alert('Chat history cleared successfully!');
    }
}
// ===== END CHAT HISTORY STORAGE =====


// ===== CHATBOT CODE =====
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const suggestionChips = document.getElementById('suggestionChips');

const API_KEY = "AIzaSyCp1cOUxNWSWKaDEVbxtDWQN7jVNhYHVoQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const chatHistory = [
    {
        role: "model",
        parts: [{
            text: `You are a Student Guidance Assistant. Your role is to help students with:
            - Course recommendations and academic planning
            - Career guidance and opportunities
            - Study tips and effective learning techniques
            - Goal setting and achievement strategies
            - College information and admission guidance
            - Time management and productivity
            - Exam preparation strategies
            - Skill development recommendations
            
            If someone asks about topics completely unrelated to education, career, or student life, politely remind them that you specialize in student guidance and redirect them back to educational topics.
            
            Keep responses helpful, encouraging, and student-friendly.`
        }]
    }
];

function createMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = content;
    
    messageDiv.appendChild(messageContent);
    return messageDiv;
}

function createThinkingIndicator() {
    const thinkingDiv = createMessage('', false);
    const thinking = document.createElement('div');
    thinking.className = 'thinking';
    thinking.innerHTML = `
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
        <div class="thinking-dot"></div>
    `;
    thinkingDiv.querySelector('.message-content').appendChild(thinking);
    return thinkingDiv;
}

function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

async function generateBotResponse(userMessage) {
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    const thinkingIndicator = createThinkingIndicator();
    chatMessages.appendChild(thinkingIndicator);
    scrollToBottom();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: chatHistory
            })
        });

        const data = await response.json();
        thinkingIndicator.remove();

        if (!response.ok) {
            throw new Error(data.error.message || 'API request failed');
        }

        const botResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .trim();

        const botMessage = createMessage(botResponse, false);
        chatMessages.appendChild(botMessage);

        chatHistory.push({
            role: "model",
            parts: [{ text: data.candidates[0].content.parts[0].text }]
        });

        scrollToBottom();
        saveChatHistory();

    } catch (error) {
        thinkingIndicator.remove();
        const errorMessage = createMessage(
            `❌ Sorry, I encountered an error: ${error.message}<br>Please try again.`,
            false
        );
        errorMessage.querySelector('.message-content').style.background = '#ffebee';
        errorMessage.querySelector('.message-content').style.color = '#c62828';
        chatMessages.appendChild(errorMessage);
        scrollToBottom();
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;

    if (suggestionChips) {
        suggestionChips.style.display = 'none';
    }

    const userMessage = createMessage(message, true);
    chatMessages.appendChild(userMessage);
    scrollToBottom();

    userInput.value = '';
    await generateBotResponse(message);
});

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', async () => {
        const message = chip.getAttribute('data-message');
        suggestionChips.style.display = 'none';

        const userMessage = createMessage(message, true);
        chatMessages.appendChild(userMessage);
        scrollToBottom();

        await generateBotResponse(message);
    });
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

setInterval(() => {
    saveChatHistory();
}, 30000);

window.addEventListener('beforeunload', () => {
    saveChatHistory();
});
