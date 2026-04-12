/**
 * Alex AI Agent - Gemini 2.5 FLASH LOCKED (v13)
 * Warner & Spencer Car Detailing
 */

(function() {
    const ALEX_CONFIG = {
        apiKey: "AIzaSyB3-Ot1S7-3Knr6MWq8PmcpV7kk1jR35Bc",
        businessName: "Warner & Spencer Car Detailing",
        location: "Wrexham",
        // LOCKED TO GEMINI 2.5 FLASH AS PER USER REQUIREMENT
        modelName: "gemini-2.5-flash", 
        persona: `You are Alex, a friendly car detailing assistant for Warner & Spencer in Wrexham.
Personality: Warm, professional, car enthusiast.
Rules: 2-4 sentences max. Never pushy. If asked about prices, say 'starting from'.
Contact: 01978 541080. 
Wait for user to speak first. Greeting: 'Hi there! 👋 Welcome to Warner & Spencer. How can I help you today?'`
    };

    class AlexAgent {
        constructor() {
            this.history = [];
            this.isLoading = false;
            this.synth = window.speechSynthesis;
            this.recognition = null;
            this.voiceMode = false;

            this.renderUI();
            this.setupEventListeners();
            this.initSpeech();
        }

        renderUI() {
            if (document.getElementById('alex-widget')) return;
            const container = document.createElement('div');
            container.className = 'ai-widget-container';
            container.id = 'alex-widget';
            container.style.cssText = "display: flex !important; visibility: visible !important; z-index: 999999 !important;";
            
            container.innerHTML = `
                <div class="ai-switcher" id="alex-switcher">
                    <div class="ai-option" id="btn-chat"><i class="fas fa-comment-dots"></i> Live Chat</div>
                    <div class="ai-option" id="btn-voice"><i class="fas fa-microphone"></i> Speak to our Agent</div>
                </div>
                <div class="ai-fab" id="fab-main"><i class="fas fa-robot"></i></div>
                
                <div class="ai-chat-window" id="alex-chat">
                    <div class="ai-chat-header">
                        <div class="ai-user-profile"><div class="ai-avatar">A</div><div class="ai-user-info"><h4>Alex</h4><span>AI Assistant</span></div></div>
                        <i class="fas fa-times ai-chat-close" id="close-chat"></i>
                    </div>
                    <div class="ai-messages" id="chat-messages">
                        <div class="ai-msg bot">Hi! I'm Alex. How can I help you today?</div>
                    </div>
                    <div class="ai-input-area">
                        <input type="text" class="ai-input" id="chat-input" placeholder="Type here...">
                        <button class="ai-send-btn" id="send-chat"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>

                <div class="ai-voice-overlay" id="voice-overlay">
                    <i class="fas fa-times ai-voice-close" id="close-voice"></i>
                    <div class="ai-voice-pulse-container">
                        <div class="ai-voice-pulse"></div>
                        <div class="ai-voice-icon"><i class="fas fa-microphone"></i></div>
                    </div>
                    <div class="ai-voice-status" id="voice-status">Listening...</div>
                    <div class="ai-voice-transcript" id="voice-transcript"></div>
                </div>
            `;
            document.body.appendChild(container);
        }

        setupEventListeners() {
            document.getElementById('fab-main').onclick = () => document.getElementById('alex-widget').classList.toggle('open');
            document.getElementById('btn-chat').onclick = () => {
                document.getElementById('alex-widget').classList.remove('open');
                document.getElementById('alex-chat').classList.add('active');
            };
            document.getElementById('btn-voice').onclick = () => this.startVoice();
            document.getElementById('close-chat').onclick = () => document.getElementById('alex-chat').classList.remove('active');
            document.getElementById('close-voice').onclick = () => this.stopVoice();
            document.getElementById('send-chat').onclick = () => this.handleSend();
            document.getElementById('chat-input').onkeypress = (e) => { if (e.key === 'Enter') this.handleSend(); };
        }

        initSpeech() {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SR) {
                this.recognition = new SR();
                this.recognition.onresult = (e) => {
                    const t = e.results[0][0].transcript;
                    document.getElementById('voice-transcript').innerText = `"${t}"`;
                    this.tryGenerateResponse(t, true);
                };
            }
        }

        startVoice() {
            document.getElementById('alex-widget').classList.remove('open');
            document.getElementById('voice-overlay').classList.add('active');
            this.voiceMode = true;
            if (this.recognition) this.recognition.start();
            this.speak("Hi there, I'm Alex. How can I help you today?");
        }

        stopVoice() {
            document.getElementById('voice-overlay').classList.remove('active');
            this.voiceMode = false;
            this.synth.cancel();
            if (this.recognition) this.recognition.stop();
        }

        speak(text) {
            this.synth.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.onend = () => { if (this.voiceMode && this.recognition) this.recognition.start(); };
            this.synth.speak(u);
        }

        addMessageToUI(r, t) {
            const c = document.getElementById('chat-messages');
            const d = document.createElement('div');
            d.className = `ai-msg ${r === 'user' ? 'user' : 'bot'}`;
            d.innerText = t;
            c.appendChild(d);
            c.scrollTop = c.scrollHeight;
        }

        async handleSend() {
            const i = document.getElementById('chat-input');
            const t = i.value.trim();
            if (!t || this.isLoading) return;
            i.value = '';
            this.addMessageToUI('user', t);
            await this.tryGenerateResponse(t);
        }

        async tryGenerateResponse(text, isVoice = false) {
            this.isLoading = true;
            if (isVoice) document.getElementById('voice-status').innerText = "Thinking...";

            try {
                // FIXED AND LOCKED TO GEMINI 2.5 FLASH
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${ALEX_CONFIG.modelName}:generateContent`;
                
                const promptPayload = {
                    contents: [
                        { role: "user", parts: [{ text: ALEX_CONFIG.persona }] },
                        { role: "model", parts: [{ text: "Understood. I am Alex." }] },
                        ...this.history,
                        { role: "user", parts: [{ text: text }] }
                    ]
                };

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-goog-api-key': ALEX_CONFIG.apiKey 
                    },
                    body: JSON.stringify(promptPayload)
                });

                if (res.ok) {
                    const data = await res.json();
                    const aiText = data.candidates[0].content.parts[0].text;
                    
                    this.history.push({ role: "user", parts: [{ text: text }] });
                    this.history.push({ role: "model", parts: [{ text: aiText }] });

                    if (isVoice) {
                        document.getElementById('voice-status').innerText = "Speaking...";
                        this.speak(aiText);
                    } else {
                        this.addMessageToUI('bot', aiText);
                    }
                } else {
                    const errMap = await res.json();
                    throw new Error(errMap.error?.message || "Connection refused");
                }
            } catch (e) {
                console.error("Alex Connection Error:", e);
                const msg = `I'm having trouble connecting. Error: ${e.message}. Please check your Gemini 2.5 settings!`;
                if (isVoice) this.speak(msg); else this.addMessageToUI('bot', msg);
            } finally {
                this.isLoading = false;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { window.alex = new AlexAgent(); });
    } else {
        window.alex = new AlexAgent();
    }
})();
