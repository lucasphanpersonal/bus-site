// Test Data Generator for Bus Charter Quote System
// Generates realistic test data for development and testing

// Sample data pools for realistic generation
const SAMPLE_DATA = {
    firstNames: [
        'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
        'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
        'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
        'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley'
    ],
    
    lastNames: [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
        'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
        'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
    ],
    
    companies: [
        'Acme Corporation', 'Tech Solutions Inc', 'Global Enterprises', 'Summit Consulting',
        'Horizon Industries', 'Pinnacle Group', 'Metro Systems', 'Vista Technologies',
        'United Services', 'Premier Solutions', 'Elite Management', 'Nexus Corporation',
        'Fusion Dynamics', 'Phoenix Partners', 'Quantum Ventures', 'Stellar Holdings',
        'Trinity Group', 'Velocity Systems', 'Zenith Enterprises', 'Atlas Corporation'
    ],
    
    tripDescriptions: [
        'Corporate team building event',
        'Wedding transportation for guests',
        'School field trip to museum',
        'Church group outing',
        'Athletic team travel to tournament',
        'Conference attendee transportation',
        'Airport shuttle service',
        'Sightseeing tour',
        'Family reunion transportation',
        'Concert group transportation',
        'Casino trip for seniors',
        'College campus tour',
        'Employee shuttle service',
        'Wine tour group',
        'Sporting event transportation',
        'Theater group outing',
        'Community center event',
        'Business conference transportation',
        'Bachelor/bachelorette party',
        'Graduation ceremony transportation'
    ],
    
    specialNotes: [
        'Need wheelchair accessibility',
        'Luggage storage required',
        'WiFi preferred',
        'Restroom on bus required',
        'Multiple stops needed',
        'Elderly passengers - extra assistance needed',
        'Children on board - need seat belts',
        'Temperature control is important',
        'DVD player for entertainment',
        'Professional driver required',
        'On-time arrival critical',
        'Flexible schedule',
        'Budget-conscious',
        'Premium service requested',
        'Will need help with coordination'
    ],
    
    // US Cities with states for realistic locations
    cities: [
        { city: 'New York', state: 'NY' },
        { city: 'Los Angeles', state: 'CA' },
        { city: 'Chicago', state: 'IL' },
        { city: 'Houston', state: 'TX' },
        { city: 'Phoenix', state: 'AZ' },
        { city: 'Philadelphia', state: 'PA' },
        { city: 'San Antonio', state: 'TX' },
        { city: 'San Diego', state: 'CA' },
        { city: 'Dallas', state: 'TX' },
        { city: 'San Jose', state: 'CA' },
        { city: 'Austin', state: 'TX' },
        { city: 'Jacksonville', state: 'FL' },
        { city: 'San Francisco', state: 'CA' },
        { city: 'Columbus', state: 'OH' },
        { city: 'Indianapolis', state: 'IN' },
        { city: 'Seattle', state: 'WA' },
        { city: 'Denver', state: 'CO' },
        { city: 'Washington', state: 'DC' },
        { city: 'Boston', state: 'MA' },
        { city: 'Nashville', state: 'TN' }
    ],
    
    landmarks: [
        'Convention Center', 'Airport', 'Downtown Hotel', 'University Campus',
        'Sports Stadium', 'City Hall', 'Museum', 'Shopping Mall',
        'Conference Center', 'Park and Ride', 'Train Station', 'Hotel District',
        'Business Park', 'Resort', 'Theater District', 'Historic District'
    ]
};

// Global storage for generated data
let generatedQuotes = [];

/**
 * Generate a random quote ID matching the format: QUOTE-YYYYMMDD-XXXXX
 */
function generateQuoteId(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomCode = '';
    for (let i = 0; i < 5; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `QUOTE-${dateStr}-${randomCode}`;
}

/**
 * Get a random item from an array
 */
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random date within the specified range
 */
function randomDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + randomInt(1, daysFromNow));
    return date.toISOString().split('T')[0];
}

/**
 * Generate a random time in HH:MM format
 */
function randomTime() {
    const hour = randomInt(6, 22); // 6 AM to 10 PM
    const minute = randomItem(['00', '15', '30', '45']);
    return `${String(hour).padStart(2, '0')}:${minute}`;
}

/**
 * Generate a random phone number
 */
function randomPhone() {
    const area = randomInt(200, 999);
    const prefix = randomInt(200, 999);
    const line = randomInt(1000, 9999);
    return `(${area}) ${prefix}-${line}`;
}

/**
 * Generate a random email
 */
function generateEmail(firstName, lastName) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
    const formats = [
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        `${firstName.toLowerCase()}${randomInt(1, 99)}`
    ];
    return `${randomItem(formats)}@${randomItem(domains)}`;
}

/**
 * Generate a random location (city + landmark)
 */
function generateLocation() {
    const location = randomItem(SAMPLE_DATA.cities);
    const landmark = randomItem(SAMPLE_DATA.landmarks);
    return `${landmark}, ${location.city}, ${location.state}`;
}

/**
 * Generate a single trip day with realistic data
 */
function generateTripDay(dayNumber, baseDate, minDropoffs, maxDropoffs) {
    // For multi-day trips, increment the date
    const date = new Date(baseDate);
    date.setDate(date.getDate() + (dayNumber - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    const startTime = randomTime();
    const endTime = randomTime();
    const endsNextDay = Math.random() < 0.1; // 10% chance of overnight trip
    
    const pickup = generateLocation();
    const numDropoffs = randomInt(minDropoffs, maxDropoffs);
    const dropoffs = [];
    
    for (let i = 0; i < numDropoffs; i++) {
        dropoffs.push(generateLocation());
    }
    
    return {
        date: dateStr,
        startTime,
        endTime,
        endsNextDay,
        pickup,
        dropoffs
    };
}

/**
 * Generate a single quote with all required fields
 */
function generateQuote(config) {
    const firstName = randomItem(SAMPLE_DATA.firstNames);
    const lastName = randomItem(SAMPLE_DATA.lastNames);
    const fullName = `${firstName} ${lastName}`;
    const email = generateEmail(firstName, lastName);
    const phone = randomPhone();
    
    // 70% chance of having a company
    const company = Math.random() < 0.7 ? randomItem(SAMPLE_DATA.companies) : 'N/A';
    
    const numDays = randomInt(config.minDays, config.maxDays);
    const baseDate = randomDate(config.dateRange);
    const tripDays = [];
    
    for (let i = 1; i <= numDays; i++) {
        tripDays.push(generateTripDay(i, baseDate, config.minDropoffs, config.maxDropoffs));
    }
    
    const passengers = randomInt(10, 56); // Typical bus capacities
    const description = randomItem(SAMPLE_DATA.tripDescriptions);
    
    // 50% chance of having special notes
    const notes = Math.random() < 0.5 ? randomItem(SAMPLE_DATA.specialNotes) : 'N/A';
    
    // Generate a timestamp for this quote
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - randomInt(0, 30)); // Quotes from last 30 days
    
    return {
        quoteId: generateQuoteId(timestamp),
        timestamp: timestamp.toISOString(),
        tripDays,
        passengers,
        name: fullName,
        email,
        phone,
        company,
        description,
        notes
    };
}

/**
 * Main function to generate test data
 */
function generateTestData() {
    // Get configuration values
    const config = {
        numQuotes: parseInt(document.getElementById('numQuotes').value),
        minDays: parseInt(document.getElementById('minDays').value),
        maxDays: parseInt(document.getElementById('maxDays').value),
        minDropoffs: parseInt(document.getElementById('minDropoffs').value),
        maxDropoffs: parseInt(document.getElementById('maxDropoffs').value),
        dateRange: parseInt(document.getElementById('dateRange').value)
    };
    
    // Validate configuration
    if (config.minDays > config.maxDays) {
        alert('Minimum trip days cannot be greater than maximum trip days');
        return;
    }
    
    if (config.minDropoffs > config.maxDropoffs) {
        alert('Minimum dropoffs cannot be greater than maximum dropoffs');
        return;
    }
    
    // Generate quotes
    generatedQuotes = [];
    for (let i = 0; i < config.numQuotes; i++) {
        generatedQuotes.push(generateQuote(config));
    }
    
    // Display the generated data
    displayGeneratedData();
    updateStatistics();
}

/**
 * Display the generated data in JSON format
 */
function displayGeneratedData() {
    const output = document.getElementById('jsonOutput');
    output.textContent = JSON.stringify(generatedQuotes, null, 2);
    
    // Show stats display
    document.getElementById('statsDisplay').style.display = 'grid';
}

/**
 * Update statistics display
 */
function updateStatistics() {
    const totalTripDays = generatedQuotes.reduce((sum, quote) => sum + quote.tripDays.length, 0);
    const totalPassengers = generatedQuotes.reduce((sum, quote) => sum + quote.passengers, 0);
    
    document.getElementById('statQuotes').textContent = generatedQuotes.length;
    document.getElementById('statTripDays').textContent = totalTripDays;
    document.getElementById('statPassengers').textContent = totalPassengers.toLocaleString();
}

/**
 * Clear the output area
 */
function clearOutput() {
    document.getElementById('jsonOutput').textContent = 'Click "Generate Test Data" to create sample quote data';
    document.getElementById('statsDisplay').style.display = 'none';
    generatedQuotes = [];
}

/**
 * Copy JSON output to clipboard
 */
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('✓ Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Please select and copy manually.');
    });
}

/**
 * Download generated data as JSON file
 */
function downloadJSON() {
    if (generatedQuotes.length === 0) {
        alert('Please generate test data first');
        return;
    }
    
    const dataStr = JSON.stringify(generatedQuotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-quotes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Convert trip days array to CSV-friendly format
 */
function formatTripDaysForCSV(tripDays) {
    return tripDays.map((day, idx) => {
        const dropoffsText = day.dropoffs.join('; ');
        const overnightIndicator = day.endsNextDay ? ' (overnight)' : '';
        return `Day ${idx + 1}: ${day.date} from ${day.startTime} to ${day.endTime}${overnightIndicator} | Pickup: ${day.pickup} | Dropoffs: ${dropoffsText}`;
    }).join(' || ');
}

/**
 * Download generated data as CSV file
 */
function downloadCSV() {
    if (generatedQuotes.length === 0) {
        alert('Please generate test data first');
        return;
    }
    
    // CSV headers
    const headers = [
        'Quote ID',
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Company',
        'Passengers',
        'Trip Description',
        'Trip Days',
        'Special Notes'
    ];
    
    // Convert quotes to CSV rows
    const rows = generatedQuotes.map(quote => {
        return [
            quote.quoteId,
            quote.timestamp,
            quote.name,
            quote.email,
            quote.phone,
            quote.company,
            quote.passengers,
            quote.description,
            formatTripDaysForCSV(quote.tripDays),
            quote.notes
        ].map(field => {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            const fieldStr = String(field);
            if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
                return `"${fieldStr.replace(/"/g, '""')}"`;
            }
            return fieldStr;
        }).join(',');
    });
    
    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-quotes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
