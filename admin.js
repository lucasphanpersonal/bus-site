// Admin Dashboard JavaScript
// SECURITY WARNING: Change this password before deploying to production!
// This is client-side authentication suitable for personal use only.
// For production, implement proper backend authentication.
const ADMIN_PASSWORD = 'admin123'; // TODO: Change this to a secure password!
const AUTH_KEY = 'busCharterAuth';
const METERS_PER_MILE = 1609.34; // Conversion constant

// Global state for loaded quotes
let loadedQuotes = [];

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
    updateDataSourceBanner();
}

/**
 * Update the data source banner based on configuration
 */
function updateDataSourceBanner() {
    const bannerText = document.getElementById('dataSourceText');
    if (!bannerText) return;
    
    if (CONFIG.googleSheets && CONFIG.googleSheets.enabled) {
        bannerText.innerHTML = 'Reading quotes from <strong>Google Sheets</strong>. All quotes submitted by customers will appear here, accessible from any device.';
        document.getElementById('dataBanner').style.background = '#d1fae5';
        document.getElementById('dataBanner').style.borderColor = '#10b981';
        document.getElementById('dataBannerContent').style.color = '#065f46';
    } else {
        bannerText.innerHTML = 'Quote data is stored <strong>locally in this browser only</strong>. To see submitted quotes here, they must be submitted from this same browser on this same device. Data is not synced across browsers, devices, or deployments. <a href="https://github.com/lucasphanpersonal/bus-site/blob/main/DATA_STORAGE_GUIDE.md" target="_blank" style="color: #1e3a8a; text-decoration: underline;">Learn more</a> or enable Google Sheets integration in config.js.';
    }
}

/**
 * Load quotes - from Google Sheets only
 */
async function loadQuotes() {
    try {
        let quotes;
        
        // Load from Google Sheets
        if (CONFIG.googleSheets && CONFIG.googleSheets.enabled) {
            showLoadingState();
            quotes = await getQuotesFromGoogleSheets();
        } else {
            throw new Error('Google Sheets integration is not enabled. Please set googleSheets.enabled to true and configure your spreadsheet ID in config.js. See GOOGLE_SHEETS_SETUP.md for detailed setup instructions.');
        }
        
        if (quotes.length === 0) {
            showEmptyState();
            updateStats([]);
            return;
        }
        
        // Sort by date (newest first)
        quotes.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        // Store quotes globally for detail views
        loadedQuotes = quotes;
        
        // Display quotes
        displayQuotes(quotes);
        updateStats(quotes);
    } catch (error) {
        console.error('Error loading quotes:', error);
        showErrorState(error.message);
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    document.getElementById('quotesList').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⏳</div>
            <p>Loading quotes from Google Sheets...</p>
        </div>
    `;
}

/**
 * Show empty state
 */
function showEmptyState() {
    const dataSource = CONFIG.googleSheets?.enabled ? 'Google Sheets' : 'this browser';
    document.getElementById('quotesList').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>No quote requests yet.</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">Quotes will appear here once submitted${CONFIG.googleSheets?.enabled ? '' : ' from <strong>' + dataSource + '</strong>'}.</p>
        </div>
    `;
}

/**
 * Show error state
 */
function showErrorState(errorMessage) {
    // Format multi-line error messages nicely with preserved whitespace
    const formattedMessage = errorMessage
        .split('\n')
        .map(line => {
            // Convert emoji checkmarks and X's to styled spans
            if (line.includes('✅')) {
                return `<div style="color: #059669; margin: 8px 0;">${line}</div>`;
            } else if (line.includes('❌')) {
                return `<div style="color: #dc2626; font-weight: 600; margin: 8px 0;">${line}</div>`;
            } else if (line.match(/^\d+\./)) {
                // Numbered list items
                return `<div style="margin-left: 20px; margin: 4px 0;">${line}</div>`;
            } else {
                return `<div style="margin: 4px 0;">${line}</div>`;
            }
        })
        .join('');
    
    document.getElementById('quotesList').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon" style="color: #ef4444; font-size: 3rem;">⚠️</div>
            <p style="color: #dc2626; font-weight: 700; font-size: 1.2rem; margin: 15px 0;">Error loading quotes</p>
            <div style="
                margin-top: 20px; 
                padding: 20px; 
                background: #fef2f2; 
                border: 1px solid #fecaca; 
                border-radius: 8px; 
                text-align: left; 
                max-width: 800px;
                font-size: 0.9rem;
                line-height: 1.6;
                color: #991b1b;
            ">
                ${formattedMessage}
            </div>
            <div style="margin-top: 25px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="loadQuotes()" style="
                    padding: 10px 20px; 
                    background: #2563eb; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.95rem;
                ">🔄 Retry</button>
                <a href="GOOGLE_SHEETS_SETUP.md" target="_blank" style="
                    padding: 10px 20px; 
                    background: #f3f4f6; 
                    color: #374151; 
                    border: 1px solid #d1d5db;
                    border-radius: 6px; 
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: inline-block;
                ">📖 Setup Guide</a>
            </div>
        </div>
    `;
}

/**
 * Get quotes from Google Sheets API
 */
async function getQuotesFromGoogleSheets() {
    const sheetsConfig = CONFIG.googleSheets;
    const apiKey = sheetsConfig.apiKey || CONFIG.googleMaps.apiKey;
    
    if (!sheetsConfig.spreadsheetId || sheetsConfig.spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
        throw new Error('Google Sheets Spreadsheet ID not configured. Please update config.js');
    }
    
    if (!apiKey) {
        throw new Error('API key not found. Please configure in config.js');
    }
    
    // Build the Sheets API URL
    const sheetName = encodeURIComponent(sheetsConfig.sheetName || 'Form Responses 1');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetsConfig.spreadsheetId}/values/${sheetName}?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 403) {
                // Try to get more specific error details from the API response
                let errorDetails = null;
                try {
                    errorDetails = await response.json();
                } catch (e) {
                    // Ignore JSON parse errors
                }
                
                const errorMessage = errorDetails?.error?.message || '';
                let detailedError = '⚠️ API Access Denied\n\n';
                
                // Check for specific error messages to provide targeted help
                if (errorMessage.includes('Google Sheets API has not been used') || 
                    errorMessage.includes('it is disabled') ||
                    errorMessage.includes('API has not been enabled')) {
                    detailedError += '❌ The Google Sheets API is NOT enabled for your API key.\n\n' +
                        '✅ To fix this:\n' +
                        '1. Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com\n' +
                        '2. Make sure you\'re in the correct project (the one with your API key)\n' +
                        '3. Click the "ENABLE" button\n' +
                        '4. Wait a minute for changes to propagate, then refresh this page\n\n' +
                        'See GOOGLE_SHEETS_SETUP.md for detailed step-by-step instructions.';
                } else if (errorMessage.includes('API key not valid') || 
                           errorMessage.includes('API key expired') ||
                           errorMessage.includes('API key not found')) {
                    detailedError += '❌ The API key is invalid, expired, or not found.\n\n' +
                        '✅ To fix this:\n' +
                        '1. Check the API key in config.js matches your Google Cloud Console key\n' +
                        '2. Verify the key hasn\'t been deleted or restricted\n' +
                        '3. If using API key restrictions, ensure Google Sheets API is allowed';
                } else if (errorMessage.includes('The caller does not have permission') ||
                           errorMessage.includes('Request had insufficient authentication scopes')) {
                    detailedError += '❌ The spreadsheet is not publicly accessible.\n\n' +
                        '✅ To fix this:\n' +
                        '1. Open your Google Sheet\n' +
                        '2. Click the "Share" button (top right)\n' +
                        '3. Click "Change to anyone with the link"\n' +
                        '4. Make sure it\'s set to "Viewer" (not Editor)\n' +
                        '5. Click "Done"';
                } else {
                    // Generic 403 error - provide all common solutions
                    detailedError += '❌ Unable to access the Google Sheets API.\n\n' +
                        'Most common cause: Google Sheets API is not enabled.\n\n' +
                        '✅ Please verify:\n' +
                        '1. Google Sheets API is enabled: https://console.cloud.google.com/apis/library/sheets.googleapis.com\n' +
                        '2. The spreadsheet is shared publicly: Share → "Anyone with the link" can View\n' +
                        '3. Your API key in config.js is correct and not restricted\n\n' +
                        'See GOOGLE_SHEETS_SETUP.md for complete setup instructions.';
                    
                    // Log full error to console for debugging (not shown to user)
                    console.error('Full API error:', errorMessage || response.statusText);
                }
                
                throw new Error(detailedError);
            } else if (response.status === 404) {
                throw new Error('❌ Spreadsheet not found.\n\n' +
                    '✅ To fix this:\n' +
                    '1. Check the Spreadsheet ID in config.js\n' +
                    '2. The ID should be the long string between /d/ and /edit in your Google Sheets URL\n' +
                    '3. Example: docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit\n\n' +
                    'Current ID: ' + sheetsConfig.spreadsheetId);
            } else if (response.status === 400) {
                let errorDetails = null;
                try {
                    errorDetails = await response.json();
                } catch (e) {
                    // Ignore
                }
                throw new Error('❌ Bad request: ' + (errorDetails?.error?.message || 'Invalid sheet name or range') + '\n\n' +
                    '✅ To fix this:\n' +
                    'Check that the sheet name "' + sheetsConfig.sheetName + '" in config.js matches your Google Sheet tab name exactly (case-sensitive).');
            }
            throw new Error('❌ Failed to fetch data: ' + response.status + ' ' + response.statusText + '\n\n' +
                'Please check your configuration and try again.');
        }
        
        const data = await response.json();
        
        if (!data.values || data.values.length <= 1) {
            // No data rows (only header or empty)
            return [];
        }
        
        // Parse the rows into quote objects
        return parseGoogleSheetsData(data.values);
    } catch (error) {
        console.error('Google Sheets API error:', error);
        throw error;
    }
}

/**
 * Parse Google Sheets data into quote objects
 */
function parseGoogleSheetsData(rows) {
    const quotes = [];
    const cols = CONFIG.googleSheets.columns;
    
    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        try {
            // Parse the trip days text format back into structured data
            const tripDays = parseTripDaysText(row[cols.tripDays] || '');
            
            // Extract route info from notes if present
            const notesText = row[cols.notes] || '';
            const { routeInfo, userNotes } = extractRouteInfoFromNotes(notesText);
            
            const quote = {
                id: i, // Use row index as ID
                submittedAt: row[cols.timestamp] || new Date().toISOString(),
                tripDays: tripDays,
                passengers: row[cols.passengers] || '',
                name: row[cols.name] || '',
                email: row[cols.email] || '',
                phone: row[cols.phone] || '',
                company: row[cols.company] || 'N/A',
                description: row[cols.description] || '',
                notes: userNotes,
                routeInfo: routeInfo
            };
            
            quotes.push(quote);
        } catch (error) {
            console.error(`Error parsing row ${i}:`, error);
            // Skip malformed rows
        }
    }
    
    return quotes;
}

/**
 * Parse trip days text format back into structured data
 * Input format: "Day 1: 2026-02-15 from 09:00 to 17:00\n  Pick-up: Address\n  Drop-off 1: Address"
 */
function parseTripDaysText(text) {
    if (!text || typeof text !== 'string') return [];
    
    const tripDays = [];
    const dayBlocks = text.split(/Day \d+:/g).filter(b => b.trim());
    
    for (const block of dayBlocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) continue;
        
        try {
            // Parse first line: "2026-02-15 from 09:00 to 17:00" or "2026-02-15 from 09:00 to 17:00 (overnight)"
            const firstLine = lines[0];
            const dateMatch = firstLine.match(/(\d{4}-\d{2}-\d{2})/);
            const timeMatch = firstLine.match(/from (\d{2}:\d{2}) to (\d{2}:\d{2})/);
            const overnightMatch = firstLine.includes('(overnight)');
            
            if (!dateMatch || !timeMatch) continue;
            
            const tripDay = {
                date: dateMatch[1],
                startTime: timeMatch[1],
                endTime: timeMatch[2],
                endsNextDay: overnightMatch,
                pickup: '',
                dropoffs: []
            };
            
            // Parse location lines
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('Pick-up:')) {
                    tripDay.pickup = line.replace('Pick-up:', '').trim();
                } else if (line.match(/Drop-off \d+:/)) {
                    const dropoff = line.replace(/Drop-off \d+:/, '').trim();
                    if (dropoff) tripDay.dropoffs.push(dropoff);
                }
            }
            
            if (tripDay.pickup && tripDay.dropoffs.length > 0) {
                tripDays.push(tripDay);
            }
        } catch (error) {
            console.error('Error parsing trip day block:', error);
        }
    }
    
    return tripDays;
}

/**
 * Extract route info from notes text
 * Notes contain both route info and user notes separated by "---\nUSER NOTES:"
 */
function extractRouteInfoFromNotes(notesText) {
    if (!notesText || !notesText.includes('ROUTE INFORMATION')) {
        return { routeInfo: null, userNotes: notesText };
    }
    
    try {
        const parts = notesText.split('---\nUSER NOTES:\n');
        const routeInfoText = parts[0];
        const userNotes = parts[1] || '';
        
        // Parse route information back into object format
        const routeInfo = parseRouteInfoText(routeInfoText);
        
        return { routeInfo, userNotes };
    } catch (error) {
        console.error('Error extracting route info:', error);
        return { routeInfo: null, userNotes: notesText };
    }
}

/**
 * Parse route information text back into object
 */
function parseRouteInfoText(text) {
    const routeInfo = {
        totals: {
            distance: 0,
            duration: 0,
            stops: 0,
            bookingHours: 0
        },
        tripDays: []
    };
    
    try {
        // Extract totals
        const distanceMatch = text.match(/Total Distance: ([\d.]+) miles/);
        const drivingTimeMatch = text.match(/Total Driving Time: (\d+)h (\d+)m/);
        const bookingHoursMatch = text.match(/Total Booking Hours: (\d+)h (\d+)m/);
        const stopsMatch = text.match(/Total Stops: (\d+)/);
        
        if (distanceMatch) {
            routeInfo.totals.distance = parseFloat(distanceMatch[1]) * METERS_PER_MILE;
        }
        if (drivingTimeMatch) {
            routeInfo.totals.duration = parseInt(drivingTimeMatch[1]) * 3600 + parseInt(drivingTimeMatch[2]) * 60;
        }
        if (bookingHoursMatch) {
            routeInfo.totals.bookingHours = parseInt(bookingHoursMatch[1]) * 60 + parseInt(bookingHoursMatch[2]);
        }
        if (stopsMatch) {
            routeInfo.totals.stops = parseInt(stopsMatch[1]);
        }
        
        // Parse individual days
        const dayMatches = text.matchAll(/Day (\d+) \(([^)]+)\):\s+Time: ([\d:]+) - ([\d:]+)([^)]*)\((\d+)h (\d+)m booking\)\s+Distance: ([\d.]+) miles\s+Driving Time: (\d+)h (\d+)m\s+Stops: (\d+)/g);
        
        for (const match of dayMatches) {
            const dayInfo = {
                dayNumber: parseInt(match[1]),
                date: match[2],
                startTime: match[3],
                endTime: match[4],
                endsNextDay: match[5].includes('(overnight)'),
                bookingHours: parseInt(match[6]),
                bookingMinutes: parseInt(match[7]),
                totals: {
                    distance: parseFloat(match[8]) * METERS_PER_MILE,
                    duration: parseInt(match[9]) * 3600 + parseInt(match[10]) * 60,
                    stops: parseInt(match[11]),
                    bookingMinutes: parseInt(match[6]) * 60 + parseInt(match[7])
                },
                legs: []
            };
            
            routeInfo.tripDays.push(dayInfo);
        }
    } catch (error) {
        console.error('Error parsing route info text:', error);
    }
    
    return routeInfo;
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
    const quote = loadedQuotes.find(q => q.id === quoteId);
    
    if (!quote) return;
    
    // Store current quote globally for email function
    window.currentQuote = quote;
    
    const modal = document.getElementById('quoteModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Quote Request - ${quote.name}`;
    
    // Build modal content
    let content = generateQuoteDetailHTML(quote);
    modalBody.innerHTML = content;
    
    modal.style.display = 'block';
    
    // Initialize maps for all trip days if Google Maps is available
    if (window.google && quote.tripDays && quote.tripDays.length > 0) {
        setTimeout(() => initializeQuoteMaps(quote), 100);
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
                <div id="mapContainer-day-${index}" class="map-container"></div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    // Notable Information
    html += generateNotableInfo(quote);
    
    // Quote Response Section
    html += generateQuoteResponseSection(quote);
    
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
 * Generate quote response section with email composer
 */
function generateQuoteResponseSection(quote) {
    const emailConfig = CONFIG.email || {};
    const fromEmail = emailConfig.fromEmail || 'your-business@example.com';
    const businessName = emailConfig.businessName || 'Bus Charter Services';
    
    // Generate trip summary for email
    const tripSummary = quote.tripDays.map((day, idx) => {
        const routeInfo = quote.routeInfo?.tripDays[idx];
        const distance = routeInfo ? (routeInfo.totals.distance / METERS_PER_MILE).toFixed(1) : 'N/A';
        const duration = routeInfo ? `${routeInfo.bookingHours}h ${routeInfo.bookingMinutes}m` : 'N/A';
        
        return `Day ${idx + 1}: ${day.date}
  Time: ${day.startTime} - ${day.endTime}${day.endsNextDay ? ' (overnight)' : ''}
  Distance: ${distance} miles
  Duration: ${duration}
  Pickup: ${day.pickup}
  Dropoffs: ${day.dropoffs.join(', ')}`;
    }).join('\n\n');
    
    const totalMiles = quote.routeInfo ? (quote.routeInfo.totals.distance / METERS_PER_MILE).toFixed(1) : 'N/A';
    const totalBookingHours = quote.routeInfo ? Math.floor(quote.routeInfo.totals.bookingHours / 60) : 'N/A';
    const totalBookingMinutes = quote.routeInfo ? quote.routeInfo.totals.bookingHours % 60 : 0;
    
    let html = `
        <div class="detail-section" style="border-top: 2px solid var(--border-color); padding-top: 30px; margin-top: 30px;">
            <h3>✉️ Send Quote Response</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
                Compose and send a quote response to ${quote.name} at ${quote.email}
            </p>
            
            <div style="background: var(--background); padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: var(--text-primary);">Quote Amount ($)</label>
                    <input type="number" id="quoteAmount" placeholder="e.g., 1500" 
                           style="width: 200px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 1rem;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: var(--text-primary);">Additional Details (optional)</label>
                    <textarea id="quoteDetails" rows="4" placeholder="Any additional information, terms, or conditions..."
                              style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.95rem; font-family: inherit; resize: vertical;"></textarea>
                </div>
                
                <button onclick="sendQuoteEmail()" 
                        style="background: var(--primary-color); color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    📧 Compose Email
                </button>
                
                <p style="margin-top: 12px; font-size: 0.85rem; color: var(--text-secondary);">
                    This will open your email client with a pre-filled message. You can edit before sending.
                </p>
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
 * Initialize Google Maps for all trip days
 */
function initializeQuoteMaps(quote) {
    if (!window.google) return;
    
    // Create a map for each trip day
    quote.tripDays.forEach((tripDay, index) => {
        const mapContainer = document.getElementById(`mapContainer-day-${index}`);
        if (!mapContainer) return;
        
        // Create map for this day
        const map = new google.maps.Map(mapContainer, {
            zoom: 10,
            mapTypeId: 'roadmap'
        });
        
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false
        });
        
        // Build waypoints from all dropoffs except the last one
        const waypoints = tripDay.dropoffs.slice(0, -1).map(location => ({
            location: location,
            stopover: true
        }));
        
        const request = {
            origin: tripDay.pickup,
            destination: tripDay.dropoffs[tripDay.dropoffs.length - 1],
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        directionsService.route(request, function(result, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
            } else {
                console.error(`Directions request failed for day ${index + 1}:`, status);
                // Fallback: show markers only
                showMarkersOnly(map, tripDay);
            }
        });
    });
}

/**
 * Show markers only (fallback if directions fail)
 */
function showMarkersOnly(map, tripDay) {
    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();
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

/**
 * Send quote email - opens email client with pre-filled content
 */
function sendQuoteEmail() {
    const quote = window.currentQuote;
    
    if (!quote) {
        alert('Error: Quote data not found. Please close and reopen the quote detail.');
        return;
    }
    
    const emailConfig = CONFIG.email || {};
    const fromEmail = emailConfig.fromEmail || 'your-business@example.com';
    const businessName = emailConfig.businessName || 'Bus Charter Services';
    const signature = emailConfig.templates?.signature || 'Best regards,\n' + businessName;
    const subjectTemplate = emailConfig.templates?.subject || 'Your Bus Charter Quote Request';
    const bccEmail = emailConfig.bccEmail || '';
    
    // Get values from form
    const quoteAmount = document.getElementById('quoteAmount')?.value || '';
    const quoteDetails = document.getElementById('quoteDetails')?.value || '';
    
    if (!quoteAmount) {
        alert('Please enter a quote amount before sending.');
        return;
    }
    
    // Build trip summary
    const tripSummary = quote.tripDays.map((day, idx) => {
        const routeInfo = quote.routeInfo?.tripDays[idx];
        const distance = routeInfo ? (routeInfo.totals.distance / METERS_PER_MILE).toFixed(1) : 'N/A';
        const duration = routeInfo ? `${routeInfo.bookingHours}h ${routeInfo.bookingMinutes}m` : 'N/A';
        
        return `Day ${idx + 1}: ${day.date}
  Time: ${day.startTime} - ${day.endTime}${day.endsNextDay ? ' (overnight)' : ''}
  Distance: ${distance} miles
  Duration: ${duration}
  Pickup: ${day.pickup}
  Dropoffs: ${day.dropoffs.join(', ')}`;
    }).join('\n\n');
    
    const totalMiles = quote.routeInfo ? (quote.routeInfo.totals.distance / METERS_PER_MILE).toFixed(1) : 'N/A';
    const totalBookingHours = quote.routeInfo ? Math.floor(quote.routeInfo.totals.bookingHours / 60) : 0;
    const totalBookingMinutes = quote.routeInfo ? quote.routeInfo.totals.bookingHours % 60 : 0;
    
    // Build email body
    const emailBody = `Dear ${quote.name},

Thank you for your bus charter quote request. We're pleased to provide you with the following quote:

QUOTE AMOUNT: $${quoteAmount}

TRIP SUMMARY:
${tripSummary}

TOTALS:
- Total Distance: ${totalMiles} miles
- Total Booking Time: ${totalBookingHours}h ${totalBookingMinutes}m
- Number of Passengers: ${quote.passengers}
- Trip Days: ${quote.tripDays.length}

${quoteDetails ? '\nADDITIONAL DETAILS:\n' + quoteDetails + '\n' : ''}
This quote is valid for 30 days. Please let us know if you have any questions or would like to proceed with booking.

${signature}`;
    
    // Build mailto link
    const subject = encodeURIComponent(subjectTemplate);
    const body = encodeURIComponent(emailBody);
    const to = encodeURIComponent(quote.email);
    const bcc = bccEmail ? `&bcc=${encodeURIComponent(bccEmail)}` : '';
    
    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}${bcc}`;
    
    // Open email client
    window.location.href = mailtoLink;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('quoteModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Make functions available globally
window.saveQuoteToAdmin = saveQuote;
window.sendQuoteEmail = sendQuoteEmail;
