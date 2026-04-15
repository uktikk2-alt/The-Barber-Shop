/**
 * PREMIUM MULTI-STEP BOOKING MODAL LOGIC
 * Powered by James' Detailing Experience
 */

const BookingManager = {
    currentStep: 1,
    totalSteps: 5,
    bookingData: {
        service: null,
        vehicle: {
            make: '',
            model: ''
        },
        schedule: {
            date: null,
            time: '09:00',
            timezone: 'CST (Texas)'
        },
        contact: {
            name: '',
            phone: '',
            email: '',
            address: ''
        }
    },

    services: [
        { id: 'deep-clean', name: 'Deep Clean', price: 120 },
        { id: 'signature-deep-clean', name: 'Signature Deep Clean', price: 175 },
        { id: 'enhancement-polish', name: 'Enhancement Polish', price: 180 },
        { id: 'paint-correction', name: 'Paint Correction', price: 300 },
        { id: 'ceramic-coating', name: 'Ceramic Coating', price: 250 },
        { id: 'headlight-restoration', name: 'Headlight Restoration', price: 45 },
        { id: 'engine-detailing', name: 'Engine Bay Detailing', price: 50 },
        { id: 'odor-removal', name: 'Odor Removal', price: 40 }
    ],

    viewDate: new Date(),

    init() {
        if (document.getElementById('booking-modal')) return;
        this.createModalHTML();
        this.attachListeners();
        this.renderCalendar();
        this.updateUI();
    },

    createModalHTML() {
        const modalHTML = `
            <div class="booking-modal-overlay" id="booking-modal">
                <div class="booking-modal-container">
                    <button class="modal-close" id="close-booking">&times;</button>
                    
                    <div class="modal-header">
                        <h3 id="step-title" style="text-transform: uppercase; letter-spacing: 2px;">Select Service</h3>
                        <div class="progress-bar-wrap">
                            <div class="progress-bar-fill" id="progress-fill"></div>
                        </div>
                    </div>

                    <div class="modal-body">
                        <!-- Step 1: Services -->
                        <div class="step-content active" data-step="1">
                            <p style="color: rgba(255,255,255,0.5); font-size: 14px;">Please select one of our premium treatments.</p>
                            <div class="services-selection-grid">
                                ${this.services.map(s => `
                                    <div class="service-select-card" data-id="${s.id}" data-price="${s.price}">
                                        <h4>${s.name}</h4>
                                        <span>$${s.price}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Step 2: Vehicle -->
                        <div class="step-content" data-step="2">
                            <p style="color: rgba(255,255,255,0.5); font-size: 14px;">Tell us about your vehicle.</p>
                            <div class="form-step">
                                <div class="booking-input-group">
                                    <label>Vehicle Make</label>
                                    <input type="text" class="booking-input" id="car-make" placeholder="e.g. BMW, Mercedes, Tesla">
                                </div>
                                <div class="booking-input-group">
                                    <label>Vehicle Model</label>
                                    <input type="text" class="booking-input" id="car-model" placeholder="e.g. M3, C-Class, Model S">
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Schedule -->
                        <div class="step-content" data-step="3">
                            <div class="calendar-step-wrap">
                                <div class="calendar-header">
                                    <h4 id="cal-month-year">April 2026</h4>
                                    <div style="display: flex; gap: 10px;">
                                        <button class="cal-nav-btn" id="prev-month" style="background: none; border: none; color: #fff; cursor: pointer;"><i class="fa-solid fa-chevron-left"></i></button>
                                        <button class="cal-nav-btn" id="next-month" style="background: none; border: none; color: #fff; cursor: pointer;"><i class="fa-solid fa-chevron-right"></i></button>
                                    </div>
                                </div>
                                <div class="calendar-grid" id="calendar-days">
                                    <!-- Days injected by JS -->
                                </div>
                                
                                <div style="margin-top: 25px;">
                                    <label style="display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px;">SELECT PREFERRED TIME</label>
                                    <select class="booking-input" id="booking-time">
                                        <option value="09:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00" selected>11:00 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="13:00">01:00 PM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="16:00">04:00 PM</option>
                                    </select>
                                </div>

                                <div class="timezone-wrap">
                                    <i class="fa-solid fa-globe"></i>
                                    <span>Timezone:</span>
                                    <select>
                                        <option selected>CST (Texas)</option>
                                        <option>EST (New York)</option>
                                        <option>PST (Los Angeles)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Step 4: Contact -->
                        <div class="step-content" data-step="4">
                            <div class="form-step">
                                <div class="booking-input-group">
                                    <label>Full Name</label>
                                    <input type="text" class="booking-input" id="cust-name" placeholder="Enter your name">
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div class="booking-input-group">
                                        <label>Phone Number</label>
                                        <input type="tel" class="booking-input" id="cust-phone" placeholder="Your mobile">
                                    </div>
                                    <div class="booking-input-group">
                                        <label>Email Address</label>
                                        <input type="email" class="booking-input" id="cust-email" placeholder="Your email">
                                    </div>
                                </div>
                                <div class="booking-input-group">
                                    <label>ADDRESS / POSTCODE</label>
                                    <input type="text" class="booking-input" id="cust-address" placeholder="Where is the vehicle located?">
                                </div>
                            </div>
                        </div>

                        <!-- Step 5: Confirm -->
                        <div class="step-content" data-step="5">
                            <div class="summary-box" id="booking-summary">
                                <!-- Summary injected by JS -->
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="modal-btn btn-prev" id="btn-prev" style="display: none;">Back</button>
                        <button class="modal-btn btn-next" id="btn-next">Next</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    attachListeners() {
        // Universal Link Interception: Capture every "Book Now" style button
        // and prevent scrolling to #booking-section
        document.addEventListener('click', (e) => {
            // Find closest link or button
            const btn = e.target.closest('a, button, .btn, .sc-btn');
            if (!btn) return;

            // FIX: If the button is inside the modal itself, let it behave naturally
            if (btn.closest('.booking-modal-container')) return;

            const href = btn.getAttribute('href') || '';
            const text = btn.innerText.toUpperCase();
            const isBookingTarget = href.includes('#booking-section') || 
                                  text.includes('BOOK') || 
                                  text.includes('DETAIL');

            if (isBookingTarget) {
                // Critical: Stop the jump/scroll to the footer
                e.preventDefault();
                e.stopPropagation();

                // Special handling for the Price Estimator "Get Quote" button
                const isEstimatorBtn = btn.closest('.estimator-btns');
                if (isEstimatorBtn) {
                    const activeService = document.querySelector('#service-choices .choice-item.active');
                    const activeSize = document.querySelector('#size-choices .choice-item.active');
                    
                    if (activeService && activeSize) {
                        const serviceId = activeService.getAttribute('data-service');
                        const sizeLabel = activeSize.querySelector('.size-name').innerText;
                        this.startWithService(serviceId, sizeLabel);
                        return;
                    }
                }

                // Standard opening for all other booking buttons
                this.openModal();
            }
        }, true); // Use capture phase to ensure we intercept before other listeners

        // Close Modal
        document.getElementById('close-booking').onclick = () => this.closeModal();
        document.getElementById('booking-modal').onclick = (e) => {
            if (e.target.id === 'booking-modal') this.closeModal();
        };

        // Service Selection (Using delegation)
        const servicesGrid = document.querySelector('.services-selection-grid');
        if (servicesGrid) {
            servicesGrid.onclick = (e) => {
                const card = e.target.closest('.service-select-card');
                if (card) {
                    document.querySelectorAll('.service-select-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.bookingData.service = {
                        id: card.dataset.id,
                        name: card.querySelector('h4').innerText,
                        price: card.dataset.price
                    };
                    console.log("Selected service:", this.bookingData.service);
                    this.validate();
                }
            };
        }

        // Next / Prev Buttons
        const nextBtn = document.getElementById('btn-next');
        const prevBtn = document.getElementById('btn-prev');
        
        if (nextBtn) nextBtn.onclick = () => this.navigate(1);
        if (prevBtn) prevBtn.onclick = () => this.navigate(-1);

        // Input data binding
        const inputs = {
            'car-make': (val) => this.bookingData.vehicle.make = val,
            'car-model': (val) => this.bookingData.vehicle.model = val,
            'cust-name': (val) => this.bookingData.contact.name = val,
            'cust-phone': (val) => this.bookingData.contact.phone = val,
            'cust-email': (val) => this.bookingData.contact.email = val,
            'cust-address': (val) => this.bookingData.contact.address = val,
            'booking-time': (val) => this.bookingData.schedule.time = val
        };

        Object.keys(inputs).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
                el.addEventListener(eventType, (e) => {
                    inputs[id](e.target.value);
                    this.validate();
                });
            }
        });
    },

    openModal() {
        const modal = document.getElementById('booking-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Hide AI Chat Widget
        const alexWidget = document.getElementById('alex-widget');
        if (alexWidget) alexWidget.style.setProperty('display', 'none', 'important');
    },

    closeModal() {
        const modal = document.getElementById('booking-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Show AI Chat Widget back
        const alexWidget = document.getElementById('alex-widget');
        if (alexWidget) alexWidget.style.setProperty('display', 'flex', 'important');
    },

    startWithService(serviceId, sizeLabel) {
        // Find the service in our list
        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            console.error("BookingManager: Service ID not found", serviceId);
            this.openModal();
            return;
        }

        // 1. Open the modal
        this.openModal();

        // 2. Set the data
        this.bookingData.service = service;
        this.bookingData.vehicle.model = sizeLabel || '';

        // 3. Sync UI (Small delay to ensure HTML is rendered if first open)
        setTimeout(() => {
            // Select the card in Step 1
            const cards = document.querySelectorAll('.service-select-card');
            cards.forEach(c => {
                c.classList.remove('selected');
                if (c.dataset.id === serviceId) c.classList.add('selected');
            });

            // Fill Model input in Step 2
            const modelInput = document.getElementById('car-model');
            if (modelInput) modelInput.value = sizeLabel || '';

            // 4. Jump to Step 2
            this.currentStep = 2;
            this.updateUI();
        }, 50);
    },

    navigate(dir) {
        try {
            console.log(`BookingManager: Navigating ${dir === 1 ? 'Forward' : 'Backward'} from step ${this.currentStep}`);
            
            if (dir === 1 && !this.validate()) {
                console.warn("BookingManager: Validation failed for current step.");
                return;
            }

            if (this.currentStep === this.totalSteps && dir === 1) {
                this.finishBooking();
                return;
            }

            this.currentStep += dir;
            this.updateUI();
            
            // Scroll to top of modal body on step change
            document.querySelector('.booking-modal-container').scrollTop = 0;
            
        } catch (error) {
            console.error("BookingManager Error in navigate:", error);
        }
    },

    validate() {
        try {
            const nextBtn = document.getElementById('btn-next');
            if (!nextBtn) return false;

            let isValid = false;
            switch(parseInt(this.currentStep)) {
                case 1: isValid = !!this.bookingData.service; break;
                case 2: isValid = !!this.bookingData.vehicle.make && !!this.bookingData.vehicle.model; break;
                case 3: isValid = !!this.bookingData.schedule.date; break;
                case 4: isValid = !!this.bookingData.contact.name && !!this.bookingData.contact.phone; break;
                case 5: isValid = true; break;
                default: isValid = true;
            }

            nextBtn.disabled = !isValid;
            nextBtn.style.opacity = isValid ? '1' : '0.3';
            nextBtn.style.pointerEvents = isValid ? 'auto' : 'none';
            
            return isValid;
        } catch (error) {
            console.error("BookingManager Error in validate:", error);
            return false;
        }
    },

    updateUI() {
        // Toggle Steps
        document.querySelectorAll('.step-content').forEach(s => {
            s.classList.toggle('active', s.dataset.step == this.currentStep);
        });

        // Progress Bar
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;

        // Footer Buttons
        document.getElementById('btn-prev').style.display = this.currentStep === 1 ? 'none' : 'block';
        document.getElementById('btn-next').innerText = this.currentStep === this.totalSteps ? 'Confirm Booking' : 'Next Step';

        // Step Title
        const titles = ["", "Select Service", "Vehicle Details", "Preferred Time", "Contact Info", "Confirmation"];
        document.getElementById('step-title').innerText = titles[this.currentStep];

        // If summary step, render it
        if (this.currentStep === 5) this.renderSummary();
        
        this.validate();
    },

    renderCalendar() {
        const daysContainer = document.getElementById('calendar-days');
        if (!daysContainer) return;

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let daysHTML = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => `<div class="cal-day-name">${d}</div>`).join('');

        // Empty slots for prev month
        for (let i = 0; i < (firstDay === 0 ? 0 : firstDay); i++) {
            daysHTML += `<div class="cal-day disabled"></div>`;
        }

        // Current Month Days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === date.getDate();
            const isSelected = this.bookingData.schedule.date === `${day}/${month+1}`;
            daysHTML += `
                <div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-day="${day}">
                    ${day}
                </div>
            `;
        }

        daysContainer.innerHTML = daysHTML;

        // Day click listeners
        daysContainer.querySelectorAll('.cal-day:not(.disabled)').forEach(el => {
            el.onclick = () => {
                this.bookingData.schedule.date = `${el.dataset.day}/${month + 1}`;
                this.renderCalendar();
                this.validate();
            };
        });
    },

    renderSummary() {
        const box = document.getElementById('booking-summary');
        const d = this.bookingData;
        box.innerHTML = `
            <div class="summary-row">
                <span class="summary-label">SERVICE</span>
                <span class="summary-value highlight">${d.service.name}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">VEHICLE</span>
                <span class="summary-value">${d.vehicle.make} ${d.vehicle.model}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">DATE & TIME</span>
                <span class="summary-value">${d.schedule.date} @ ${d.schedule.time}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">LOCATION</span>
                <span class="summary-value">${d.contact.address}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">PRICE (ESTIMATE)</span>
                <span class="summary-value highlight" style="font-size: 20px;">$${d.service.price}</span>
            </div>
        `;
    },

    async finishBooking() {
        const modalContainer = document.querySelector('.booking-modal-container');
        
        // Show Loading State
        modalContainer.innerHTML = `
            <div style="padding: 60px 40px; text-align: center;">
                <div class="loader-spinner" style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <h3 style="color: #fff;">SECURING YOUR SLOT...</h3>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;

        try {
            // Prepare data for GHL
            const ghlData = {
                name: this.bookingData.contact.name,
                email: this.bookingData.contact.email,
                phone: this.bookingData.contact.phone,
                address: this.bookingData.contact.address,
                vehicle: `${this.bookingData.vehicle.make} ${this.bookingData.vehicle.model}`,
                service: this.bookingData.service.name,
                message: `Scheduled for: ${this.bookingData.schedule.date} @ ${this.bookingData.schedule.time}`
            };

            // Send to Bridge
            await fetch('/api/ghl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ghlData)
            });

            // Success UI
            modalContainer.innerHTML = `
                <div style="padding: 60px 40px; text-align: center; animation: confirmPop 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;">
                    <div style="width: 80px; height: 80px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; font-size: 30px; color: #000; box-shadow: 0 0 30px var(--accent);">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h2 style="text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; color: #ffffff !important;">Booking Confirmed!</h2>
                    <p style="color: rgba(255,255,255,0.8); margin-bottom: 30px; font-size: 16px;">Thank you ${this.bookingData.contact.name}. James will contact you shortly at ${this.bookingData.contact.phone} to finalize the details.</p>
                    <button class="modal-btn btn-next" onclick="location.reload()" style="max-width: 250px; margin: 0 auto;">Return Home</button>
                </div>
            `;
        } catch (error) {
            console.error("GHL Sync Error:", error);
            modalContainer.innerHTML = `
                <div style="padding: 60px 40px; text-align: center;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 50px; color: #ff4d4d; margin-bottom: 20px;"></i>
                    <h3 style="color: #fff;">Connection Error</h3>
                    <p style="color: rgba(255,255,255,0.6);">We couldn't reach the server, but don't worry—your booking is noted. Please call us directly.</p>
                    <button class="modal-btn btn-next" onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }
};

// Robust initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BookingManager.init());
} else {
    BookingManager.init();
}
