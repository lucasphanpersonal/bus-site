document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
});

const QUOTE_REFERENCE_STORAGE_KEY = 'yhTravelsLastQuoteId';

let dateTimeCounter = 1;
let stopCounters = { 0: 2 };

function initializeForm() {
    const today = new Date().toISOString().split('T')[0];
    const firstDateInput = document.getElementById('date_0');

    if (firstDateInput) {
        firstDateInput.setAttribute('min', today);
    }
}

function setupEventListeners() {
    const addDateButton = document.getElementById('addDateBtn');
    const bookingForm = document.getElementById('bookingForm');

    if (addDateButton) {
        addDateButton.addEventListener('click', addDateTimeGroup);
    }

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-stop-btn')) {
            addStop(event.target.dataset.dayIndex);
        }

        if (event.target.classList.contains('remove-stop-btn')) {
            removeStop(event.target.dataset.dayIndex, event.target.dataset.stopIndex);
        }

        if (event.target.classList.contains('remove-date-btn')) {
            removeDateTimeGroup(event.target.dataset.index);
        }
    });

    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
    }
}

function addDateTimeGroup() {
    const container = document.getElementById('dateTimeContainer');
    const index = dateTimeCounter++;
    const today = new Date().toISOString().split('T')[0];

    stopCounters[index] = 2;

    const groupHtml = `
        <div class="date-time-group" data-index="${index}">
            <h3>
                <span class="trip-day-title">Trip Day</span>
                <button type="button" class="remove-date-btn" data-index="${index}">Remove</button>
            </h3>

            <div class="form-row">
                <div class="form-group">
                    <label for="date_${index}">Date *</label>
                    <input type="date" id="date_${index}" name="date_${index}" min="${today}" required>
                </div>
            </div>

            <div class="locations-subsection">
                <h4>Stops &amp; Departure Times</h4>

                <div class="stop-container" data-day-index="${index}">
                    <div class="itinerary-stop" data-stop-index="0">
                        <div class="stop-header">
                            <span class="stop-title">Stop #1</span>
                        </div>
                        <div class="form-row stop-fields">
                            <div class="form-group">
                                <label for="stop_location_${index}_0">Location *</label>
                                <input type="text" id="stop_location_${index}_0" name="stop_location_${index}_0" class="location-input" placeholder="Enter the address, venue, city, or airport" required>
                                <small>Use the actual property, venue, hotel, airport, school, or neighborhood name.</small>
                            </div>
                            <div class="form-group">
                                <label for="stop_departure_${index}_0">Departure Time</label>
                                <input type="time" id="stop_departure_${index}_0" name="stop_departure_${index}_0">
                                <small>Optional. Add only if the bus is expected to leave this stop at a known time.</small>
                            </div>
                        </div>
                    </div>

                    <div class="itinerary-stop" data-stop-index="1">
                        <div class="stop-header">
                            <span class="stop-title">Stop #2</span>
                        </div>
                        <div class="form-row stop-fields">
                            <div class="form-group">
                                <label for="stop_location_${index}_1">Location *</label>
                                <input type="text" id="stop_location_${index}_1" name="stop_location_${index}_1" class="location-input" placeholder="Enter the destination, venue, or next stop" required>
                                <small>Continue listing the route exactly in service order.</small>
                            </div>
                            <div class="form-group">
                                <label for="stop_departure_${index}_1">Departure Time</label>
                                <input type="time" id="stop_departure_${index}_1" name="stop_departure_${index}_1">
                                <small>Optional. Leave blank if departure timing depends on traffic or event flow.</small>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn-secondary add-stop-btn" data-day-index="${index}">+ Add Another Stop</button>
                <small class="location-note">The Google Sheet will receive this exactly as an ordered stop list with optional departure times.</small>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', groupHtml);
    renumberTripDayTitles();
    renumberStops(index);
}

function removeDateTimeGroup(index) {
    const group = document.querySelector(`.date-time-group[data-index="${index}"]`);

    if (!group) {
        return;
    }

    group.remove();
    delete stopCounters[index];
    renumberTripDayTitles();
}

function addStop(dayIndex) {
    const container = document.querySelector(`.stop-container[data-day-index="${dayIndex}"]`);

    if (!container) {
        return;
    }

    const stopIndex = stopCounters[dayIndex]++;
    const stopHtml = `
        <div class="itinerary-stop" data-stop-index="${stopIndex}">
            <div class="stop-header">
                <span class="stop-title">Stop</span>
                <button type="button" class="remove-stop-btn" data-day-index="${dayIndex}" data-stop-index="${stopIndex}">Remove</button>
            </div>
            <div class="form-row stop-fields">
                <div class="form-group">
                    <label for="stop_location_${dayIndex}_${stopIndex}">Location *</label>
                    <input type="text" id="stop_location_${dayIndex}_${stopIndex}" name="stop_location_${dayIndex}_${stopIndex}" class="location-input" placeholder="Enter the destination, venue, or next stop" required>
                    <small>Add any extra stop, transfer point, or destination in order.</small>
                </div>
                <div class="form-group">
                    <label for="stop_departure_${dayIndex}_${stopIndex}">Departure Time</label>
                    <input type="time" id="stop_departure_${dayIndex}_${stopIndex}" name="stop_departure_${dayIndex}_${stopIndex}">
                    <small>Optional. Leave blank if you do not need to pin a departure time at this stop.</small>
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', stopHtml);
    renumberStops(dayIndex);
}

function removeStop(dayIndex, stopIndex) {
    const container = document.querySelector(`.stop-container[data-day-index="${dayIndex}"]`);

    if (!container) {
        return;
    }

    const stops = container.querySelectorAll('.itinerary-stop');
    if (stops.length <= 2) {
        showStatusMessage('error', 'Each trip day needs at least two stops so the route order is clear.');
        return;
    }

    const stop = container.querySelector(`.itinerary-stop[data-stop-index="${stopIndex}"]`);
    if (!stop) {
        return;
    }

    stop.remove();
    renumberStops(dayIndex);
}

function renumberTripDayTitles() {
    const dayGroups = document.querySelectorAll('.date-time-group');

    dayGroups.forEach((group, index) => {
        const title = group.querySelector('.trip-day-title');
        if (title) {
            title.textContent = `Trip Day #${index + 1}`;
        }
    });
}

function renumberStops(dayIndex) {
    const stopContainer = document.querySelector(`.stop-container[data-day-index="${dayIndex}"]`);
    if (!stopContainer) {
        return;
    }

    const stops = stopContainer.querySelectorAll('.itinerary-stop');
    stops.forEach((stop, index) => {
        const title = stop.querySelector('.stop-title');
        if (title) {
            title.textContent = `Stop #${index + 1}`;
        }
    });
}

function formatTimeForDisplay(timeValue) {
    if (!timeValue) {
        return '';
    }

    const [hourText, minuteText] = timeValue.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
        return timeValue;
    }

    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 || 12;
    return `${normalizedHour}:${String(minute).padStart(2, '0')} ${meridiem}`;
}

function generateQuoteId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let randomCode = '';
    for (let index = 0; index < 5; index += 1) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `QUOTE-${year}${month}${day}-${randomCode}`;
}

function collectFormData() {
    const formData = {
        quoteId: generateQuoteId(),
        tripDays: [],
        passengers: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        description: '',
        notes: ''
    };

    const dateGroups = document.querySelectorAll('.date-time-group');
    dateGroups.forEach((group) => {
        const index = group.dataset.index;
        const dateInput = group.querySelector(`#date_${index}`);

        if (!dateInput) {
            return;
        }

        const tripDay = {
            date: dateInput.value,
            stops: []
        };

        const stopContainer = group.querySelector(`.stop-container[data-day-index="${index}"]`);
        if (stopContainer) {
            const stops = stopContainer.querySelectorAll('.itinerary-stop');
            stops.forEach((stop) => {
                const stopIndex = stop.dataset.stopIndex;
                const locationInput = stop.querySelector(`#stop_location_${index}_${stopIndex}`);
                const departureInput = stop.querySelector(`#stop_departure_${index}_${stopIndex}`);

                if (locationInput && locationInput.value.trim()) {
                    tripDay.stops.push({
                        location: locationInput.value.trim(),
                        departureTime: departureInput ? departureInput.value : ''
                    });
                }
            });
        }

        formData.tripDays.push(tripDay);
    });

    formData.passengers = document.getElementById('passengers').value.trim();
    formData.name = document.getElementById('name').value.trim();
    formData.email = document.getElementById('email').value.trim();
    formData.phone = document.getElementById('phone').value.trim();
    formData.company = document.getElementById('company').value.trim();
    formData.description = document.getElementById('description').value.trim();
    formData.notes = document.getElementById('notes').value.trim();

    return formData;
}

function validateFormData(formData) {
    if (!formData.tripDays.length) {
        return false;
    }

    for (const day of formData.tripDays) {
        if (!day.date) {
            return false;
        }

        if (!day.stops.length || day.stops.length < 2 || day.stops.some((stop) => !stop.location)) {
            return false;
        }
    }

    if (!formData.passengers || Number(formData.passengers) < 1) {
        return false;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.description) {
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(formData.email);
}

function formatTripDaysForSubmission(tripDays) {
    return tripDays.map((day, index) => {
        const stopText = day.stops.map((stop, stopIndex) => {
            const departureText = stop.departureTime ? ` (depart ${formatTimeForDisplay(stop.departureTime)})` : '';
            return `  Stop ${stopIndex + 1}: ${stop.location}${departureText}`;
        }).join('\n');

        return `Day ${index + 1}: ${day.date}\n${stopText}`;
    }).join('\n\n');
}

async function submitToGoogleForms(formData) {
    if (!CONFIG.googleForm?.actionUrl || CONFIG.googleForm.actionUrl.includes('YOUR_GOOGLE_FORM_ACTION_URL')) {
        throw new Error('Google Form integration is not configured. Update config.js with your Google Form action URL and entry IDs.');
    }

    const googleFormData = new URLSearchParams();
    const fields = CONFIG.googleForm.fields || {};
    const tripDaysFormatted = formatTripDaysForSubmission(formData.tripDays);

    if (fields.quoteId) {
        googleFormData.append(fields.quoteId, formData.quoteId);
    }
    if (fields.tripDays) {
        googleFormData.append(fields.tripDays, tripDaysFormatted);
    }
    if (fields.passengers) {
        googleFormData.append(fields.passengers, formData.passengers);
    }
    if (fields.name) {
        googleFormData.append(fields.name, formData.name);
    }
    if (fields.email) {
        googleFormData.append(fields.email, formData.email);
    }
    if (fields.phone) {
        googleFormData.append(fields.phone, formData.phone);
    }
    if (fields.company) {
        googleFormData.append(fields.company, formData.company || '');
    }
    if (fields.description) {
        googleFormData.append(fields.description, formData.description);
    }
    if (fields.notes) {
        googleFormData.append(fields.notes, formData.notes || '');
    }

    try {
        await fetch(CONFIG.googleForm.actionUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: googleFormData
        });
    } catch (error) {
        console.error('Google Forms submission error:', error);
        throw new Error('Unable to submit the request right now. Please try again or contact us directly by email.');
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const submitButton = document.getElementById('submitBtn');
    const buttonText = submitButton.querySelector('.btn-text');
    const buttonLoader = submitButton.querySelector('.btn-loader');
    const statusMessage = document.getElementById('statusMessage');

    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'flex';
    statusMessage.style.display = 'none';

    try {
        const formData = collectFormData();

        if (!validateFormData(formData)) {
            throw new Error('Please complete all required fields before submitting the request.');
        }

        await submitToGoogleForms(formData);
        sessionStorage.setItem(QUOTE_REFERENCE_STORAGE_KEY, formData.quoteId);
        window.location.href = 'success.html';
    } catch (error) {
        console.error('Form submission error:', error);
        showStatusMessage('error', error.message || 'Unable to submit the request.');
    } finally {
        submitButton.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoader.style.display = 'none';
    }
}

function showStatusMessage(type, message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.className = `status-message ${type}`;
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
    statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}