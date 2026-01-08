// Bus Booking Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form
    initializeForm();
    initializeGoogleMaps();
    setupEventListeners();
});

// Counter for date/time groups
let dateTimeCounter = 1;

// Track dropoff counters per day
let dropoffCounters = { 0: 1 };

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
    script.onload = initAllAutocomplete;
    script.onerror = function() {
        console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);
}

/**
 * Initialize Places Autocomplete on all location inputs
 */
function initAllAutocomplete() {
    const locationInputs = document.querySelectorAll('.location-input');
    
    locationInputs.forEach(input => {
        initAutocompleteForInput(input);
    });
}

/**
 * Initialize autocomplete for a specific input
 */
function initAutocompleteForInput(input) {
    if (!input || !window.google) return;

    try {
        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['geocode', 'establishment'],
            fields: ['formatted_address', 'geometry', 'name']
        });

        // Store selected place data
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
                input.dataset.placeData = JSON.stringify({
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

    // Add dropoff buttons (delegate to parent container)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-dropoff-btn')) {
            const dayIndex = e.target.dataset.dayIndex;
            addDropoffLocation(dayIndex);
        }
        if (e.target.classList.contains('remove-dropoff-btn')) {
            const dayIndex = e.target.dataset.dayIndex;
            const dropoffIndex = e.target.dataset.dropoffIndex;
            removeDropoffLocation(dayIndex, dropoffIndex);
        }
    });

    // Form submission
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Add a new date/time group with locations
 */
function addDateTimeGroup() {
    const container = document.getElementById('dateTimeContainer');
    const index = dateTimeCounter++;
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize dropoff counter for this day
    dropoffCounters[index] = 1;

    const groupHTML = `
        <div class="date-time-group" data-index="${index}">
            <h3>
                Trip Day #${index + 1}
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
            
            <!-- Locations for this day -->
            <div class="locations-subsection">
                <h4>Locations for This Day</h4>
                
                <div class="form-group">
                    <label for="pickup_${index}">Pick-up Location *</label>
                    <input type="text" id="pickup_${index}" name="pickup_${index}" class="location-input" placeholder="Enter pick-up address or location" required>
                    <small>Start typing to see suggestions</small>
                </div>
                
                <div class="dropoff-container" data-day-index="${index}">
                    <div class="dropoff-group" data-dropoff-index="0">
                        <div class="form-group">
                            <label for="dropoff_${index}_0">Drop-off Location #1 *</label>
                            <input type="text" id="dropoff_${index}_0" name="dropoff_${index}_0" class="location-input" placeholder="Enter drop-off address or location" required>
                            <small>Start typing to see suggestions</small>
                        </div>
                    </div>
                </div>
                
                <button type="button" class="btn-secondary add-dropoff-btn" data-day-index="${index}">+ Add Another Drop-off</button>
                <small class="location-note">The final drop-off location will be your final destination for this day.</small>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', groupHTML);
    
    // Initialize autocomplete for the new location inputs if Google Maps is loaded
    if (window.google) {
        const newPickup = document.getElementById(`pickup_${index}`);
        const newDropoff = document.getElementById(`dropoff_${index}_0`);
        if (newPickup) initAutocompleteForInput(newPickup);
        if (newDropoff) initAutocompleteForInput(newDropoff);
    }
}

/**
 * Remove a date/time group
 */
function removeDateTimeGroup(index) {
    const group = document.querySelector(`.date-time-group[data-index="${index}"]`);
    if (group) {
        group.remove();
        // Clean up dropoff counter
        delete dropoffCounters[index];
    }
}

/**
 * Add a dropoff location to a specific day
 */
function addDropoffLocation(dayIndex) {
    const container = document.querySelector(`.dropoff-container[data-day-index="${dayIndex}"]`);
    if (!container) return;
    
    const dropoffIndex = dropoffCounters[dayIndex]++;
    
    const dropoffHTML = `
        <div class="dropoff-group" data-dropoff-index="${dropoffIndex}">
            <div class="form-group">
                <label for="dropoff_${dayIndex}_${dropoffIndex}">
                    Drop-off Location #${dropoffIndex + 1} *
                    <button type="button" class="remove-dropoff-btn" data-day-index="${dayIndex}" data-dropoff-index="${dropoffIndex}">
                        Remove
                    </button>
                </label>
                <input type="text" id="dropoff_${dayIndex}_${dropoffIndex}" name="dropoff_${dayIndex}_${dropoffIndex}" class="location-input" placeholder="Enter drop-off address or location" required>
                <small>Start typing to see suggestions</small>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', dropoffHTML);
    
    // Initialize autocomplete for the new input if Google Maps is loaded
    if (window.google) {
        const newInput = document.getElementById(`dropoff_${dayIndex}_${dropoffIndex}`);
        if (newInput) initAutocompleteForInput(newInput);
    }
}

/**
 * Remove a dropoff location
 */
function removeDropoffLocation(dayIndex, dropoffIndex) {
    const container = document.querySelector(`.dropoff-container[data-day-index="${dayIndex}"]`);
    if (!container) return;
    
    const dropoffGroup = container.querySelector(`.dropoff-group[data-dropoff-index="${dropoffIndex}"]`);
    if (dropoffGroup) {
        dropoffGroup.remove();
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
                if (idx > 0) {
                    group.remove();
                } else {
                    // For the first group, remove extra dropoff locations
                    const dropoffContainer = group.querySelector('.dropoff-container');
                    if (dropoffContainer) {
                        const dropoffGroups = dropoffContainer.querySelectorAll('.dropoff-group');
                        dropoffGroups.forEach((dropoffGroup, dropoffIdx) => {
                            if (dropoffIdx > 0) dropoffGroup.remove();
                        });
                    }
                }
            });
            dateTimeCounter = 1;
            dropoffCounters = { 0: 1 };
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
        tripDays: [],
        passengers: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        description: '',
        notes: ''
    };

    // Collect date/time groups with their locations
    const dateGroups = document.querySelectorAll('.date-time-group');
    dateGroups.forEach((group) => {
        const index = group.dataset.index;
        const dateInput = group.querySelector(`#date_${index}`);
        const startTime = group.querySelector(`#start_time_${index}`);
        const endTime = group.querySelector(`#end_time_${index}`);
        const pickupInput = group.querySelector(`#pickup_${index}`);

        if (dateInput && startTime && endTime && pickupInput) {
            const tripDay = {
                date: dateInput.value,
                startTime: startTime.value,
                endTime: endTime.value,
                pickup: pickupInput.value.trim(),
                dropoffs: []
            };
            
            // Collect all dropoff locations for this day
            const dropoffContainer = group.querySelector(`.dropoff-container[data-day-index="${index}"]`);
            if (dropoffContainer) {
                const dropoffGroups = dropoffContainer.querySelectorAll('.dropoff-group');
                dropoffGroups.forEach((dropoffGroup) => {
                    const dropoffIndex = dropoffGroup.dataset.dropoffIndex;
                    if (dropoffIndex !== undefined) {
                        const dropoffInput = dropoffGroup.querySelector(`#dropoff_${index}_${dropoffIndex}`);
                        if (dropoffInput && dropoffInput.value && dropoffInput.value.trim()) {
                            tripDay.dropoffs.push(dropoffInput.value.trim());
                        }
                    }
                });
            }
            
            formData.tripDays.push(tripDay);
        }
    });

    // Collect other fields
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
    if (!formData.tripDays.length) return false;
    
    // Validate each trip day
    for (const day of formData.tripDays) {
        if (!day.date || !day.startTime || !day.endTime) return false;
        if (!day.pickup) return false;
        if (!day.dropoffs.length || day.dropoffs.some(d => !d)) return false;
    }
    
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

    // Format trip days with dates and locations for submission
    const tripDaysFormatted = formData.tripDays.map((day, i) => {
        const dropoffsText = day.dropoffs.map((d, idx) => `  Drop-off ${idx + 1}: ${d}`).join('\n');
        return `Day ${i + 1}: ${day.date} from ${day.startTime} to ${day.endTime}
  Pick-up: ${day.pickup}
${dropoffsText}`;
    }).join('\n\n');

    // Prepare form data for Google Forms
    const googleFormData = new URLSearchParams();
    
    // Map fields to Google Form entry IDs
    if (CONFIG.googleForm.fields.tripDays) {
        googleFormData.append(CONFIG.googleForm.fields.tripDays, tripDaysFormatted);
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
