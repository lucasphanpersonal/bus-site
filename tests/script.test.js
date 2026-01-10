/**
 * Unit Tests for script.js - Core Form Functionality
 * Tests all critical functions with edge cases
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load the script functions by evaluating the file
const fs = require('fs');
const path = require('path');

// Read and evaluate script.js in a way that exposes functions for testing
const scriptContent = fs.readFileSync(
    path.join(__dirname, '../script.js'),
    'utf8'
);

// Extract functions from script.js for testing
// We'll test by creating isolated function implementations

describe('generateQuoteId', () => {
    // Extract and test the generateQuoteId function
    const generateQuoteId = eval(`
        (function() {
            ${scriptContent.match(/function generateQuoteId\(\)[\s\S]*?^}/m)[0]}
            return generateQuoteId;
        })()
    `);

    test('should generate a quote ID with correct format', () => {
        const quoteId = generateQuoteId();
        expect(quoteId).toMatch(/^QUOTE-\d{8}-[A-Z0-9]{5}$/);
    });

    test('should include current date in YYYYMMDD format', () => {
        const quoteId = generateQuoteId();
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const expectedDate = `${year}${month}${day}`;
        
        expect(quoteId).toContain(expectedDate);
    });

    test('should generate unique IDs on multiple calls', () => {
        const ids = new Set();
        for (let i = 0; i < 100; i++) {
            ids.add(generateQuoteId());
        }
        expect(ids.size).toBe(100);
    });

    test('should only use uppercase alphanumeric characters in random code', () => {
        const quoteId = generateQuoteId();
        const randomPart = quoteId.split('-')[2];
        expect(randomPart).toMatch(/^[A-Z0-9]{5}$/);
    });
});

describe('calculateBookingHours', () => {
    const calculateBookingHours = eval(`
        (function() {
            ${scriptContent.match(/function calculateBookingHours\(startTime, endTime.*?\n\}/s)[0]}
            return calculateBookingHours;
        })()
    `);

    test('should calculate hours within same day correctly', () => {
        const result = calculateBookingHours('09:00', '17:00');
        expect(result.hours).toBe(8);
        expect(result.minutes).toBe(0);
        expect(result.totalMinutes).toBe(480);
    });

    test('should handle hours with minutes correctly', () => {
        const result = calculateBookingHours('09:30', '14:45');
        expect(result.hours).toBe(5);
        expect(result.minutes).toBe(15);
        expect(result.totalMinutes).toBe(315);
    });

    test('should handle overnight trips when endsNextDay is true', () => {
        const result = calculateBookingHours('22:00', '02:00', true);
        expect(result.hours).toBe(4);
        expect(result.minutes).toBe(0);
        expect(result.totalMinutes).toBe(240);
    });

    test('should handle midnight correctly', () => {
        const result = calculateBookingHours('00:00', '12:00');
        expect(result.hours).toBe(12);
        expect(result.minutes).toBe(0);
    });

    test('should handle same start and end time', () => {
        const result = calculateBookingHours('10:00', '10:00');
        expect(result.hours).toBe(0);
        expect(result.minutes).toBe(0);
    });

    test('should handle 15-minute intervals', () => {
        const result = calculateBookingHours('10:00', '10:15');
        expect(result.hours).toBe(0);
        expect(result.minutes).toBe(15);
    });

    test('should handle full day booking', () => {
        const result = calculateBookingHours('00:00', '23:59');
        expect(result.hours).toBe(23);
        expect(result.minutes).toBe(59);
    });

    test('should handle overnight automatically when end < start', () => {
        const result = calculateBookingHours('22:00', '02:00', false);
        // When endsNextDay is false but end < start, it adds 24 hours
        expect(result.hours).toBe(4);
        expect(result.minutes).toBe(0);
    });
    
    test('should return object with all properties', () => {
        const result = calculateBookingHours('10:00', '11:30');
        expect(result).toHaveProperty('hours');
        expect(result).toHaveProperty('minutes');
        expect(result).toHaveProperty('totalMinutes');
    });
});

describe('formatRouteInformation', () => {
    const formatRouteInformation = eval(`
        (function() {
            const METERS_PER_MILE = ${METERS_PER_MILE};
            ${scriptContent.match(/function formatRouteInformation\(routeInfo, passengers\)[\s\S]*?^}/m)[0]}
            return formatRouteInformation;
        })()
    `);

    test('should format single day trip correctly', () => {
        const routeInfo = {
            totals: {
                distance: 160934, // 100 miles in meters
                duration: 7200, // 2 hours in seconds
                bookingHours: 480, // 8 hours in minutes
                stops: 2
            },
            tripDays: [
                {
                    dayNumber: 1,
                    date: '2026-01-15',
                    startTime: '09:00',
                    endTime: '17:00',
                    bookingHours: 8,
                    bookingMinutes: 0,
                    endsNextDay: false,
                    totals: {
                        distance: 160934,
                        duration: 7200,
                        stops: 2
                    },
                    legs: [
                        { distance: { value: 80467 }, duration: { value: 3600 } },
                        { distance: { value: 80467 }, duration: { value: 3600 } }
                    ]
                }
            ]
        };
        const passengers = 30;
        
        const result = formatRouteInformation(routeInfo, passengers);
        
        expect(result).toContain('100.0 miles');
        expect(result).toContain('2h 0m');
        expect(result).toContain('8h 0m');
        expect(result).toContain('30');
        expect(result).toContain('2');
    });

    test('should handle multi-day trips', () => {
        const routeInfo = {
            totals: {
                distance: 321868, // 200 miles
                duration: 14400,
                bookingHours: 960, // 16 hours
                stops: 4
            },
            tripDays: [
                {
                    dayNumber: 1,
                    date: '2026-01-15',
                    startTime: '09:00',
                    endTime: '17:00',
                    bookingHours: 8,
                    bookingMinutes: 0,
                    endsNextDay: false,
                    totals: {
                        distance: 160934,
                        duration: 7200,
                        stops: 2
                    },
                    legs: []
                },
                {
                    dayNumber: 2,
                    date: '2026-01-16',
                    startTime: '09:00',
                    endTime: '17:00',
                    bookingHours: 8,
                    bookingMinutes: 0,
                    endsNextDay: false,
                    totals: {
                        distance: 160934,
                        duration: 7200,
                        stops: 2
                    },
                    legs: []
                }
            ]
        };
        const passengers = 45;
        
        const result = formatRouteInformation(routeInfo, passengers);
        
        expect(result).toContain('Day 1');
        expect(result).toContain('Day 2');
        expect(result).toContain('200.0 miles');
        expect(result).toContain('16h 0m');
    });

    test('should handle zero values gracefully', () => {
        const routeInfo = {
            totals: {
                distance: 0,
                duration: 0,
                bookingHours: 0,
                stops: 0
            },
            tripDays: []
        };
        const passengers = 0;
        
        const result = formatRouteInformation(routeInfo, passengers);
        
        expect(result).toContain('0.0 miles');
        expect(result).toContain('0');
    });

    test('should format duration correctly for hours and minutes', () => {
        const routeInfo = {
            totals: {
                distance: 241401, // 150 miles
                duration: 9000, // 2 hours 30 minutes
                bookingHours: 630, // 10.5 hours
                stops: 3
            },
            tripDays: []
        };
        const passengers = 25;
        
        const result = formatRouteInformation(routeInfo, passengers);
        
        expect(result).toContain('2h 30m');
    });

    test('should handle null routeInfo', () => {
        const result = formatRouteInformation(null, 25);
        expect(result).toBe('');
    });
    
    test('should handle overnight trips indicator', () => {
        const routeInfo = {
            totals: {
                distance: 160934,
                duration: 7200,
                bookingHours: 480,
                stops: 2
            },
            tripDays: [
                {
                    dayNumber: 1,
                    date: '2026-01-15',
                    startTime: '22:00',
                    endTime: '02:00',
                    bookingHours: 4,
                    bookingMinutes: 0,
                    endsNextDay: true,
                    totals: {
                        distance: 160934,
                        duration: 7200,
                        stops: 2
                    },
                    legs: []
                }
            ]
        };
        const passengers = 30;
        
        const result = formatRouteInformation(routeInfo, passengers);
        expect(result).toContain('overnight');
    });
});

describe('formatTripDaysForEmail', () => {
    const formatTripDaysForEmail = eval(`
        (function() {
            ${scriptContent.match(/function formatTripDaysForEmail\(tripDays\)[\s\S]*?^}/m)[0]}
            return formatTripDaysForEmail;
        })()
    `);

    test('should format single trip day correctly', () => {
        const tripDays = [
            {
                date: '2026-01-15',
                startTime: '09:00',
                endTime: '17:00',
                pickup: '123 Main St, City, State',
                dropoffs: ['456 Elm St, City, State'],
                endsNextDay: false
            }
        ];
        
        const result = formatTripDaysForEmail(tripDays);
        
        expect(result).toContain('2026-01-15');
        expect(result).toContain('09:00');
        expect(result).toContain('17:00');
        expect(result).toContain('123 Main St');
        expect(result).toContain('456 Elm St');
    });

    test('should format multiple trip days', () => {
        const tripDays = [
            {
                date: '2026-01-15',
                startTime: '09:00',
                endTime: '17:00',
                pickup: '123 Main St',
                dropoffs: ['456 Elm St'],
                endsNextDay: false
            },
            {
                date: '2026-01-16',
                startTime: '10:00',
                endTime: '18:00',
                pickup: '789 Oak Ave',
                dropoffs: ['321 Pine Rd'],
                endsNextDay: false
            }
        ];
        
        const result = formatTripDaysForEmail(tripDays);
        
        expect(result).toContain('Day 1');
        expect(result).toContain('Day 2');
        expect(result).toContain('2026-01-15');
        expect(result).toContain('2026-01-16');
    });

    test('should handle multiple dropoff locations', () => {
        const tripDays = [
            {
                date: '2026-01-15',
                startTime: '09:00',
                endTime: '17:00',
                pickup: '123 Main St',
                dropoffs: ['456 Elm St', '789 Oak Ave', '321 Pine Rd'],
                endsNextDay: false
            }
        ];
        
        const result = formatTripDaysForEmail(tripDays);
        
        expect(result).toContain('456 Elm St');
        expect(result).toContain('789 Oak Ave');
        expect(result).toContain('321 Pine Rd');
        expect(result).toContain('1. 456 Elm St');
        expect(result).toContain('2. 789 Oak Ave');
        expect(result).toContain('3. 321 Pine Rd');
    });

    test('should handle empty tripDays array', () => {
        const tripDays = [];
        
        const result = formatTripDaysForEmail(tripDays);
        
        expect(result).toBe('');
    });
    
    test('should indicate overnight trips', () => {
        const tripDays = [
            {
                date: '2026-01-15',
                startTime: '22:00',
                endTime: '02:00',
                pickup: '123 Main St',
                dropoffs: ['456 Elm St'],
                endsNextDay: true
            }
        ];
        
        const result = formatTripDaysForEmail(tripDays);
        
        expect(result).toContain('overnight');
    });
    
    test('should format pickup and dropoff locations clearly', () => {
        const tripDays = [
            {
                date: '2026-01-15',
                startTime: '09:00',
                endTime: '17:00',
                pickup: '123 Main St',
                dropoffs: ['456 Elm St'],
                endsNextDay: false
            }
        ];
        
        const result = formatTripDaysForEmail(tripDays);
        
        expect(result).toContain('Pick-up:');
        expect(result).toContain('Drop-offs:');
    });
});

describe('validateFormData', () => {
    const validateFormData = eval(`
        (function() {
            ${scriptContent.match(/function validateFormData\(formData\)[\s\S]*?^}/m)[0]}
            return validateFormData;
        })()
    `);

    test('should validate complete and correct form data', () => {
        const formData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [
                {
                    date: '2026-01-15',
                    startTime: '09:00',
                    endTime: '17:00',
                    pickup: '123 Main St',
                    dropoffs: ['456 Elm St']
                }
            ],
            passengers: 30,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            company: 'Test Company',
            description: 'Test trip'
        };

        const result = validateFormData(formData);
        expect(result).toBe(true);
    });

    test('should catch missing required fields', () => {
        const formData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [],
            passengers: 0,
            name: '',
            email: '',
            phone: '',
            company: '',
            description: ''
        };

        const result = validateFormData(formData);
        expect(result).toBe(false);
    });

    test('should validate email format', () => {
        const formData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [
                {
                    date: '2026-01-15',
                    startTime: '09:00',
                    endTime: '17:00',
                    pickup: '123 Main St',
                    dropoffs: ['456 Elm St']
                }
            ],
            passengers: 30,
            name: 'John Doe',
            email: 'invalid-email',
            phone: '555-1234',
            company: 'Test Company',
            description: 'Test trip'
        };

        const result = validateFormData(formData);
        expect(result).toBe(false);
    });

    test('should validate passengers is positive', () => {
        const formData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [
                {
                    date: '2026-01-15',
                    startTime: '09:00',
                    endTime: '17:00',
                    pickup: '123 Main St',
                    dropoffs: ['456 Elm St']
                }
            ],
            passengers: -5,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            company: 'Test Company',
            description: 'Test trip'
        };

        const result = validateFormData(formData);
        expect(result).toBe(false);
    });

    test('should validate trip days have required fields', () => {
        const formData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [
                {
                    date: '',
                    startTime: '',
                    endTime: '',
                    pickup: '',
                    dropoffs: []
                }
            ],
            passengers: 30,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            company: 'Test Company',
            description: 'Test trip'
        };

        const result = validateFormData(formData);
        expect(result).toBe(false);
    });
    
    test('should require at least one trip day', () => {
        const formData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [],
            passengers: 30,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            company: 'Test Company',
            description: 'Test trip'
        };

        const result = validateFormData(formData);
        expect(result).toBe(false);
    });
    
    test('should validate multiple email formats', () => {
        const validFormData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [{
                date: '2026-01-15',
                startTime: '09:00',
                endTime: '17:00',
                pickup: '123 Main St',
                dropoffs: ['456 Elm St']
            }],
            passengers: 30,
            name: 'John Doe',
            phone: '555-1234',
            company: 'Test Company',
            description: 'Test trip'
        };

        // Valid emails
        expect(validateFormData({...validFormData, email: 'test@example.com'})).toBe(true);
        expect(validateFormData({...validFormData, email: 'user.name@example.co.uk'})).toBe(true);
        expect(validateFormData({...validFormData, email: 'user+tag@domain.com'})).toBe(true);

        // Invalid emails
        expect(validateFormData({...validFormData, email: 'notanemail'})).toBe(false);
        expect(validateFormData({...validFormData, email: '@example.com'})).toBe(false);
        expect(validateFormData({...validFormData, email: 'user@'})).toBe(false);
        expect(validateFormData({...validFormData, email: 'user @example.com'})).toBe(false);
    });
});
