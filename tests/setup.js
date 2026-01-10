// Test setup file - runs before all tests

// Mock CONFIG object for tests
global.CONFIG = {
    googleForm: {
        actionUrl: 'https://docs.google.com/forms/d/e/TEST_FORM_ID/formResponse',
        fields: {
            quoteId: 'entry.1026091944',
            tripDays: 'entry.630078859',
            passengers: 'entry.444654228',
            name: 'entry.1143231549',
            email: 'entry.1395274550',
            phone: 'entry.118255376',
            company: 'entry.2056082094',
            description: 'entry.280408210',
            notes: 'entry.1946711073',
            routeInfo: null
        }
    },
    googleMaps: {
        apiKey: 'TEST_API_KEY'
    },
    routeComputation: {
        enabled: true,
        showSummary: true
    },
    landingPage: {
        stats: {
            enabled: false,
            items: []
        }
    },
    email: {
        fromEmail: 'test@example.com',
        businessName: 'Test Bus Charter',
        bccEmail: '',
        templates: {
            subject: 'Test Subject',
            signature: 'Test Signature'
        }
    },
    emailjs: {
        enabled: false,
        publicKey: '',
        serviceId: '',
        templateId: '',
        adminNotification: {
            enabled: false,
            adminEmail: 'admin@example.com',
            adminTemplateId: ''
        }
    },
    googleSheets: {
        enabled: true,
        spreadsheetId: 'TEST_SPREADSHEET_ID',
        apiKey: '',
        sheetName: 'Form Responses 1',
        columns: {
            quoteId: 0,
            timestamp: 1,
            tripDays: 2,
            passengers: 3,
            name: 4,
            email: 5,
            phone: 6,
            company: 7,
            description: 8,
            notes: 9
        }
    },
    appsScript: {
        enabled: false,
        webAppUrl: '',
        sharedSecret: ''
    }
};

// Mock CONFIG_LOCAL (empty by default)
global.CONFIG_LOCAL = {};

// Constants used in the main scripts
global.METERS_PER_MILE = 1609.34;
global.API_CALL_DELAY_MS = 200;

// Mock browser APIs that may not be available in jsdom
global.sessionStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    },
    removeItem(key) {
        delete this.data[key];
    },
    clear() {
        this.data = {};
    }
};

// Mock console methods for cleaner test output (optional)
global.console = {
    ...console,
    // Uncomment to suppress console output during tests
    // log: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

// Mock google maps API
global.google = {
    maps: {
        places: {
            Autocomplete: jest.fn()
        },
        DistanceMatrixService: jest.fn(),
        DistanceMatrixStatus: {
            OK: 'OK',
            INVALID_REQUEST: 'INVALID_REQUEST'
        },
        UnitSystem: {
            IMPERIAL: 1
        },
        TravelMode: {
            DRIVING: 'DRIVING'
        }
    }
};
