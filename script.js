document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
});

const QUOTE_REFERENCE_STORAGE_KEY = 'yhTravelsLastQuoteId';

let dateTimeCounter = 1;
let dropoffCounters = { 0: 1 };

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
        if (event.target.classList.contains('add-dropoff-btn')) {
            addDropoffLocation(event.target.dataset.dayIndex);
        }

        if (event.target.classList.contains('remove-dropoff-btn')) {
            removeDropoffLocation(event.target.dataset.dayIndex, event.target.dataset.dropoffIndex);
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

    dropoffCounters[index] = 1;

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

            <div class="form-row">
                <div class="form-group">
                    <label for="start_time_${index}">Start Time *</label>
                    <input type="time" id="start_time_${index}" name="start_time_${index}" required>
                </div>
                <div class="form-group">
                    <label for="end_time_${index}">End Time *</label>
                    <input type="time" id="end_time_${index}" name="end_time_${index}" required>
                    <div class="checkbox-inline">
                        <input type="checkbox" id="next_day_${index}" name="next_day_${index}">
                        <label for="next_day_${index}" class="checkbox-label">Ends next day</label>
                    </div>
                    <small>Use this when service continues past midnight.</small>
                </div>
            </div>

            <div class="locations-subsection">
                <h4>Locations</h4>

                <div class="form-group">
                    <label for="pickup_${index}">Pick-up Location *</label>
                    <input type="text" id="pickup_${index}" name="pickup_${index}" class="location-input" placeholder="Enter the address, venue, city, or airport" required>
                    <small>Type the location as clearly as possible.</small>
                </div>

                <div class="dropoff-container" data-day-index="${index}">
                    <div class="dropoff-group" data-dropoff-index="0">
                        <div class="form-group">
                            <label for="dropoff_${index}_0">Drop-off Location *</label>
                            <input type="text" id="dropoff_${index}_0" name="dropoff_${index}_0" class="location-input" placeholder="Enter the destination, venue, or stop" required>
                            <small>Add the final destination or the first scheduled stop.</small>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn-secondary add-dropoff-btn" data-day-index="${index}">+ Add Another Drop-off</button>
                <small class="location-note">Add stops in travel order so the itinerary is easy to review.</small>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', groupHtml);
    renumberTripDayTitles();
}

function removeDateTimeGroup(index) {
    const group = document.querySelector(`.date-time-group[data-index="${index}"]`);

    if (!group) {
        return;
    }

    group.remove();
    delete dropoffCounters[index];
    renumberTripDayTitles();
}

function addDropoffLocation(dayIndex) {
    const container = document.querySelector(`.dropoff-container[data-day-index="${dayIndex}"]`);

    if (!container) {
        return;
    }

    const dropoffIndex = dropoffCounters[dayIndex]++;
    const dropoffHtml = `
        <div class="dropoff-group" data-dropoff-index="${dropoffIndex}">
            <div class="form-group">
                <label for="dropoff_${dayIndex}_${dropoffIndex}">
                    Drop-off Location *
                    <button type="button" class="remove-dropoff-btn" data-day-index="${dayIndex}" data-dropoff-index="${dropoffIndex}">Remove</button>
                </label>
                <input type="text" id="dropoff_${dayIndex}_${dropoffIndex}" name="dropoff_${dayIndex}_${dropoffIndex}" class="location-input" placeholder="Enter the destination, venue, or stop" required>
                <small>Add any extra stop, transfer point, or destination in order.</small>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', dropoffHtml);
}

function removeDropoffLocation(dayIndex, dropoffIndex) {
    const container = document.querySelector(`.dropoff-container[data-day-index="${dayIndex}"]`);

    if (!container) {
        return;
    }

    const group = container.querySelector(`.dropoff-group[data-dropoff-index="${dropoffIndex}"]`);
    if (group) {
        group.remove();
    }
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
        const startTimeInput = group.querySelector(`#start_time_${index}`);
        const endTimeInput = group.querySelector(`#end_time_${index}`);
        const pickupInput = group.querySelector(`#pickup_${index}`);
        const nextDayInput = group.querySelector(`#next_day_${index}`);

        if (!dateInput || !startTimeInput || !endTimeInput || !pickupInput) {
            return;
        }

        const tripDay = {
            date: dateInput.value,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            endsNextDay: Boolean(nextDayInput?.checked),
            pickup: pickupInput.value.trim(),
            dropoffs: []
        };

        const dropoffContainer = group.querySelector(`.dropoff-container[data-day-index="${index}"]`);
        if (dropoffContainer) {
            const dropoffGroups = dropoffContainer.querySelectorAll('.dropoff-group');
            dropoffGroups.forEach((dropoffGroup) => {
                const dropoffIndex = dropoffGroup.dataset.dropoffIndex;
                const dropoffInput = dropoffGroup.querySelector(`#dropoff_${index}_${dropoffIndex}`);

                if (dropoffInput && dropoffInput.value.trim()) {
                    tripDay.dropoffs.push(dropoffInput.value.trim());
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
        if (!day.date || !day.startTime || !day.endTime) {
            return false;
        }

        if (!day.pickup) {
            return false;
        }

        if (!day.dropoffs.length || day.dropoffs.some((dropoff) => !dropoff)) {
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
        const dropoffsText = day.dropoffs.map((dropoff, dropoffIndex) => `  Drop-off ${dropoffIndex + 1}: ${dropoff}`).join('\n');
        const overnightIndicator = day.endsNextDay ? ' (overnight)' : '';

        return `Day ${index + 1}: ${day.date} from ${day.startTime} to ${day.endTime}${overnightIndicator}\n  Pick-up: ${day.pickup}\n${dropoffsText}`;
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