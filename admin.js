// Admin Dashboard JavaScript
// SECURITY WARNING: Change this password before deploying to production!
// This is client-side authentication suitable for personal use only.
// For production, implement proper backend authentication.
const ADMIN_PASSWORD = 'admin123'; // TODO: Change this to a secure password!
const STORAGE_KEY = 'busCharterQuotes';
const AUTH_KEY = 'busCharterAuth';
const METERS_PER_MILE = 1609.34; // Conversion constant

// State abbreviations for interstate detection
const US_STATE_ABBREVIATIONS = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupLoginForm();
});

/**
 * Check if user is authenticated
 */
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';
    
    if (isAuthenticated) {
        showDashboard();
        loadQuotes();
    } else {
        showLogin();
    }
}

/**
 * Setup login form
 */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

/**
 * Handle login
 */
function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    // In production, this should use secure backend authentication
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        errorDiv.style.display = 'none';
        showDashboard();
        loadQuotes();
    } else {
        errorDiv.textContent = 'Invalid password. Please try again.';
        errorDiv.style.display = 'block';
    }
}

/**
 * Logout
 */
function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    showLogin();
}

/**
 * Show login container
 */
function showLogin() {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
}

/**
 * Show admin dashboard
 */
function showDashboard() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
}

/**
 * Load quotes from localStorage
 */
function loadQuotes() {
    const quotes = getQuotes();
    
    if (quotes.length === 0) {
        // Show empty state
        document.getElementById('quotesList').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No quote requests yet.</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">Quotes submitted from <strong>this browser</strong> will appear here.</p>
            </div>
        `;
        updateStats([]);
        return;
    }
    
    // Sort by date (newest first)
    quotes.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Display quotes
    displayQuotes(quotes);
    updateStats(quotes);
}

/**
 * Get quotes from localStorage
 */
function getQuotes() {
    const quotesJson = localStorage.getItem(STORAGE_KEY);
    return quotesJson ? JSON.parse(quotesJson) : [];
}

/**
 * Save quote to localStorage
 */
function saveQuote(quoteData) {
    const quotes = getQuotes();
    quotes.push({
        id: Date.now(),
        ...quoteData,
        submittedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

/**
 * Display quotes in the list
 */
function displayQuotes(quotes) {
    const quotesList = document.getElementById('quotesList');
    
    const quotesHTML = quotes.map(quote => {
        const date = new Date(quote.submittedAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const totalMiles = quote.routeInfo ? 
            (quote.routeInfo.totals.distance / METERS_PER_MILE).toFixed(1) : 'N/A';
        const totalBookingHours = quote.routeInfo && quote.routeInfo.totals.bookingHours ?
            `${Math.floor(quote.routeInfo.totals.bookingHours / 60)}h ${quote.routeInfo.totals.bookingHours % 60}m` : 'N/A';
        
        return `
            <div class="quote-card" onclick="showQuoteDetail(${quote.id})">
                <div class="quote-header-row">
                    <div class="quote-name">${quote.name}</div>
                    <div class="quote-date">${formattedDate}</div>
                </div>
                <div class="quote-summary">
                    <div class="quote-detail">
                        <span class="quote-detail-label">Email</span>
                        <span class="quote-detail-value">${quote.email}</span>
                    </div>
                    <div class="quote-detail">
                        <span class="quote-detail-label">Phone</span>
                        <span class="quote-detail-value">${quote.phone}</span>
                    </div>
                    <div class="quote-detail">
                        <span class="quote-detail-label">Passengers</span>
                        <span class="quote-detail-value">${quote.passengers}</span>
                    </div>
                    <div class="quote-detail">
                        <span class="quote-detail-label">Trip Days</span>
                        <span class="quote-detail-value">${quote.tripDays.length}</span>
                    </div>
                    <div class="quote-detail">
                        <span class="quote-detail-label">Total Distance</span>
                        <span class="quote-detail-value">${totalMiles} mi</span>
                    </div>
                    <div class="quote-detail">
                        <span class="quote-detail-label">Booking Hours</span>
                        <span class="quote-detail-value">${totalBookingHours}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    quotesList.innerHTML = quotesHTML;
}

/**
 * Update dashboard statistics
 */
function updateStats(quotes) {
    const totalQuotes = quotes.length;
    
    // Get quotes from this month
    const now = new Date();
    const thisMonth = quotes.filter(q => {
        const qDate = new Date(q.submittedAt);
        return qDate.getMonth() === now.getMonth() && 
               qDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Calculate total passengers
    const totalPassengers = quotes.reduce((sum, q) => sum + parseInt(q.passengers || 0), 0);
    
    // Calculate total miles
    const totalMiles = quotes.reduce((sum, q) => {
        if (q.routeInfo && q.routeInfo.totals && q.routeInfo.totals.distance) {
            return sum + (q.routeInfo.totals.distance / METERS_PER_MILE);
        }
        return sum;
    }, 0);
    
    document.getElementById('totalQuotes').textContent = totalQuotes;
    document.getElementById('monthQuotes').textContent = thisMonth;
    document.getElementById('totalPassengers').textContent = totalPassengers.toLocaleString();
    document.getElementById('totalMiles').textContent = totalMiles.toFixed(0).toLocaleString();
}

/**
 * Show quote detail in modal
 */
function showQuoteDetail(quoteId) {
    const quotes = getQuotes();
    const quote = quotes.find(q => q.id === quoteId);
    
    if (!quote) return;
    
    const modal = document.getElementById('quoteModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Quote Request - ${quote.name}`;
    
    // Build modal content
    let content = generateQuoteDetailHTML(quote);
    modalBody.innerHTML = content;
    
    modal.style.display = 'block';
    
    // Initialize map if Google Maps is available and route info exists
    if (window.google && quote.routeInfo) {
        setTimeout(() => initializeQuoteMap(quote), 100);
    }
}

/**
 * Generate HTML for quote detail
 */
function generateQuoteDetailHTML(quote) {
    const date = new Date(quote.submittedAt);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let html = `
        <div class="detail-section">
            <h3>📋 Request Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-item-label">Submitted</div>
                    <div class="detail-item-value">${formattedDate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Full Name</div>
                    <div class="detail-item-value">${quote.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Email</div>
                    <div class="detail-item-value"><a href="mailto:${quote.email}">${quote.email}</a></div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Phone</div>
                    <div class="detail-item-value"><a href="tel:${quote.phone}">${quote.phone}</a></div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Company</div>
                    <div class="detail-item-value">${quote.company || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">Passengers</div>
                    <div class="detail-item-value">${quote.passengers}</div>
                </div>
            </div>
        </div>
    `;
    
    // Trip Details
    html += `
        <div class="detail-section">
            <h3>🚌 Trip Details</h3>
            <div class="detail-item" style="margin-bottom: 15px;">
                <div class="detail-item-label">Description</div>
                <div class="detail-item-value" style="white-space: pre-wrap;">${quote.description}</div>
            </div>
    `;
    
    if (quote.notes && quote.notes !== 'N/A') {
        html += `
            <div class="detail-item">
                <div class="detail-item-label">Special Notes</div>
                <div class="detail-item-value" style="white-space: pre-wrap;">${quote.notes}</div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Route Information
    if (quote.routeInfo) {
        const totalMiles = (quote.routeInfo.totals.distance / METERS_PER_MILE).toFixed(1);
        const totalDrivingHours = Math.floor(quote.routeInfo.totals.duration / 3600);
        const totalDrivingMinutes = Math.floor((quote.routeInfo.totals.duration % 3600) / 60);
        const totalBookingHours = Math.floor(quote.routeInfo.totals.bookingHours / 60);
        const totalBookingMinutes = quote.routeInfo.totals.bookingHours % 60;
        
        html += `
            <div class="detail-section">
                <h3>📏 Route Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-item-label">Total Distance</div>
                        <div class="detail-item-value">${totalMiles} miles</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item-label">Driving Time</div>
                        <div class="detail-item-value">${totalDrivingHours}h ${totalDrivingMinutes}m</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item-label">Booking Hours</div>
                        <div class="detail-item-value">${totalBookingHours}h ${totalBookingMinutes}m</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item-label">Total Stops</div>
                        <div class="detail-item-value">${quote.routeInfo.totals.stops}</div>
                    </div>
                </div>
                <div id="mapContainer" class="map-container"></div>
            </div>
        `;
    }
    
    // Trip Days
    html += `
        <div class="detail-section">
            <h3>📅 Trip Days & Locations</h3>
    `;
    
    quote.tripDays.forEach((day, index) => {
        const dayInfo = quote.routeInfo?.tripDays[index];
        const dayMiles = dayInfo ? (dayInfo.totals.distance / METERS_PER_MILE).toFixed(1) : 'N/A';
        const dayDrivingHours = dayInfo ? Math.floor(dayInfo.totals.duration / 3600) : 0;
        const dayDrivingMinutes = dayInfo ? Math.floor((dayInfo.totals.duration % 3600) / 60) : 0;
        const dayBookingHours = dayInfo ? dayInfo.bookingHours : 0;
        const dayBookingMinutes = dayInfo ? dayInfo.bookingMinutes : 0;
        const overnightBadge = day.endsNextDay ? ' <span style="background: #fbbf24; color: #78350f; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">OVERNIGHT</span>' : '';
        
        html += `
            <div class="trip-day-card">
                <h4>Day ${index + 1} - ${day.date}${overnightBadge}</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-item-label">Start Time</div>
                        <div class="detail-item-value">${day.startTime}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item-label">End Time</div>
                        <div class="detail-item-value">${day.endTime}${day.endsNextDay ? ' <small>(next day)</small>' : ''}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item-label">Booking Duration</div>
                        <div class="detail-item-value">${dayBookingHours}h ${dayBookingMinutes}m</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item-label">Distance</div>
                        <div class="detail-item-value">${dayMiles} miles</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-item-label">Driving Time</div>
                        <div class="detail-item-value">${dayDrivingHours}h ${dayDrivingMinutes}m</div>
                    </div>
                </div>
                <ul class="location-list">
                    <li><strong>Pick-up:</strong> ${day.pickup}</li>
                    ${day.dropoffs.map((dropoff, idx) => 
                        `<li><strong>Drop-off ${idx + 1}:</strong> ${dropoff}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    });
    
    html += `</div>`;
    
    // Notable Information
    html += generateNotableInfo(quote);
    
    return html;
}

/**
 * Generate notable information section
 */
function generateNotableInfo(quote) {
    const notableItems = [];
    
    // Check for multi-day trips
    if (quote.tripDays.length > 1) {
        notableItems.push(`Multi-day trip (${quote.tripDays.length} days)`);
    }
    
    // Check for large groups
    if (parseInt(quote.passengers) > 50) {
        notableItems.push(`Large group (${quote.passengers} passengers)`);
    }
    
    // Check for long distances
    if (quote.routeInfo && (quote.routeInfo.totals.distance / METERS_PER_MILE) > 200) {
        notableItems.push(`Long distance trip (${(quote.routeInfo.totals.distance / METERS_PER_MILE).toFixed(0)} miles)`);
    }
    
    // Check for overnight trips (booking hours > 12)
    if (quote.routeInfo && quote.routeInfo.totals.bookingHours > 720) {
        notableItems.push(`Extended booking (${Math.floor(quote.routeInfo.totals.bookingHours / 60)}+ hours)`);
    }
    
    // Check for potential state line crossing (basic heuristic)
    const allLocations = quote.tripDays.flatMap(day => [day.pickup, ...day.dropoffs]);
    const hasMultipleStates = checkMultipleStates(allLocations);
    if (hasMultipleStates) {
        notableItems.push('Potential interstate travel');
    }
    
    if (notableItems.length === 0) {
        return '';
    }
    
    let html = `
        <div class="detail-section">
            <h3>⚠️ Notable Information</h3>
            <div class="notable-info">
    `;
    
    notableItems.forEach(item => {
        html += `<div class="notable-info-item">• ${item}</div>`;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

/**
 * Check if locations span multiple states (basic heuristic)
 * Uses regex for efficient state detection
 */
function checkMultipleStates(locations) {
    const foundStates = new Set();
    
    // Create regex pattern to match state abbreviations with proper boundaries
    const statePattern = new RegExp(`,\\s*(${US_STATE_ABBREVIATIONS.join('|')})\\s*[,\\s]`, 'g');
    
    locations.forEach(location => {
        const matches = location.matchAll(statePattern);
        for (const match of matches) {
            foundStates.add(match[1]);
        }
    });
    
    return foundStates.size > 1;
}

/**
 * Initialize Google Map for quote
 */
function initializeQuoteMap(quote) {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer || !window.google) return;
    
    // Create map
    const map = new google.maps.Map(mapContainer, {
        zoom: 10,
        mapTypeId: 'roadmap'
    });
    
    const bounds = new google.maps.LatLngBounds();
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false
    });
    
    // For simplicity, show the route for the first trip day
    // In a more advanced implementation, you could show all days
    if (quote.tripDays.length > 0) {
        const firstDay = quote.tripDays[0];
        const waypoints = firstDay.dropoffs.slice(0, -1).map(location => ({
            location: location,
            stopover: true
        }));
        
        const request = {
            origin: firstDay.pickup,
            destination: firstDay.dropoffs[firstDay.dropoffs.length - 1],
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        directionsService.route(request, function(result, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
            } else {
                console.error('Directions request failed:', status);
                // Fallback: show markers only
                showMarkersOnly(map, quote.tripDays[0], bounds);
            }
        });
    }
}

/**
 * Show markers only (fallback if directions fail)
 */
function showMarkersOnly(map, tripDay, bounds) {
    const geocoder = new google.maps.Geocoder();
    const locations = [tripDay.pickup, ...tripDay.dropoffs];
    
    locations.forEach((location, index) => {
        geocoder.geocode({ address: location }, function(results, status) {
            if (status === 'OK') {
                const marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    label: (index === 0 ? 'P' : String(index)),
                    title: location
                });
                bounds.extend(results[0].geometry.location);
                map.fitBounds(bounds);
            }
        });
    });
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('quoteModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('quoteModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Make saveQuote available globally for use by the form submission
window.saveQuoteToAdmin = saveQuote;
