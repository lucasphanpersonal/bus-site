const CONFIG = {
    googleForm: {
        actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe33l_xEaQy3dqoSueIvrJ46PblnQePEJJfCTdPoivy5v6iYA/formResponse',
        fields: {
            quoteId: 'entry.1938020587',
            tripDays: 'entry.197961136',
            passengers: 'entry.253114732',
            name: 'entry.78300018',
            email: 'entry.1103377401',
            phone: 'entry.1916311674',
            company: 'entry.420319825',
            description: 'entry.782617566',
            notes: 'entry.1920841996'
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