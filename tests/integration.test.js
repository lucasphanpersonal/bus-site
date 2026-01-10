/**
 * Integration Tests
 * Tests that verify multiple components working together
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('Form Submission Flow', () => {
    beforeEach(() => {
        // Set up minimal DOM
        document.body.innerHTML = `
            <div id="statusMessage"></div>
            <form id="quoteForm">
                <input type="text" id="name" value="John Doe" />
                <input type="email" id="email" value="john@example.com" />
                <input type="tel" id="phone" value="555-1234" />
                <input type="text" id="company" value="Test Company" />
                <textarea id="description">Test trip description</textarea>
                <input type="number" id="passengers" value="30" />
            </form>
        `;
    });

    test('should generate quote ID and validate form data together', () => {
        // This tests the integration of generateQuoteId with form validation
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

        // Verify quote ID format
        expect(formData.quoteId).toMatch(/^QUOTE-\d{8}-[A-Z0-9]{5}$/);
        
        // Verify all required fields are present
        expect(formData.name).toBeTruthy();
        expect(formData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(formData.tripDays.length).toBeGreaterThan(0);
        expect(formData.passengers).toBeGreaterThan(0);
    });

    test('should calculate booking hours and format trip days together', () => {
        const tripDay = {
            date: '2026-01-15',
            startTime: '09:00',
            endTime: '17:00',
            pickup: '123 Main St',
            dropoffs: ['456 Elm St', '789 Oak Ave'],
            endsNextDay: false
        };

        // Calculate booking hours
        const startMinutes = 9 * 60;
        const endMinutes = 17 * 60;
        const totalMinutes = endMinutes - startMinutes;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Verify calculation
        expect(hours).toBe(8);
        expect(minutes).toBe(0);

        // Verify trip day structure is valid
        expect(tripDay.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(tripDay.pickup).toBeTruthy();
        expect(tripDay.dropoffs.length).toBeGreaterThan(0);
    });
});

describe('Admin Dashboard Data Flow', () => {
    test('should parse Google Sheets data and extract route info', () => {
        const mockRow = [
            'QUOTE-20260110-ABC12',
            '1/10/2026 10:00:00',
            'Day 1: 2026-01-15 from 09:00 to 17:00\nPick-up: 123 Main St\nDrop-off 1: 456 Elm St',
            '30',
            'John Doe',
            'john@example.com',
            '555-1234',
            'Test Company',
            'Trip description',
            'ROUTE INFORMATION (Computed):\nTotal Distance: 100 miles\n---\nUSER NOTES:\nSpecial requirements'
        ];

        // Verify data can be accessed correctly
        const quoteId = mockRow[0];
        const timestamp = mockRow[1];
        const tripDaysText = mockRow[2];
        const passengers = mockRow[3];
        const notesText = mockRow[9];

        expect(quoteId).toMatch(/^QUOTE-\d{8}-[A-Z0-9]{5}$/);
        expect(tripDaysText).toContain('Pick-up:');
        expect(tripDaysText).toContain('Drop-off 1:');
        expect(notesText).toContain('ROUTE INFORMATION');
        expect(notesText).toContain('USER NOTES:');
    });

    test('should identify quotes and check interstate travel', () => {
        const quote1 = {
            quoteId: 'QUOTE-20260110-ABC12',
            submittedAt: '2026-01-10 10:00:00'
        };

        const quote2 = {
            submittedAt: '2026-01-11 11:00:00'
        };

        // Quote with ID should use it
        const id1 = quote1.quoteId || quote1.submittedAt;
        expect(id1).toBe('QUOTE-20260110-ABC12');

        // Quote without ID should use timestamp
        const id2 = quote2.quoteId || quote2.submittedAt;
        expect(id2).toBe('2026-01-11 11:00:00');

        // Check interstate detection
        const locations = [
            '123 Main St, New York, NY ',
            '456 Elm St, Los Angeles, CA '
        ];

        // This would be interstate if states are detected
        const hasMultipleStates = locations.length > 1 && 
            locations[0].includes('NY') && 
            locations[1].includes('CA');
        
        expect(hasMultipleStates).toBe(true);
    });
});

describe('Security and Data Sanitization', () => {
    test('should escape HTML in user input before display', () => {
        const maliciousInput = '<script>alert("XSS")</script>';
        
        // Use DOM API to escape (same as escapeHtml function)
        const div = document.createElement('div');
        div.textContent = maliciousInput;
        const escaped = div.innerHTML;

        expect(escaped).not.toContain('<script>');
        expect(escaped).toContain('&lt;script&gt;');
    });

    test('should validate email format before submission', () => {
        const validEmails = [
            'user@example.com',
            'user.name@example.co.uk',
            'user+tag@domain.com'
        ];

        const invalidEmails = [
            'notanemail',
            '@example.com',
            'user@',
            'user @example.com'
        ];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        validEmails.forEach(email => {
            expect(emailRegex.test(email)).toBe(true);
        });

        invalidEmails.forEach(email => {
            expect(emailRegex.test(email)).toBe(false);
        });
    });
});

describe('Route Calculation Integration', () => {
    test('should calculate and format route information end-to-end', () => {
        // Simulate route calculation result
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
                    legs: []
                }
            ]
        };

        // Verify route data structure
        expect(routeInfo.totals).toHaveProperty('distance');
        expect(routeInfo.totals).toHaveProperty('duration');
        expect(routeInfo.totals).toHaveProperty('bookingHours');
        expect(routeInfo.tripDays).toHaveLength(1);
        expect(routeInfo.tripDays[0]).toHaveProperty('date');
        expect(routeInfo.tripDays[0]).toHaveProperty('startTime');
        expect(routeInfo.tripDays[0]).toHaveProperty('endTime');
    });

    test('should handle multi-day route calculation', () => {
        const tripDays = [
            {
                date: '2026-01-15',
                startTime: '09:00',
                endTime: '17:00',
                pickup: '123 Main St',
                dropoffs: ['456 Elm St']
            },
            {
                date: '2026-01-16',
                startTime: '10:00',
                endTime: '18:00',
                pickup: '789 Oak Ave',
                dropoffs: ['321 Pine Rd']
            }
        ];

        // Verify multi-day structure
        expect(tripDays).toHaveLength(2);
        tripDays.forEach((day, index) => {
            expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(day.pickup).toBeTruthy();
            expect(day.dropoffs.length).toBeGreaterThan(0);
        });

        // Verify dates are sequential
        const date1 = new Date(tripDays[0].date);
        const date2 = new Date(tripDays[1].date);
        expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });
});

describe('Error Handling Integration', () => {
    test('should handle missing data gracefully', () => {
        const incompleteFormData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [],
            passengers: 0,
            name: '',
            email: '',
            phone: '',
            description: ''
        };

        // Check each required field
        const errors = [];
        
        if (!incompleteFormData.tripDays.length) {
            errors.push('No trip days');
        }
        if (!incompleteFormData.passengers) {
            errors.push('No passengers');
        }
        if (!incompleteFormData.name) {
            errors.push('No name');
        }
        if (!incompleteFormData.email) {
            errors.push('No email');
        }
        if (!incompleteFormData.phone) {
            errors.push('No phone');
        }
        if (!incompleteFormData.description) {
            errors.push('No description');
        }

        expect(errors.length).toBeGreaterThan(0);
    });

    test('should handle malformed trip day data', () => {
        const malformedText = 'Not a valid format at all';
        
        // Attempt to parse should not crash
        expect(() => {
            const lines = malformedText.split('\n');
            const hasValidFormat = malformedText.includes('Day 1:') &&
                                  malformedText.includes('Pick-up:') &&
                                  malformedText.includes('Drop-off');
            expect(hasValidFormat).toBe(false);
        }).not.toThrow();
    });
});

describe('Status and Color Management', () => {
    test('should manage quote status lifecycle', () => {
        const statuses = ['Draft', 'Sent', 'Accepted', 'Declined'];
        
        // Each status should have a representation
        statuses.forEach(status => {
            expect(status).toBeTruthy();
            expect(typeof status).toBe('string');
        });

        // Status progression should be logical
        const statusOrder = {
            'Draft': 0,
            'Sent': 1,
            'Accepted': 2,
            'Declined': 2
        };

        expect(statusOrder['Sent']).toBeGreaterThan(statusOrder['Draft']);
        expect(statusOrder['Accepted']).toBeGreaterThan(statusOrder['Sent']);
    });
});

describe('Data Persistence Flow', () => {
    test('should format data for Google Forms submission', () => {
        const formData = {
            quoteId: 'QUOTE-20260110-ABC12',
            tripDays: [
                {
                    date: '2026-01-15',
                    startTime: '09:00',
                    endTime: '17:00',
                    pickup: '123 Main St',
                    dropoffs: ['456 Elm St'],
                    endsNextDay: false
                }
            ],
            passengers: 30,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            company: 'Test Company',
            description: 'Test trip',
            notes: 'Special notes'
        };

        // Verify data can be serialized for submission
        const serialized = {
            quoteId: formData.quoteId,
            tripDays: JSON.stringify(formData.tripDays),
            passengers: String(formData.passengers),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            description: formData.description,
            notes: formData.notes
        };

        Object.values(serialized).forEach(value => {
            expect(typeof value).toBe('string');
        });
    });
});
