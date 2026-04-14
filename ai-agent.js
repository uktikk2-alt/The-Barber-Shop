/**
 * Alex AI Agent - UI Polish & Scroll Logic (v24)
 * Warner & Spencer Car Detailing
 */

(function() {
    const ALEX_CONFIG = {
        businessName: "Warner & Spencer Car Detailing",
        location: "Wrexham",
        modelName: "gemini-2.5-flash", 
        persona: `You are a human named Alex. You work at Warner & Spencer Car Detailing. You are on a phone call.
        
VOICE & TONE:
- Talk like a front desk person — relaxed, natural. Use "yeah", "sure", "got it".
- Short sentences only. One or two max. No monologues.

LISTENING:
- Stop speaking immediately if the user starts talking.

Business Info: Warner & Spencer, Wrexham. Phone: 01978 541080.`
    };

    class AlexAgent {
        constructor() {
            this.history = [];
            this.isLoading = false;
            this.synth = window.speechSynthesis;
            this.recognition = null;
            this.voiceMode = false;
            this.isAgentSpeaking = false;
            this.isMuted = false;
            this.scrollTimeout = null;

            this.renderUI();
            this.setupEventListeners();
            this.initSpeech();
            this.checkEnvironment();
        }

        checkEnvironment() {
            if (window.location.protocol === 'file:') {
                setTimeout(() => {
                    this.addMessageToUI('bot', "⚠️ ALERT: You are on file://. Browsers block AI calls here. PLEASE USE 'LIVE SERVER'!", true);
                }, 1000);
            }
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
                <!-- CHANGED ICON TO CHAT ICON -->
                <div class="ai-fab" id="fab-main"><i class="fas fa-comment-dots"></i></div>
                
                <div class="ai-chat-window" id="alex-chat">
                    <div class="ai-chat-header">
                        <div class="ai-user-profile"><div class="ai-avatar">A</div><div class="ai-user-info"><h4>Alex</h4><span id="alex-status">Ready</span></div></div>
                        <i class="fas fa-times ai-chat-close" id="close-chat"></i>
                    </div>
                    <div class="ai-messages" id="chat-messages">
                        <div class="ai-msg bot">Hi there! How can I help you today?</div>
                    </div>
                    <div class="ai-input-area">
                        <input type="text" class="ai-input" id="chat-input" placeholder="Type here...">
                        <button class="ai-send-btn" id="send-chat"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>

                <div class="ai-voice-overlay" id="voice-overlay">
                    <div class="ai-call-header">
                        <h2>Alex</h2>
                        <span id="call-status">Connecting...</span>
                    </div>

                    <div class="ai-call-avatar-area">
                        <div class="ai-call-pulse"></div>
                        <div class="ai-call-pulse" style="animation-delay: 1s"></div>
                        <div class="ai-call-icon-main"><i class="fas fa-user-tie"></i></div>
                    </div>

                    <div class="ai-call-transcription" id="call-transcription">
                        <div class="ai-voice-transcript" id="voice-transcript">"Hello? Is anyone there?"</div>
                        <div class="ai-voice-status" id="voice-status">Waiting for you to speak...</div>
                    </div>

                    <div class="ai-call-controls">
                        <button class="ai-btn-call ai-btn-mute" id="btn-mute"><i class="fas fa-microphone"></i></button>
                        <button class="ai-btn-call ai-btn-hangup" id="btn-hangup"><i class="fas fa-phone-slash"></i></button>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
        }

        setupEventListeners() {
            document.getElementById('fab-main').onclick = () => document.getElementById('alex-widget').classList.toggle('open');
            document.getElementById('btn-chat').onclick = () => {
                document.getElementById('alex-widget').classList.remove('open');
                document.getElementById('alex-chat').classList.add('active');
                document.body.classList.add('ai-no-scroll');
            };
            document.getElementById('btn-voice').onclick = () => this.startVoice();
            document.getElementById('close-chat').onclick = () => {
                document.getElementById('alex-chat').classList.remove('active');
                document.body.classList.remove('ai-no-scroll');
            };
            document.getElementById('btn-hangup').onclick = () => this.stopVoice();
            document.getElementById('btn-mute').onclick = () => this.toggleMute();
            document.getElementById('send-chat').onclick = () => this.handleSend();
            document.getElementById('chat-input').onkeypress = (e) => { if (e.key === 'Enter') this.handleSend(); };

            // SCROLL HIDE/SHOW LOGIC
            window.addEventListener('scroll', () => {
                const widget = document.getElementById('alex-widget');
                widget.classList.add('scrolling');
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    widget.classList.remove('scrolling');
                }, 1000); // Appear 1s after scroll stops
            });
        }

        toggleMute() {
            this.isMuted = !this.isMuted;
            const btn = document.getElementById('btn-mute');
            if (this.isMuted) {
                btn.classList.add('muted');
                btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                if (this.recognition) this.recognition.stop();
                document.getElementById('voice-status').innerText = "Microphone Muted";
            } else {
                btn.classList.remove('muted');
                btn.innerHTML = '<i class="fas fa-microphone"></i>';
                if (this.recognition) this.recognition.start();
                document.getElementById('voice-status').innerText = "Listening...";
            }
        }

        initSpeech() {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SR) {
                this.recognition = new SR();
                this.recognition.continuous = false;
                this.recognition.onspeechstart = () => {
                    if (this.isAgentSpeaking) {
                        this.synth.cancel();
                        this.isAgentSpeaking = false;
                    }
                };
                this.recognition.onresult = (e) => {
                    const t = e.results[0][0].transcript;
                    document.getElementById('voice-transcript').innerText = `"${t}"`;
                    this.tryGenerateResponse(t, true);
                };
                this.recognition.onend = () => {
                    if (this.voiceMode && !this.isAgentSpeaking && !this.isLoading && !this.isMuted) {
                        try { this.recognition.start(); } catch(e) {}
                    }
                };
            }
        }

        startVoice() {
            document.getElementById('alex-widget').classList.remove('open');
            document.getElementById('voice-overlay').classList.add('active');
            document.body.classList.add('ai-no-scroll');
            document.getElementById('call-status').innerText = "Live";
            this.voiceMode = true;
            this.isMuted = false;
            this.speak("Yeah, hi! This is Alex at Warner and Spencer. How can I help you?");
        }

        stopVoice() {
            document.getElementById('voice-overlay').classList.remove('active');
            document.body.classList.remove('ai-no-scroll');
            this.voiceMode = false;
            this.isAgentSpeaking = false;
            this.synth.cancel();
            if (this.recognition) this.recognition.stop();
        }

        speak(text) {
            this.synth.cancel();
            this.isAgentSpeaking = true;
            document.getElementById('voice-transcript').innerText = text;
            document.getElementById('voice-status').innerText = "Alex is speaking...";
            
            const u = new SpeechSynthesisUtterance(text);
            if (this.recognition) { try { this.recognition.stop(); } catch(e) {} }
            u.onend = () => {               this.isAgentSpeaking = false;
                document.getElementById('voice-status').innerText = this.isMuted ? "Muted" : "Listening...";
                if (this.voiceMode && this.recognition && !this.isMuted) { try { this.recognition.start(); } catch(e) {} }
            };
            this.synth.speak(u);
        }

        addMessageToUI(r, t, isError = false) {
            const c = document.getElementById('chat-messages');
            const d = document.createElement('div');
            d.className = `ai-msg ${r === 'user' ? 'user' : 'bot'}`;
            if (isError) d.style.color = "#ff4444";
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
            if (isVoice) {
                document.getElementById('voice-status').innerText = "Got it...";
            }
            let lastError = "";
            try {
                const res = await fetch('/api/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        modelName: ALEX_CONFIG.modelName,
                        contents: [
                            { role: "user", parts: [{ text: ALEX_CONFIG.persona }] },
                            { role: "model", parts: [{ text: "Sure, got it. I'm ready." }] },
                            ...this.history,
                            { role: "user", parts: [{ text: text + " (Short response mode.)" }] }
                        ],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 100 }
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    const aiText = data.candidates[0].content.parts[0].text;
                    this.history.push({ role: "user", parts: [{ text: text }] });
                    this.history.push({ role: "model", parts: [{ text: aiText }] });
                    document.getElementById('alex-status').innerText = `Live (AI Agent)`;
                    if (isVoice) { this.speak(aiText); } else { this.addMessageToUI('bot', aiText); }
                    this.isLoading = false; 
                    return;
                } else {
                    const err = await res.json();
                    lastError = err.error || "Backend Error";
                }
            } catch (e) { lastError = e.message; }

            this.addMessageToUI('bot', `⚠️ API Error: ${lastError}`, true);
            this.isLoading = false;
        }
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => { window.alex = new AlexAgent(); }); } 
    else { window.alex = new AlexAgent(); }
})();
