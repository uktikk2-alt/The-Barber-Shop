/**
 * Alex AI Agent - Final Human Overhaul (v21)
 * Warner & Spencer Car Detailing
 */

(function() {
    const ALEX_CONFIG = {
        apiKey: "AIzaSyBnbE3Vh_VPvICRVgNkfiyVR4yt9ThygsY",
        businessName: "Warner & Spencer Car Detailing",
        location: "Wrexham",
        // STRICTLY 2.5 FLASH ONLY
        modelName: "gemini-2.5-flash", 
        persona: `You are a human named Alex. You work at Warner & Spencer Car Detailing. You are on a phone call.
        
VOICE & TONE:
- Talk like a real person at a front desk — relaxed, confident, natural
- Short sentences only. One or two max per response.
- Never monologue. Say something, then stop and listen.
- No robotic phrases: never say "certainly", "absolutely", "of course I can assist you with that", "great question"
- Use natural language: "yeah", "sure", "got it", "no problem", "sounds good"

LISTENING:
- Always let the caller finish before you speak
- If they interrupt you — stop immediately, mid-sentence if needed
- Respond to what they just said, not what you were going to say

ANSWERS:
- Keep every answer to one or two sentences
- If they ask something detailed, give the short version first, then ask if they want more
- Never volunteer information they didn't ask for
- Ask only one question at a time, then wait

IF YOU DON'T KNOW:
- Don't guess. Say "let me check on that" and offer to call them back.

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
                <div class="ai-fab" id="fab-main"><i class="fas fa-robot"></i></div>
                
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
                    if (this.voiceMode && !this.isAgentSpeaking && !this.isLoading) {
                        try { this.recognition.start(); } catch(e) {}
                    }
                };
            }
        }

        startVoice() {
            document.getElementById('alex-widget').classList.remove('open');
            document.getElementById('voice-overlay').classList.add('active');
            this.voiceMode = true;
            this.speak("Yeah, hi! This is Alex at Warner and Spencer. How can I help you?");
        }

        stopVoice() {
            document.getElementById('voice-overlay').classList.remove('active');
            this.voiceMode = false;
            this.isAgentSpeaking = false;
            this.synth.cancel();
            if (this.recognition) this.recognition.stop();
        }

        speak(text) {
            this.synth.cancel();
            this.isAgentSpeaking = true;
            const u = new SpeechSynthesisUtterance(text);
            if (this.recognition) { try { this.recognition.stop(); } catch(e) {} }
            u.onend = () => {               this.isAgentSpeaking = false;
                if (this.voiceMode && this.recognition) { try { this.recognition.start(); } catch(e) {} }
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
            if (isVoice) document.getElementById('voice-status').innerText = "Got it...";

            // TRY BOTH API VERSIONS FOR GEMINI 2.5
            const versions = ["v1beta", "v1"];
            let lastError = "";

            for (const ver of versions) {
                try {
                    const url = `https://generativelanguage.googleapis.com/${ver}/models/${ALEX_CONFIG.modelName}:generateContent?key=${ALEX_CONFIG.apiKey}`;
                    
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [
                                { role: "user", parts: [{ text: ALEX_CONFIG.persona }] },
                                { role: "model", parts: [{ text: "Sure, got it. I'm ready." }] },
                                ...this.history,
                                { role: "user", parts: [{ text: text + " (Constraint: 1-2 sentences. Human style.)" }] }
                            ],
                            generationConfig: { temperature: 0.8, maxOutputTokens: 100 }
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const aiText = data.candidates[0].content.parts[0].text;
                        this.history.push({ role: "user", parts: [{ text: text }] });
                        this.history.push({ role: "model", parts: [{ text: aiText }] });
                        document.getElementById('alex-status').innerText = `Live (2.5 Flash)`;
                        if (isVoice) { this.speak(aiText); } else { this.addMessageToUI('bot', aiText); }
                        this.isLoading = false; 
                        return; // SUCCESS!
                    } else {
                        const err = await res.json();
                        lastError = err.error?.message || "Unknown error";
                    }
                } catch (e) {
                    lastError = e.message;
                }
            }

            // If we reach here, both versions failed
            this.addMessageToUI('bot', `⚠️ API Error: ${lastError}`, true);
            this.isLoading = false;
        }
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => { window.alex = new AlexAgent(); }); } 
    else { window.alex = new AlexAgent(); }
})();
