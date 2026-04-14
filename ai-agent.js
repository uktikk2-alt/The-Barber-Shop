/**
 * Alex AI Agent - UI Polish & Scroll Logic (v24)
 * Warner & Spencer Car Detailing
 */

(function() {
    const ALEX_CONFIG = {
        businessName: "Warner & Spencer Auto Detailing",
        location: "Bluff Dale, Texas",
        modelName: "gemini-2.5-flash", 
        persona: `You are a human named Alex. You work at Warner & Spencer Auto Detailing in Bluff Dale, Texas.
        
VOICE & TONE:
- Talk like a local Texas professional — friendly, relaxed, natural. Use "yeah", "sure", "got it", maybe a subtle "y'all" if it fits.
- Short sentences only. One or two max. No monologues.

KNOWLEDGE BASE:
${JSON.stringify(window.ALEX_KNOWLEDGE || {}, null, 2)}

LEAD CAPTURE:
- If a user provides their Name, Email, or Phone, YOU MUST SECURE it.
- James is the main contact; he reviews all bookings.
- After lead capture, append: [[LEAD_DATA: {"name": "...", "email": "...", "phone": "...", "service": "..."}]]
- Replace ... with info. If unknown, leave as "".

Business Info: Warner & Spencer, Bluff Dale, TX. Phone: +1 333 333 3333.`
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

        /**
         * INTERCEPT WebRTC at the source
         * Monkey-patches RTCPeerConnection so we capture GHL's call handle.
         * This is the ONLY reliable way to kill a WebRTC session we didn't create.
         */
        interceptRTC() {
            // Use arrays so ALL connections/streams are captured, not just the last one
            window._alex_pcs = [];
            window._alex_mic_streams = [];

            // 1. Intercept ALL RTCPeerConnections
            const OriginalPC = window.RTCPeerConnection;
            window.RTCPeerConnection = function(...args) {
                const pc = new OriginalPC(...args);
                console.log("GHL Sync: RTCPeerConnection intercepted! 🎯", pc);
                window._alex_pcs.push(pc);
                return pc;
            };
            window.RTCPeerConnection.prototype = OriginalPC.prototype;

            // 2. Intercept ALL getUserMedia calls
            const originalGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = async function(constraints) {
                const stream = await originalGUM(constraints);
                console.log("GHL Sync: getUserMedia intercepted! Mic stream captured 🎤", stream.getTracks());
                window._alex_mic_streams.push(stream);
                return stream;
            };

            console.log("GHL Sync: RTCPeerConnection interceptor armed.");
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
                        <h2>ALEX</h2>
                        <div class="ai-live-indicator">
                            <span class="dot"></span>
                            <span id="call-status">CONNECTING...</span>
                        </div>
                    </div>

                    <div class="ai-call-avatar-area">
                        <!-- Orbital Rings -->
                        <div class="ai-ring ring-1"></div>
                        <div class="ai-ring ring-2"></div>
                        <div class="ai-ring ring-3"></div>
                        
                        <div class="ai-call-pulse"></div>
                        <div class="ai-call-icon-main"><i class="fas fa-user-tie"></i></div>
                    </div>

                    <!-- Ambient Audio Wave -->
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

            // SCROLL HIDE/SHOW LOGIC
            window.addEventListener('scroll', () => {
                const widget = document.getElementById('alex-widget');
                widget.classList.add('scrolling');
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    widget.classList.remove('scrolling');
                }, 1000); // Appear 1s after scroll stops
            });

            // GHL Event Sync: Try to catch GHL voice state if possible
            window.addEventListener('message', (event) => {
                if (event.data?.type === 'GHL_VOICE_STATE') {
                    const state = event.data.state; // e.g., 'talking', 'listening'
                    this.updateVoiceUI(state);
                }
            });
        }

        updateVoiceUI(state) {
            const statusEl = document.getElementById('voice-status');
            const transcriptEl = document.getElementById('voice-transcript');
            if (state === 'talking') {
                statusEl.innerText = "Alex is speaking...";
            } else if (state === 'listening') {
                statusEl.innerText = "Listening to you...";
                transcriptEl.innerText = "...";
            }
        }

        toggleMute() {
            this.isMuted = !this.isMuted;
            const btn = document.getElementById('btn-mute');
            
            // Trigger GHL native mute
            if (window.ghlChatWidget && typeof window.ghlChatWidget.muteCall === 'function') {
                window.ghlChatWidget.muteCall(this.isMuted);
            }

            if (this.isMuted) {
                btn.classList.add('muted');
                btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            } else {
                btn.classList.remove('muted');
                btn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }

        initSpeech() {
            // Managed by GHL Engine
        }

        startVoice() {
            // 1. Show custom UI
            document.getElementById('alex-widget').classList.remove('open');
            document.getElementById('voice-overlay').classList.add('active');
            document.body.classList.add('ai-no-scroll');
            document.getElementById('call-status').innerText = "Connecting...";
            this.voiceMode = true;

            // 2. GHL TRIGGER (The Claude Fix)
            const ghl = document.querySelector('chat-widget');
            if (ghl) {
                // Force GHL alive but off-screen immediately
                ghl.style.cssText = 'position: fixed !important; bottom: -9999px !important; right: -9999px !important; display: block !important; visibility: visible !important; z-index: -1 !important;';
                
                // Open GHL and click call button
                if (window.leadConnector && window.leadConnector.chatWidget) {
                    window.leadConnector.chatWidget.openWidget();
                    
                    setTimeout(() => {
                        const shadow = document.querySelector('chat-widget').shadowRoot;
                        const callBtn = shadow?.querySelector('.lc_text-widget--voice-talk-button');
                        if (callBtn) {
                            callBtn.click();
                            document.getElementById('call-status').innerText = "LIVE";
                            this.startTranscriptSync(); // Start pulling text from GHL
                        } else {
                            console.error("GHL Sync: Call button not found in Shadow DOM.");
                        }
                    }, 2000);
                } else {
                    console.error("GHL Sync: window.leadConnector API not found.");
                }
            }
        }

        startTranscriptSync() {
            if (this.transcriptInterval) clearInterval(this.transcriptInterval);
            
            const sync = () => {
                if (!this.voiceMode) return;
                const shadow = document.querySelector('chat-widget')?.shadowRoot;
                if (shadow) {
                    // Hunt for transcription text inside GHL Shadow DOM
                    const transcript = shadow.querySelector('.lc_text-widget--voice-transcript-text') || 
                                       shadow.querySelector('[class*="transcript"]') ||
                                       shadow.querySelector('.message-text');
                    
                    if (transcript && transcript.innerText.trim()) {
                        document.getElementById('voice-transcript').innerText = transcript.innerText.trim();
                    }
                }
            };
            this.transcriptInterval = setInterval(sync, 500);
        }

        stopVoice() {
            console.log("GHL Sync: Initiating Hangup Procedure...");

            // 1. Clear transcript sync
            if (this.transcriptInterval) clearInterval(this.transcriptInterval);

            // 2. NUCLEAR HANGUP: Close ALL RTCPeerConnections
            (window._alex_pcs || []).forEach(pc => {
                try {
                    pc.getSenders().forEach(s => s.track && s.track.stop());
                    pc.getReceivers().forEach(r => r.track && r.track.stop());
                    pc.close();
                    console.log("GHL Sync: ✅ RTCPeerConnection closed.");
                } catch(e) { console.error("RTC close error:", e); }
            });
            window._alex_pcs = [];

            // 3. Stop ALL getUserMedia streams (releases the browser mic icon)
            (window._alex_mic_streams || []).forEach(stream => {
                stream.getTracks().forEach(track => {
                    track.stop();
                    console.log("GHL Sync: ✅ Track stopped:", track.label);
                });
            });
            window._alex_mic_streams = [];
            console.log("GHL Sync: ✅ All microphone streams released.");


            // 3. Also close GHL widget UI
            if (window.leadConnector && window.leadConnector.chatWidget) {
                window.leadConnector.chatWidget.closeWidget();
            }

            // 4. Close our UI
            document.getElementById('voice-overlay').classList.remove('active');
            document.body.classList.remove('ai-no-scroll');
            this.voiceMode = false;
        }

        /**
         * SAFE VISIBILITY GUARD
         * Throttled check to keep GHL off-screen.
         */
        startVisibilityStalker() {
            const hideGHL = () => {
                const selectors = ['chat-widget', 'lc-chat-widget', 'ghl-chat-widget', '#chat-widget-container'];
                selectors.forEach(s => {
                    const el = document.querySelector(s);
                    // Keep it alive and clickable, but far off-screen and transparent
                    if (el && el.style.bottom !== '-9999px') {
                        el.style.cssText = 'position: fixed !important; bottom: -9999px !important; right: -9999px !important; opacity: 0 !important; display: block !important;';
                    }
                });
            };
            hideGHL();
            setInterval(hideGHL, 2000); // Check every 2 seconds instead of every millisecond
        }

        speak(text) {
            // Redundant: GHL handles audio natively
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
                            { role: "user", parts: [{ text: text }] }
                        ],
                        generationConfig: { temperature: 0.8, maxOutputTokens: 1000 }
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    let aiText = data.candidates[0].content.parts[0].text;
                    
                    // GHL SYNC LOGIC: Check for lead markers in the AI response
                    if (aiText.includes('[[LEAD_DATA:')) {
                        const marker = aiText.match(/\[\[LEAD_DATA: (.*?)\]\]/);
                        if (marker && marker[1]) {
                            try {
                                const leadData = JSON.parse(marker[1]);
                                // Silently sync to GHL
                                fetch('/api/ghl', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        name: leadData.name || 'AI Chat Lead',
                                        email: leadData.email || '',
                                        phone: leadData.phone || '',
                                        service: leadData.service || 'AI Consultation',
                                        message: `Captured via Alex AI Chat: "${text}"`
                                    })
                                }).then(r => r.json()).then(d => console.log("AI Lead Synced to GHL:", d));
                            } catch(e) { console.error("Failed to parse lead data:", e); }
                        }
                        // Clean the UI: Hide the technical marker from the user
                        aiText = aiText.replace(/\[\[LEAD_DATA: .*?\]\]/g, '').trim();
                    }

                    this.history.push({ role: "user", parts: [{ text: text }] });
                    this.history.push({ role: "model", parts: [{ text: aiText }] });
                    document.getElementById('alex-status').innerText = `Live (AI Agent)`;
                    // ALWAYS show text response for the Chat window
                    this.addMessageToUI('bot', aiText);
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
