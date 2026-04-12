const CONFIG = {
    googleForm: {
        actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfcZqm_Kw8gcg-Jf8-cqaVfNsUUhTqy9rsjep8lckpVEjBE2A/formResponse',
        fields: {
            quoteId: 'entry.1026091944',
            tripDays: 'entry.630078859',
            passengers: 'entry.444654228',
            name: 'entry.1143231549',
            email: 'entry.1395274550',
            phone: 'entry.118255376',
            company: 'entry.2056082094',
            description: 'entry.280408210',
            notes: 'entry.1946711073'
        }
    },

    contact: {
        email: 'huabaohuang622@gmail.com',
        subject: 'Charter Quote Question'
    },

    landingPage: {
        stats: {
            enabled: false,
            items: [
                {
                    number: '15+',
                    label: 'Years Experience'
                },
                {
                    number: '1000+',
                    label: 'Group Trips Coordinated'
                },
                {
                    number: '24h',
                    label: 'Typical Response Window'
                }
            ]
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}