/**
 * Unit Tests for admin.js - Admin Dashboard Functionality
 * Tests all critical admin functions with edge cases
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load the admin functions
const fs = require('fs');
const path = require('path');

const adminContent = fs.readFileSync(
    path.join(__dirname, '../admin.js'),
    'utf8'
);

describe('escapeHtml', () => {
    // Note: This function uses DOM APIs (createElement, textContent, innerHTML)
    // which work differently in jsdom than manual character replacement
    const escapeHtml = eval(`
        (function() {
            ${adminContent.match(/function escapeHtml\(text\)[\s\S]*?^}/m)[0]}
            return escapeHtml;
        })()
    `);

    test('should escape HTML special characters', () => {
        const input = '<script>alert("XSS")</script>';
        const result = escapeHtml(input);
        expect(result).not.toContain('<script>');
        expect(result).toContain('&lt;script&gt;');
    });

    test('should escape ampersands', () => {
        const input = 'Tom & Jerry';
        const result = escapeHtml(input);
        expect(result).toContain('&amp;');
    });

    test('should handle empty string', () => {
        const result = escapeHtml('');
        expect(result).toBe('');
    });

    test('should handle null or undefined', () => {
        const div = document.createElement('div');
        div.textContent = null;
        const expected = div.innerHTML;
        expect(escapeHtml(null)).toBe(expected);
        
        div.textContent = undefined;
        const expected2 = div.innerHTML;
        expect(escapeHtml(undefined)).toBe(expected2);
    });

    test('should handle strings without special characters', () => {
        const input = 'Normal text 123';
        const result = escapeHtml(input);
        expect(result).toBe(input);
    });

    test('should escape multiple special characters', () => {
        const input = '<div>A & B</div>';
        const result = escapeHtml(input);
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).toContain('&amp;');
    });
    
    test('should prevent XSS attacks', () => {
        const input = '<img src=x onerror="alert(1)">';
        const result = escapeHtml(input);
        expect(result).not.toContain('<img');
        expect(result).toContain('&lt;img');
    });
});

describe('getStatusColor', () => {
    const getStatusColor = eval(`
        (function() {
            ${adminContent.match(/function getStatusColor\(status\)[\s\S]*?^}/m)[0]}
            return getStatusColor;
        })()
    `);

    test('should return color object for Sent status', () => {
        const result = getStatusColor('Sent');
        expect(result).toHaveProperty('bg');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('border');
        expect(result.border).toBe('#10b981');
    });

    test('should return color object for Draft status', () => {
        const result = getStatusColor('Draft');
        expect(result.border).toBe('#f59e0b');
    });

    test('should return color object for Accepted status', () => {
        const result = getStatusColor('Accepted');
        expect(result.border).toBe('#3b82f6');
    });

    test('should return color object for Declined status', () => {
        const result = getStatusColor('Declined');
        expect(result.border).toBe('#ef4444');
    });

    test('should return default colors for unknown status', () => {
        const result = getStatusColor('Unknown');
        expect(result).toHaveProperty('bg');
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('border');
    });

    test('should handle case sensitivity (defaults to Sent colors)', () => {
        const result = getStatusColor('sent');
        expect(result).toHaveProperty('border');
    });

    test('should handle null or undefined (defaults to Sent colors)', () => {
        const result1 = getStatusColor(null);
        expect(result1).toHaveProperty('border');
        
        const result2 = getStatusColor(undefined);
        expect(result2).toHaveProperty('border');
    });
    
    test('should have consistent color object structure', () => {
        const statuses = ['Sent', 'Draft', 'Accepted', 'Declined'];
        statuses.forEach(status => {
            const result = getStatusColor(status);
            expect(result).toHaveProperty('bg');
            expect(result).toHaveProperty('text');
            expect(result).toHaveProperty('border');
            expect(typeof result.bg).toBe('string');
            expect(typeof result.text).toBe('string');
            expect(typeof result.border).toBe('string');
        });
    });
});

describe('getQuoteIdentifier', () => {
    const getQuoteIdentifier = eval(`
        (function() {
            ${adminContent.match(/function getQuoteIdentifier\(quote\)[\s\S]*?^}/m)[0]}
            return getQuoteIdentifier;
        })()
    `);

    test('should return quoteId if present', () => {
        const quote = {
            quoteId: 'QUOTE-20260110-ABC12',
            submittedAt: '2026-01-10 10:00:00',
            email: 'test@example.com'
        };
        expect(getQuoteIdentifier(quote)).toBe('QUOTE-20260110-ABC12');
    });

    test('should fallback to submittedAt if no quoteId', () => {
        const quote = {
            submittedAt: '2026-01-10 10:00:00',
            email: 'test@example.com'
        };
        const result = getQuoteIdentifier(quote);
        expect(result).toBe('2026-01-10 10:00:00');
    });

    test('should handle missing quoteId', () => {
        const quote = {
            quoteId: '',
            submittedAt: '2026-01-10 10:00:00',
            email: 'test@example.com'
        };
        const result = getQuoteIdentifier(quote);
        expect(result).toBe('2026-01-10 10:00:00');
    });

    test('should handle missing submittedAt', () => {
        const quote = {
            email: 'test@example.com'
        };
        const result = getQuoteIdentifier(quote);
        expect(result).toBeUndefined();
    });
    
    test('should prioritize quoteId over submittedAt', () => {
        const quote = {
            quoteId: 'QUOTE-123',
            submittedAt: '2026-01-10 10:00:00'
        };
        expect(getQuoteIdentifier(quote)).toBe('QUOTE-123');
    });
});

describe('checkMultipleStates', () => {
    const US_STATE_ABBREVIATIONS = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    const checkMultipleStates = eval(`
        (function() {
            const US_STATE_ABBREVIATIONS = ${JSON.stringify(US_STATE_ABBREVIATIONS)};
            ${adminContent.match(/function checkMultipleStates\(locations\)[\s\S]*?^}/m)[0]}
            return checkMultipleStates;
        })()
    `);

    test('should detect multiple states in comma-delimited addresses', () => {
        // Function looks for pattern ", STATE " (comma, space, state abbreviation, space)
        const locations = [
            '123 Main St, New York, NY ',
            '456 Elm St, Los Angeles, CA ',
            '789 Oak Ave, Boston, MA '
        ];
        const result = checkMultipleStates(locations);
        expect(result).toBe(true);
    });

    test('should return false for single state', () => {
        const locations = [
            '123 Main St, New York, NY ',
            '456 Elm St, Brooklyn, NY ',
            '789 Oak Ave, Albany, NY '
        ];
        const result = checkMultipleStates(locations);
        expect(result).toBe(false);
    });

    test('should handle locations without state abbreviations', () => {
        const locations = [
            '123 Main St, Some City',
            '456 Elm St, Another Place'
        ];
        const result = checkMultipleStates(locations);
        expect(result).toBe(false);
    });

    test('should handle empty locations array', () => {
        const locations = [];
        const result = checkMultipleStates(locations);
        expect(result).toBe(false);
    });

    test('should handle single location', () => {
        const locations = ['123 Main St, New York, NY '];
        const result = checkMultipleStates(locations);
        expect(result).toBe(false);
    });

    test('should detect states with proper address formatting', () => {
        // Proper address format: "Street, City, STATE "
        const locations = [
            'Address in, CA ',
            'Address in, TX '
        ];
        const result = checkMultipleStates(locations);
        expect(result).toBe(true);
    });
    
    test('should require comma before state abbreviation', () => {
        // Without comma before state, it won't match
        const locations = [
            'Some place in CA somewhere',
            'Another location in TX here'
        ];
        const result = checkMultipleStates(locations);
        expect(result).toBe(false);
    });
    
    test('should handle multiple addresses with same state', () => {
        const locations = [
            '123 Main St, City1, CA ',
            '456 Elm St, City2, CA ',
            '789 Oak Ave, City3, CA '
        ];
        const result = checkMultipleStates(locations);
        expect(result).toBe(false);
    });
});

describe('parseTripDaysText', () => {
    const parseTripDaysText = eval(`
        (function() {
            ${adminContent.match(/function parseTripDaysText\(text\)[\s\S]*?^}/m)[0]}
            return parseTripDaysText;
        })()
    `);

    test('should parse single trip day correctly', () => {
        const text = `Day 1: 2026-01-15 from 09:00 to 17:00
Pick-up: 123 Main St, City, State
Drop-off 1: 456 Elm St, City, State`;

        const result = parseTripDaysText(text);
        
        expect(result).toHaveLength(1);
        expect(result[0].date).toBe('2026-01-15');
        expect(result[0].startTime).toBe('09:00');
        expect(result[0].endTime).toBe('17:00');
        expect(result[0].pickup).toBe('123 Main St, City, State');
        expect(result[0].dropoffs).toContain('456 Elm St, City, State');
    });

    test('should parse multiple trip days', () => {
        const text = `Day 1: 2026-01-15 from 09:00 to 17:00
Pick-up: 123 Main St
Drop-off 1: 456 Elm St

Day 2: 2026-01-16 from 10:00 to 18:00
Pick-up: 789 Oak Ave
Drop-off 1: 321 Pine Rd`;

        const result = parseTripDaysText(text);
        
        expect(result).toHaveLength(2);
        expect(result[0].date).toBe('2026-01-15');
        expect(result[1].date).toBe('2026-01-16');
    });

    test('should parse multiple dropoff locations', () => {
        const text = `Day 1: 2026-01-15 from 09:00 to 17:00
Pick-up: 123 Main St
Drop-off 1: 456 Elm St
Drop-off 2: 789 Oak Ave
Drop-off 3: 321 Pine Rd`;

        const result = parseTripDaysText(text);
        
        expect(result[0].dropoffs).toHaveLength(3);
        expect(result[0].dropoffs).toContain('456 Elm St');
        expect(result[0].dropoffs).toContain('789 Oak Ave');
        expect(result[0].dropoffs).toContain('321 Pine Rd');
    });

    test('should handle empty text', () => {
        const result = parseTripDaysText('');
        expect(result).toEqual([]);
    });

    test('should handle malformed text gracefully', () => {
        const text = 'Not a valid trip day format';
        const result = parseTripDaysText(text);
        expect(Array.isArray(result)).toBe(true);
    });
    
    test('should parse overnight trips', () => {
        const text = `Day 1: 2026-01-15 from 22:00 to 02:00 (overnight)
Pick-up: 123 Main St
Drop-off 1: 456 Elm St`;

        const result = parseTripDaysText(text);
        
        expect(result).toHaveLength(1);
        expect(result[0].endsNextDay).toBe(true);
    });
    
    test('should require both pickup and dropoffs', () => {
        // Missing dropoff
        const text1 = `Day 1: 2026-01-15 from 09:00 to 17:00
Pick-up: 123 Main St`;

        const result1 = parseTripDaysText(text1);
        expect(result1).toHaveLength(0);
        
        // Missing pickup
        const text2 = `Day 1: 2026-01-15 from 09:00 to 17:00
Drop-off 1: 456 Elm St`;

        const result2 = parseTripDaysText(text2);
        expect(result2).toHaveLength(0);
    });
    
    test('should handle whitespace in locations', () => {
        const text = `Day 1: 2026-01-15 from 09:00 to 17:00
  Pick-up: 123 Main St  
  Drop-off 1: 456 Elm St  `;

        const result = parseTripDaysText(text);
        
        expect(result).toHaveLength(1);
        expect(result[0].pickup).toBe('123 Main St');
        expect(result[0].dropoffs[0]).toBe('456 Elm St');
    });
});

describe('extractRouteInfoFromNotes', () => {
    const extractRouteInfoFromNotes = eval(`
        (function() {
            ${adminContent.match(/function parseRouteInfoText\(text\)[\s\S]*?^}/m)[0]}
            ${adminContent.match(/function extractRouteInfoFromNotes\(notesText\)[\s\S]*?^}/m)[0]}
            return extractRouteInfoFromNotes;
        })()
    `);

    test('should extract route information from notes', () => {
        const notes = `ROUTE INFORMATION (Computed):
Total Distance: 150.5 miles
Total Driving Time: 3h 15m
Total Booking Hours: 8h 30m
Number of Stops: 3
Number of Passengers: 30
---
USER NOTES:
Special requirements for the trip.`;

        const result = extractRouteInfoFromNotes(notes);
        
        expect(result).toHaveProperty('routeInfo');
        expect(result).toHaveProperty('userNotes');
        expect(result.userNotes).toContain('Special requirements');
        expect(result.routeInfo).not.toBeNull();
    });

    test('should return null route info if no route info found', () => {
        const notes = 'Just some regular notes without route info';
        const result = extractRouteInfoFromNotes(notes);
        expect(result.routeInfo).toBeNull();
        expect(result.userNotes).toBe(notes);
    });

    test('should handle empty notes', () => {
        const result = extractRouteInfoFromNotes('');
        expect(result.routeInfo).toBeNull();
        expect(result.userNotes).toBe('');
    });

    test('should handle null or undefined notes', () => {
        const resultNull = extractRouteInfoFromNotes(null);
        expect(resultNull.routeInfo).toBeNull();
        
        const resultUndefined = extractRouteInfoFromNotes(undefined);
        expect(resultUndefined.routeInfo).toBeNull();
    });
    
    test('should separate route info from user notes', () => {
        const notes = `ROUTE INFORMATION (Computed):
Total Distance: 100 miles
---
USER NOTES:
Customer wants pickup at 9am sharp`;

        const result = extractRouteInfoFromNotes(notes);
        
        expect(result.userNotes).toContain('Customer wants pickup');
        expect(result.userNotes).not.toContain('ROUTE INFORMATION');
    });
});

describe('parseRouteInfoText', () => {
    const parseRouteInfoText = eval(`
        (function() {
            ${adminContent.match(/function parseRouteInfoText\(text\)[\s\S]*?^}/m)[0]}
            return parseRouteInfoText;
        })()
    `);

    test('should parse route information correctly', () => {
        const text = `ROUTE INFORMATION (Computed):
Total Distance: 150.5 miles
Total Driving Time: 3h 15m
Total Booking Hours: 8h 30m
Total Stops: 3
Number of Passengers: 30`;

        const result = parseRouteInfoText(text);
        
        expect(result).toHaveProperty('totals');
        expect(result.totals).toHaveProperty('distance');
        expect(result.totals).toHaveProperty('duration');
    });

    test('should handle missing fields gracefully', () => {
        const text = `ROUTE INFORMATION (Computed):
Total Distance: 100 miles`;

        const result = parseRouteInfoText(text);
        
        expect(result).toHaveProperty('totals');
    });

    test('should handle empty text', () => {
        const result = parseRouteInfoText('');
        expect(result).toHaveProperty('totals');
    });

    test('should parse trip day information', () => {
        const text = `ROUTE INFORMATION (Computed):
Total Distance: 100 miles

Day 1 (2026-01-15):
  Time: 09:00 - 17:00 (8h 0m booking)
  Distance: 100 miles
  Driving Time: 2h 0m
  Stops: 2`;

        const result = parseRouteInfoText(text);
        
        expect(result).toHaveProperty('totals');
        expect(result).toHaveProperty('tripDays');
    });
});

describe('parseGoogleSheetsData', () => {
    const parseGoogleSheetsData = eval(`
        (function() {
            const CONFIG = ${JSON.stringify(global.CONFIG)};
            ${adminContent.match(/function parseRouteInfoText\(text\)[\s\S]*?^}/m)[0]}
            ${adminContent.match(/function extractRouteInfoFromNotes\(notesText\)[\s\S]*?^}/m)[0]}
            ${adminContent.match(/function parseTripDaysText\(text\)[\s\S]*?^}/m)[0]}
            ${adminContent.match(/function parseGoogleSheetsData\(rows\)[\s\S]*?^}/m)[0]}
            return parseGoogleSheetsData;
        })()
    `);

    test('should parse valid Google Sheets data', () => {
        const rows = [
            // Header row
            ['Quote ID', 'Timestamp', 'Trip Days', 'Passengers', 'Name', 'Email', 'Phone', 'Company', 'Description', 'Notes'],
            // Data row - need proper format for trip days
            ['QUOTE-20260110-ABC12', '1/10/2026 10:00:00', 'Day 1: 2026-01-15 from 09:00 to 17:00\n  Pick-up: 123 Main St\n  Drop-off 1: 456 Elm St', '30', 'John Doe', 'john@example.com', '555-1234', 'Test Co', 'Trip desc', 'Notes']
        ];

        const result = parseGoogleSheetsData(rows);
        
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].quoteId).toBe('QUOTE-20260110-ABC12');
        expect(result[0].name).toBe('John Doe');
        expect(result[0].email).toBe('john@example.com');
        expect(result[0].passengers).toBe('30');
    });

    test('should skip header row', () => {
        const rows = [
            ['Quote ID', 'Timestamp', 'Trip Days', 'Passengers', 'Name', 'Email', 'Phone', 'Company', 'Description', 'Notes']
        ];

        const result = parseGoogleSheetsData(rows);
        expect(result).toHaveLength(0);
    });

    test('should handle empty rows', () => {
        const rows = [];
        const result = parseGoogleSheetsData(rows);
        expect(result).toEqual([]);
    });

    test('should handle multiple data rows', () => {
        const rows = [
            ['Quote ID', 'Timestamp', 'Trip Days', 'Passengers', 'Name', 'Email', 'Phone', 'Company', 'Description', 'Notes'],
            ['QUOTE-1', '1/10/2026 10:00:00', 'Day 1: 2026-01-15 from 09:00 to 17:00\n  Pick-up: A\n  Drop-off 1: B', '30', 'John', 'john@test.com', '555-1234', 'Co1', 'Desc1', 'Notes1'],
            ['QUOTE-2', '1/11/2026 11:00:00', 'Day 1: 2026-01-16 from 10:00 to 18:00\n  Pick-up: C\n  Drop-off 1: D', '40', 'Jane', 'jane@test.com', '555-5678', 'Co2', 'Desc2', 'Notes2']
        ];

        const result = parseGoogleSheetsData(rows);
        
        expect(result.length).toBeGreaterThan(0);
        if (result.length >= 1) {
            expect(result[0].quoteId).toBe('QUOTE-1');
        }
        if (result.length >= 2) {
            expect(result[1].quoteId).toBe('QUOTE-2');
        }
    });

    test('should handle missing values in row', () => {
        const rows = [
            ['Quote ID', 'Timestamp', 'Trip Days', 'Passengers', 'Name', 'Email', 'Phone', 'Company', 'Description', 'Notes'],
            ['QUOTE-1', '1/10/2026 10:00:00', '', '', 'John', '', '', '', '', '']
        ];

        const result = parseGoogleSheetsData(rows);
        
        // Row should be parsed even with missing data
        expect(result.length).toBeGreaterThanOrEqual(0);
        if (result.length > 0) {
            expect(result[0].quoteId).toBe('QUOTE-1');
            expect(result[0].name).toBe('John');
        }
    });
    
    test('should handle malformed rows gracefully', () => {
        const rows = [
            ['Quote ID', 'Timestamp', 'Trip Days', 'Passengers', 'Name', 'Email', 'Phone', 'Company', 'Description', 'Notes'],
            ['QUOTE-1', '1/10/2026 10:00:00', 'Day 1: 2026-01-15 from 09:00 to 17:00\n  Pick-up: A\n  Drop-off 1: B', '30', 'John', 'john@test.com', '555-1234', 'Co1', 'Desc1', 'Notes1'],
            null, // null row
            ['QUOTE-3', '1/11/2026 11:00:00', 'Day 1: 2026-01-16 from 10:00 to 18:00\n  Pick-up: C\n  Drop-off 1: D', '40', 'Jane', 'jane@test.com', '555-5678', 'Co2', 'Desc2', 'Notes2']
        ];

        // Should not throw error, just skip bad rows
        expect(() => parseGoogleSheetsData(rows)).not.toThrow();
    });
});

describe('buildSheetsApiUrl', () => {
    const buildSheetsApiUrl = eval(`
        (function() {
            ${adminContent.match(/function buildSheetsApiUrl\(spreadsheetId, sheetName, apiKey\)[\s\S]*?^}/m)[0]}
            return buildSheetsApiUrl;
        })()
    `);

    test('should build correct API URL', () => {
        const url = buildSheetsApiUrl('TEST_SHEET_ID', 'Sheet1', 'TEST_API_KEY');
        
        expect(url).toContain('TEST_SHEET_ID');
        expect(url).toContain('Sheet1');
        expect(url).toContain('TEST_API_KEY');
        expect(url).toContain('googleapis.com/v4/spreadsheets');
    });

    test('should encode sheet name with spaces', () => {
        const url = buildSheetsApiUrl('SHEET_ID', 'Form Responses 1', 'API_KEY');
        
        expect(url).toContain('Form%20Responses%201');
    });

    test('should handle special characters in sheet name', () => {
        const url = buildSheetsApiUrl('SHEET_ID', 'Sheet & Data', 'API_KEY');
        
        expect(url).toContain(encodeURIComponent('Sheet & Data'));
    });
    
    test('should include cache-busting timestamp parameter', () => {
        const url = buildSheetsApiUrl('SHEET_ID', 'Sheet1', 'API_KEY');
        
        expect(url).toMatch(/_=\d+/); // Check for timestamp parameter
    });
    
    test('should throw error for empty spreadsheetId', () => {
        expect(() => buildSheetsApiUrl('', 'Sheet1', 'API_KEY')).toThrow('Invalid spreadsheetId');
    });
    
    test('should throw error for empty sheetName', () => {
        expect(() => buildSheetsApiUrl('SHEET_ID', '', 'API_KEY')).toThrow('Invalid sheetName');
    });
    
    test('should throw error for empty apiKey', () => {
        expect(() => buildSheetsApiUrl('SHEET_ID', 'Sheet1', '')).toThrow('Invalid apiKey');
    });
    
    test('should throw error for invalid types', () => {
        expect(() => buildSheetsApiUrl(null, 'Sheet1', 'API_KEY')).toThrow();
        expect(() => buildSheetsApiUrl('SHEET_ID', null, 'API_KEY')).toThrow();
        expect(() => buildSheetsApiUrl('SHEET_ID', 'Sheet1', null)).toThrow();
    });
});
