// Bus Booking Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the form
    initializeForm();
    initializeGoogleMaps();
    setupEventListeners();
});

// Constants
const METERS_PER_MILE = 1609.34;
const API_CALL_DELAY_MS = 200; // Delay between Distance Matrix API calls to avoid rate limiting

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
                    <div class="checkbox-inline">
                        <input type="checkbox" id="next_day_${index}" name="next_day_${index}">
                        <label for="next_day_${index}" class="checkbox-label">Ends next day</label>
                    </div>
                    <small>Check "Ends next day" if the trip continues past midnight (e.g., 11 PM to 1 AM)</small>
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
 * Calculate booking hours from start and end time
 */
/**
 * Calculate booking hours from start and end time
 */
function calculateBookingHours(startTime, endTime, endsNextDay = false) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    let totalMinutes = endMinutes - startMinutes;
    
    // If explicitly marked as next day OR if end time is before start time, add 24 hours
    if (endsNextDay || totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes, totalMinutes };
}

/**
 * Compute route information for all trip days
 */
async function computeRouteInformation(tripDays) {
    if (!window.google || !window.google.maps || !window.google.maps.DistanceMatrixService) {
        throw new Error('Google Maps Distance Matrix service not available');
    }

    const service = new google.maps.DistanceMatrixService();
    const routeInfo = {
        tripDays: [],
        totals: {
            distance: 0,
            duration: 0,
            stops: 0,
            bookingHours: 0
        }
    };

    for (let i = 0; i < tripDays.length; i++) {
        const day = tripDays[i];
        const bookingTime = calculateBookingHours(day.startTime, day.endTime, day.endsNextDay);
        
        const dayInfo = {
            dayNumber: i + 1,
            date: day.date,
            startTime: day.startTime,
            endTime: day.endTime,
            endsNextDay: day.endsNextDay || false,
            bookingHours: bookingTime.hours,
            bookingMinutes: bookingTime.minutes,
            legs: [],
            totals: {
                distance: 0,
                duration: 0,
                stops: day.dropoffs.length,
                bookingMinutes: bookingTime.totalMinutes
            }
        };

        // Build array of all locations in order: pickup, then all dropoffs
        const locations = [day.pickup, ...day.dropoffs];

        // Calculate distance/time for each leg of the journey
        for (let j = 0; j < locations.length - 1; j++) {
            const origin = locations[j];
            const destination = locations[j + 1];
            
            // Validate locations before API call
            if (!origin || typeof origin !== 'string' || !origin.trim() || 
                !destination || typeof destination !== 'string' || !destination.trim()) {
                console.warn(`Skipping invalid location pair at day ${i}, leg ${j}`);
                continue;
            }
            
            try {
                const result = await getDistanceAndTime(service, origin, destination);
                if (result) {
                    dayInfo.legs.push({
                        from: origin,
                        to: destination,
                        distance: result.distance,
                        duration: result.duration
                    });
                    dayInfo.totals.distance += result.distance.value;
                    dayInfo.totals.duration += result.duration.value;
                }
                
                // Add delay between API calls to avoid rate limiting (except after the very last call)
                if (!(i === tripDays.length - 1 && j === locations.length - 2)) {
                    await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY_MS));
                }
            } catch (error) {
                console.error(`Error computing leg ${j} for day ${i}:`, error);
            }
        }

        routeInfo.tripDays.push(dayInfo);
        routeInfo.totals.distance += dayInfo.totals.distance;
        routeInfo.totals.duration += dayInfo.totals.duration;
        routeInfo.totals.stops += dayInfo.totals.stops;
        routeInfo.totals.bookingHours += bookingTime.totalMinutes;
    }

    return routeInfo;
}

/**
 * Get distance and time between two locations using Distance Matrix API
 */
function getDistanceAndTime(service, origin, destination) {
    return new Promise((resolve, reject) => {
        service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.IMPERIAL,
                avoidHighways: false,
                avoidTolls: false
            },
            (response, status) => {
                if (status === google.maps.DistanceMatrixStatus.OK) {
                    const result = response.rows[0]?.elements[0];
                    if (result && result.status === 'OK') {
                        resolve({
                            distance: result.distance,
                            duration: result.duration
                        });
                    } else {
                        reject(new Error(`No route found: ${result?.status || 'Unknown error'}`));
                    }
                } else {
                    reject(new Error(`Distance Matrix request failed: ${status}`));
                }
            }
        );
    });
}

/**
 * Show route summary modal for user confirmation
 */
async function showRouteSummary(formData) {
    return new Promise((resolve) => {
        const routeInfo = formData.routeInfo;
        if (!routeInfo) {
            resolve(true);
            return;
        }

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        `;

        // Format route summary
        const totalMiles = (routeInfo.totals.distance / METERS_PER_MILE).toFixed(1);
        const totalHours = Math.floor(routeInfo.totals.duration / 3600);
        const totalMinutes = Math.floor((routeInfo.totals.duration % 3600) / 60);
        const totalBookingHours = Math.floor(routeInfo.totals.bookingHours / 60);
        const totalBookingMinutes = routeInfo.totals.bookingHours % 60;
        
        let summaryHTML = `
            <h2 style="margin-bottom: 20px; color: #1e293b;">🗺️ Route Summary</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px; color: #2563eb;">Total Trip Overview</h3>
                <p style="margin: 8px 0;"><strong>Total Distance:</strong> ${totalMiles} miles</p>
                <p style="margin: 8px 0;"><strong>Total Driving Time:</strong> ${totalHours}h ${totalMinutes}m</p>
                <p style="margin: 8px 0;"><strong>Total Booking Hours:</strong> ${totalBookingHours}h ${totalBookingMinutes}m</p>
                <p style="margin: 8px 0;"><strong>Total Stops:</strong> ${routeInfo.totals.stops}</p>
                <p style="margin: 8px 0;"><strong>Number of Passengers:</strong> ${formData.passengers}</p>
            </div>
        `;

        // Add details for each trip day
        routeInfo.tripDays.forEach((day) => {
            const dayMiles = (day.totals.distance / METERS_PER_MILE).toFixed(1);
            const dayHours = Math.floor(day.totals.duration / 3600);
            const dayMinutes = Math.floor((day.totals.duration % 3600) / 60);
            const overnightIndicator = day.endsNextDay ? ' (overnight)' : '';
            
            summaryHTML += `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h4 style="margin-bottom: 10px; color: #1e293b;">Day ${day.dayNumber} - ${day.date}</h4>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Time:</strong> ${day.startTime} - ${day.endTime}${overnightIndicator} (${day.bookingHours}h ${day.bookingMinutes}m booking)</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Distance:</strong> ${dayMiles} miles</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Driving Time:</strong> ${dayHours}h ${dayMinutes}m</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Stops:</strong> ${day.totals.stops}</p>
                </div>
            `;
        });

        summaryHTML += `
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>Note:</strong> This is an estimated calculation based on driving directions. 
                    Actual time and distance may vary based on traffic, route, and stops.
                </p>
            </div>
            <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancelSubmit" style="
                    padding: 12px 24px;
                    background: #e2e8f0;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                    color: #475569;
                ">Cancel</button>
                <button id="confirmSubmit" style="
                    padding: 12px 24px;
                    background: #2563eb;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                    color: white;
                ">Confirm & Submit</button>
            </div>
        `;

        modal.innerHTML = summaryHTML;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Add button event listeners
        document.getElementById('confirmSubmit').addEventListener('click', () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            resolve(true);
        });

        document.getElementById('cancelSubmit').addEventListener('click', () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
            resolve(false);
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && document.body.contains(overlay)) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        });
    });
}

/**
 * Format route information for Google Forms submission
 */
function formatRouteInformation(routeInfo, passengers) {
    if (!routeInfo) return '';
    
    const totalMiles = (routeInfo.totals.distance / METERS_PER_MILE).toFixed(1);
    const totalHours = Math.floor(routeInfo.totals.duration / 3600);
    const totalMinutes = Math.floor((routeInfo.totals.duration % 3600) / 60);
    const totalBookingHours = Math.floor(routeInfo.totals.bookingHours / 60);
    const totalBookingMinutes = routeInfo.totals.bookingHours % 60;
    
    let formatted = `ROUTE INFORMATION (Computed):
Total Distance: ${totalMiles} miles
Total Driving Time: ${totalHours}h ${totalMinutes}m
Total Booking Hours: ${totalBookingHours}h ${totalBookingMinutes}m
Total Stops: ${routeInfo.totals.stops}
Number of Passengers: ${passengers}

`;
    
    routeInfo.tripDays.forEach((day) => {
        const dayMiles = (day.totals.distance / METERS_PER_MILE).toFixed(1);
        const dayHours = Math.floor(day.totals.duration / 3600);
        const dayMinutes = Math.floor((day.totals.duration % 3600) / 60);
        const overnightIndicator = day.endsNextDay ? ' (overnight)' : '';
        
        formatted += `Day ${day.dayNumber} (${day.date}):
  Time: ${day.startTime} - ${day.endTime}${overnightIndicator} (${day.bookingHours}h ${day.bookingMinutes}m booking)
  Distance: ${dayMiles} miles
  Driving Time: ${dayHours}h ${dayMinutes}m
  Stops: ${day.totals.stops}
`;
        
        day.legs.forEach((leg, idx) => {
            // Add null checks and value validation for leg data
            if (leg && leg.distance && leg.distance.value && typeof leg.distance.value === 'number' && leg.distance.value > 0 &&
                leg.duration && leg.duration.value && typeof leg.duration.value === 'number' && leg.duration.value > 0) {
                const legMiles = (leg.distance.value / METERS_PER_MILE).toFixed(1);
                const legMinutes = Math.floor(leg.duration.value / 60);
                formatted += `  Leg ${idx + 1}: ${legMiles} mi, ${legMinutes} min\n`;
            }
        });
        
        formatted += '\n';
    });
    
    return formatted;
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

        // Compute route information if enabled
        if (CONFIG.routeComputation?.enabled && window.google && window.google.maps && window.google.maps.DistanceMatrixService) {
            btnLoader.innerHTML = '<span class="spinner"></span> Computing route information...';
            try {
                formData.routeInfo = await computeRouteInformation(formData.tripDays);
            } catch (error) {
                console.error('Route computation error:', error);
                // Continue with submission even if route computation fails
                formData.routeInfo = null;
            }
        }

        // Show route summary if enabled and available
        if (CONFIG.routeComputation?.showSummary && formData.routeInfo) {
            const confirmed = await showRouteSummary(formData);
            if (!confirmed) {
                throw new Error('Submission cancelled by user');
            }
        }

        btnLoader.innerHTML = '<span class="spinner"></span> Submitting...';

        // Submit to Google Forms
        await submitToGoogleForms(formData);

        // Save to localStorage for admin dashboard
        saveQuoteToLocalStorage(formData);

        // Redirect to success page with query parameters
        const params = new URLSearchParams({
            name: formData.name,
            email: formData.email
        });
        window.location.href = `success.html?${params.toString()}`;

    } catch (error) {
        console.error('Form submission error:', error);
        if (error.message !== 'Submission cancelled by user') {
            showStatusMessage('error', '✗ ' + (error.message || 'Failed to submit form. Please try again or contact us directly.'));
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btnLoader.innerHTML = '<span class="spinner"></span> Submitting...';
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
        const endsNextDay = group.querySelector(`#next_day_${index}`);

        if (dateInput && startTime && endTime && pickupInput) {
            const tripDay = {
                date: dateInput.value,
                startTime: startTime.value,
                endTime: endTime.value,
                endsNextDay: endsNextDay ? endsNextDay.checked : false,
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
        const overnightIndicator = day.endsNextDay ? ' (overnight)' : '';
        return `Day ${i + 1}: ${day.date} from ${day.startTime} to ${day.endTime}${overnightIndicator}
  Pick-up: ${day.pickup}
${dropoffsText}`;
    }).join('\n\n');

    // Format route information if available
    const routeInfoFormatted = formatRouteInformation(formData.routeInfo, formData.passengers);

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
    // Append route info to notes field if route info is available
    const notesWithRouteInfo = routeInfoFormatted ? 
        `${routeInfoFormatted}\n---\nUSER NOTES:\n${formData.notes}` : 
        formData.notes;
    if (CONFIG.googleForm.fields.notes) {
        googleFormData.append(CONFIG.googleForm.fields.notes, notesWithRouteInfo);
    }
    // If a separate route info field is configured, use it
    if (CONFIG.googleForm.fields.routeInfo && routeInfoFormatted) {
        googleFormData.append(CONFIG.googleForm.fields.routeInfo, routeInfoFormatted);
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
        // Don't throw error - allow submission to continue to localStorage
        console.warn('Google Forms submission failed, but quote saved locally for admin dashboard');
        return;
    }
}

/**
 * Save quote to localStorage for admin dashboard
 */
function saveQuoteToLocalStorage(formData) {
    const STORAGE_KEY = 'busCharterQuotes';
    
    try {
        const quotes = localStorage.getItem(STORAGE_KEY);
        const quotesArray = quotes ? JSON.parse(quotes) : [];
        
        quotesArray.push({
            id: Date.now(),
            ...formData,
            submittedAt: new Date().toISOString()
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotesArray));
    } catch (error) {
        console.error('Error saving quote to localStorage:', error);
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
