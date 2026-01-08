// Bus Booking Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form
    initializeForm();
    initializeGoogleMaps();
    setupEventListeners();
});

// Counter for date/time groups
let dateTimeCounter = 1;

/**
 * Initialize form functionality
 */
function initializeForm() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date_0').setAttribute('min', today);
}

/**
 * Initialize Google Maps Places Autocomplete
 */
function initializeGoogleMaps() {
    // Check if API key is configured
    if (!CONFIG.googleMaps.apiKey || CONFIG.googleMaps.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.warn('Google Maps API key not configured. Location autocomplete will not work.');
        return;
    }

    // Load Google Maps API dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.googleMaps.apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initAutocomplete;
    script.onerror = function() {
        console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);
}

/**
 * Initialize Places Autocomplete on location input
 */
function initAutocomplete() {
    const locationInput = document.getElementById('location');
    
    if (!locationInput) return;

    try {
        const autocomplete = new google.maps.places.Autocomplete(locationInput, {
            types: ['geocode', 'establishment'],
            fields: ['formatted_address', 'geometry', 'name']
        });

        // Store selected place data
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                locationInput.dataset.placeData = JSON.stringify({
                    address: place.formatted_address,
                    lat: place.geometry?.location?.lat(),
                    lng: place.geometry?.location?.lng()
                });
            }
        });
    } catch (error) {
        console.error('Error initializing Google Maps autocomplete:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add date button
    const addDateBtn = document.getElementById('addDateBtn');
    if (addDateBtn) {
        addDateBtn.addEventListener('click', addDateTimeGroup);
    }

    // Form submission
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Add a new date/time group
 */
function addDateTimeGroup() {
    const container = document.getElementById('dateTimeContainer');
    const index = dateTimeCounter++;
    const today = new Date().toISOString().split('T')[0];

    const groupHTML = `
        <div class="date-time-group" data-index="${index}">
            <h3>
                Date & Time #${index + 1}
                <button type="button" class="remove-date-btn" onclick="removeDateTimeGroup(${index})">
                    Remove
                </button>
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
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', groupHTML);
}

/**
 * Remove a date/time group
 */
function removeDateTimeGroup(index) {
    const group = document.querySelector(`.date-time-group[data-index="${index}"]`);
    if (group) {
        group.remove();
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'flex';
    statusMessage.style.display = 'none';

    try {
        // Collect form data
        const formData = collectFormData();

        // Validate form data
        if (!validateFormData(formData)) {
            throw new Error('Please fill out all required fields correctly.');
        }

        // Submit to Google Forms
        await submitToGoogleForms(formData);

        // Show success message
        showStatusMessage('success', '✓ Quote request submitted successfully! We\'ll get back to you soon.');

        // Reset form after short delay
        setTimeout(() => {
            document.getElementById('bookingForm').reset();
            // Remove extra date/time groups
            const groups = document.querySelectorAll('.date-time-group');
            groups.forEach((group, idx) => {
                if (idx > 0) group.remove();
            });
            dateTimeCounter = 1;
        }, 2000);

    } catch (error) {
        console.error('Form submission error:', error);
        showStatusMessage('error', '✗ ' + (error.message || 'Failed to submit form. Please try again or contact us directly.'));
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Collect all form data
 */
function collectFormData() {
    const form = document.getElementById('bookingForm');
    const formData = {
        dates: [],
        location: '',
        passengers: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        description: '',
        notes: ''
    };

    // Collect date/time groups
    const dateGroups = document.querySelectorAll('.date-time-group');
    dateGroups.forEach((group, index) => {
        const dateInput = group.querySelector(`#date_${index}`);
        const startTime = group.querySelector(`#start_time_${index}`);
        const endTime = group.querySelector(`#end_time_${index}`);

        if (dateInput && startTime && endTime) {
            formData.dates.push({
                date: dateInput.value,
                startTime: startTime.value,
                endTime: endTime.value
            });
        }
    });

    // Collect other fields
    formData.location = document.getElementById('location').value;
    formData.passengers = document.getElementById('passengers').value;
    formData.name = document.getElementById('name').value;
    formData.email = document.getElementById('email').value;
    formData.phone = document.getElementById('phone').value;
    formData.company = document.getElementById('company').value || 'N/A';
    formData.description = document.getElementById('description').value;
    formData.notes = document.getElementById('notes').value || 'N/A';

    return formData;
}

/**
 * Validate form data
 */
function validateFormData(formData) {
    // Check required fields
    if (!formData.dates.length) return false;
    if (!formData.location) return false;
    if (!formData.passengers || formData.passengers < 1) return false;
    if (!formData.name) return false;
    if (!formData.email) return false;
    if (!formData.phone) return false;
    if (!formData.description) return false;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return false;

    return true;
}

/**
 * Submit data to Google Forms
 */
async function submitToGoogleForms(formData) {
    // Check if Google Form is configured
    if (!CONFIG.googleForm.actionUrl || CONFIG.googleForm.actionUrl === 'YOUR_GOOGLE_FORM_ACTION_URL') {
        // If not configured, simulate successful submission for demo
        console.warn('Google Form not configured. Simulating submission...');
        console.log('Form Data:', formData);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        return;
    }

    // Format dates for submission
    const datesFormatted = formData.dates.map((d, i) => 
        `Date ${i + 1}: ${d.date} from ${d.startTime} to ${d.endTime}`
    ).join('\n');

    // Prepare form data for Google Forms
    const googleFormData = new URLSearchParams();
    
    // Map fields to Google Form entry IDs
    if (CONFIG.googleForm.fields.dates) {
        googleFormData.append(CONFIG.googleForm.fields.dates, datesFormatted);
    }
    if (CONFIG.googleForm.fields.location) {
        googleFormData.append(CONFIG.googleForm.fields.location, formData.location);
    }
    if (CONFIG.googleForm.fields.passengers) {
        googleFormData.append(CONFIG.googleForm.fields.passengers, formData.passengers);
    }
    if (CONFIG.googleForm.fields.name) {
        googleFormData.append(CONFIG.googleForm.fields.name, formData.name);
    }
    if (CONFIG.googleForm.fields.email) {
        googleFormData.append(CONFIG.googleForm.fields.email, formData.email);
    }
    if (CONFIG.googleForm.fields.phone) {
        googleFormData.append(CONFIG.googleForm.fields.phone, formData.phone);
    }
    if (CONFIG.googleForm.fields.company) {
        googleFormData.append(CONFIG.googleForm.fields.company, formData.company);
    }
    if (CONFIG.googleForm.fields.description) {
        googleFormData.append(CONFIG.googleForm.fields.description, formData.description);
    }
    if (CONFIG.googleForm.fields.notes) {
        googleFormData.append(CONFIG.googleForm.fields.notes, formData.notes);
    }

    // Submit to Google Forms using no-cors mode
    // Note: Google Forms returns an opaque response with no-cors, so we can't check success
    // We'll assume success if no error is thrown
    try {
        await fetch(CONFIG.googleForm.actionUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: googleFormData
        });
        
        // If we get here without error, assume success
        return;
    } catch (error) {
        console.error('Google Forms submission error:', error);
        throw new Error('Failed to submit to Google Forms');
    }
}

/**
 * Show status message
 */
function showStatusMessage(type, message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.className = `status-message ${type}`;
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';

    // Scroll to message
    statusMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Make functions globally available for inline event handlers
window.removeDateTimeGroup = removeDateTimeGroup;
