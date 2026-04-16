/**
 * Alex AI Agent - Templatized Version (v25)
 * Driven by window.SITE_CONFIG
 */

(function() {
    // Utility to get config with fallbacks
    const getConfig = () => window.SITE_CONFIG || {
        branding: { businessName: "Auto Detailing", tagline: "Premium Car Care" },
        contact: { location: "Local Area", phone: "+1 000 000 0000" }
    };

    const SITE = getConfig();

    const ALEX_CONFIG = {
        businessName: SITE.branding.businessName,
        location: SITE.contact.location,
        modelName: "gemini-1.5-flash", 
        persona: `You are a human named Alex. You work at ${SITE.branding.businessName} in ${SITE.contact.location}.
        
VOICE & TONE:
- Talk like a local professional — friendly, relaxed, natural.
- Short sentences only. One or two max. No monologues.

KNOWLEDGE BASE:
${JSON.stringify(window.ALEX_KNOWLEDGE || {}, null, 2)}

LEAD CAPTURE:
- If a user provides their Name, Email, or Phone, YOU MUST SECURE it.
- ${SITE.branding.businessName} lead system reviews all bookings.
- After lead capture, append: [[LEAD_DATA: {"name": "...", "email": "...", "phone": "...", "service": "..."}]]
- Replace ... with info. If unknown, leave as "".

Business Info: ${SITE.branding.businessName}, ${SITE.contact.location}. Phone: ${SITE.contact.phone}.`
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

            this.interceptRTC(); // Must be FIRST — before GHL loads
            this.renderUI();
            this.setupEventListeners();
            this.initSpeech();
            this.checkEnvironment();
            this.startVisibilityStalker();
        }

        interceptRTC() {
            window._alex_pcs = [];
            window._alex_mic_streams = [];
            const OriginalPC = window.RTCPeerConnection;
            window.RTCPeerConnection = function(...args) {
                const pc = new OriginalPC(...args);
                window._alex_pcs.push(pc);
                return pc;
            };
            window.RTCPeerConnection.prototype = OriginalPC.prototype;

            const originalGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = async function(constraints) {
                const stream = await originalGUM(constraints);
                window._alex_mic_streams.push(stream);
                return stream;
            };
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
                <div class="ai-fab" id="fab-main"><i class="fas fa-comment-dots"></i></div>
                
                <div class="ai-chat-window" id="alex-chat">
                    <div class="ai-chat-header">
                        <div class="ai-user-profile"><div class="ai-avatar">A</div><div class="ai-user-info"><h4>Alex</h4><span id="alex-status">Ready</span></div></div>
                        <i class="fas fa-times ai-chat-close" id="close-chat"></i>
                    </div>
                    <div class="ai-messages" id="chat-messages">
                        <div class="ai-msg bot">Hi there! Welcome to ${SITE.branding.businessName}. How can I help you today?</div>
                    </div>
                    <div class="ai-input-area">
                        <input type="text" class="ai-input" id="chat-input" placeholder="Type here...">
                        <button class="ai-send-btn" id="send-chat"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>

                <div class="ai-voice-overlay" id="voice-overlay">
                    <div class="ai-call-header">
                        <h2>ALEX</h2>
                        <div class="ai-live-indicator">
                            <span class="dot"></span>
                            <span id="call-status">CONNECTING...</span>
                        </div>
                    </div>

                    <div class="ai-call-avatar-area">
                        <div class="ai-ring ring-1"></div>
                        <div class="ai-ring ring-2"></div>
                        <div class="ai-ring ring-3"></div>
                        <div class="ai-call-pulse"></div>
                        <div class="ai-call-icon-main"><i class="fas fa-user-tie"></i></div>
                    </div>

                    <div class="ai-wave-container">
                        <div class="ai-wave-bar"></div>
                        <div class="ai-wave-bar"></div>
                        <div class="ai-wave-bar"></div>
                        <div class="ai-wave-bar"></div>
                        <div class="ai-wave-bar"></div>
                        <div class="ai-wave-bar"></div>
                        <div class="ai-wave-bar"></div>
                        <div class="ai-wave-bar"></div>
                    </div>

                    <div class="ai-call-transcription" id="call-transcription">
                        <div class="ai-voice-transcript" id="voice-transcript"></div>
                        <div class="ai-voice-status" id="voice-status"></div>
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

            window.addEventListener('scroll', () => {
                const widget = document.getElementById('alex-widget');
                widget.classList.add('scrolling');
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    widget.classList.remove('scrolling');
                }, 1000);
            });
        }

        toggleMute() {
            this.isMuted = !this.isMuted;
            const btn = document.getElementById('btn-mute');
            if (this.isMuted) {
                btn.classList.add('muted');
                btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            } else {
                btn.classList.remove('muted');
                btn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }

        initSpeech() {}

        startVoice() {
            document.getElementById('alex-widget').classList.remove('open');
            document.getElementById('voice-overlay').classList.add('active');
            document.body.classList.add('ai-no-scroll');
            document.getElementById('call-status').innerText = "Connecting...";
            this.voiceMode = true;

            const ghl = document.querySelector('chat-widget');
            if (ghl) {
                ghl.style.cssText = 'position: fixed !important; bottom: -9999px !important; right: -9999px !important; display: block !important; visibility: visible !important; z-index: -1 !important;';
                if (window.leadConnector && window.leadConnector.chatWidget) {
                    window.leadConnector.chatWidget.openWidget();
                    setTimeout(() => {
                        const shadow = document.querySelector('chat-widget').shadowRoot;
                        const callBtn = shadow?.querySelector('.lc_text-widget--voice-talk-button');
                        if (callBtn) {
                            callBtn.click();
                            document.getElementById('call-status').innerText = "LIVE";
                            this.startTranscriptSync();
                        }
                    }, 2000);
                }
            }
        }

        startTranscriptSync() {
            if (this.transcriptInterval) clearInterval(this.transcriptInterval);
            const sync = () => {
                const shadow = document.querySelector('chat-widget')?.shadowRoot;
                if (shadow) {
                    const transcript = shadow.querySelector('.lc_text-widget--voice-transcript-text') || 
                                       shadow.querySelector('[class*="transcript"]');
                    if (transcript) document.getElementById('voice-transcript').innerText = transcript.innerText.trim();
                }
            };
            this.transcriptInterval = setInterval(sync, 500);
        }

        stopVoice() {
            if (this.transcriptInterval) clearInterval(this.transcriptInterval);
            (window._alex_pcs || []).forEach(pc => pc.close());
            (window._alex_mic_streams || []).forEach(s => s.getTracks().forEach(t => t.stop()));
            if (window.leadConnector && window.leadConnector.chatWidget) window.leadConnector.chatWidget.closeWidget();
            document.getElementById('voice-overlay').classList.remove('active');
            document.body.classList.remove('ai-no-scroll');
            this.voiceMode = false;
        }

        startVisibilityStalker() {
            const hideGHL = () => {
                const el = document.querySelector('chat-widget');
                if (el && el.style.bottom !== '-9999px') {
                    el.style.cssText = 'position: fixed !important; bottom: -9999px !important; right: -9999px !important; opacity: 0 !important; display: block !important;';
                }
            };
            setInterval(hideGHL, 2000);
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

        async tryGenerateResponse(text) {
            this.isLoading = true;
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
                            { role: "user", parts: [{ text: text }] }
                        ]
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    let aiText = data.candidates[0].content.parts[0].text;
                    if (aiText.includes('[[LEAD_DATA:')) {
                        aiText = aiText.replace(/\[\[LEAD_DATA: .*?\]\]/g, '').trim();
                    }
                    this.history.push({ role: "user", parts: [{ text: text }] });
                    this.history.push({ role: "model", parts: [{ text: aiText }] });
                    this.addMessageToUI('bot', aiText);
                    this.isLoading = false; 
                    return;
                }
            } catch (e) { console.error(e); }
            this.addMessageToUI('bot', "Sorry, I'm having trouble connecting to my brain right now.", true);
            this.isLoading = false;
        }
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => { window.alex = new AlexAgent(); }); } 
    else { window.alex = new AlexAgent(); }
})();
