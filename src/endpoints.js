const cultureRu = require('./helpers/culture-ru.js');
const debug =     require('./helpers/debug.js');
const api =       require('./helpers/api.js');
const db =        require('./helpers/database.js');

module.exports = {
    '/db'(query) {
        return db.debug();
    },
    '/events'(query) {
        console.log("\r\n ----------------------------------------- ");

        if (debug) console.log("\r\n /events", query);

        return new Promise((resolve, reject) => {
            let params = Object.assign({}, {
                locales: cultureRu.localesIds.join(','),
                status: 'accepted',
                sort: '-seances'
            }, query);

            let locales = params.locales.split(',');
            delete params.locales;

            api.getEventsByLocales(locales, params).then(
                result => {
                    if (debug) console.log("\r\n ", result);
                    resolve({entity: 'events', result: result});
                },
                error => {
                    if (debug) console.log("\r\n ", error);
                    reject(error);
                }
            );
        });
    },
    '/places'(query) {
        console.log("\r\n ----------------------------------------- ");

        if (debug) console.log("\r\n /places", query);

        return new Promise((resolve, reject) => {
            let params = Object.assign({}, {
                locales: cultureRu.localesIds.join(','),
                status: 'accepted'
            }, query);

            let locales = params.locales.split(',');
            delete params.locales;

            api.getPlacesByLocales(locales, params).then(
                result => {
                    if (debug) console.log("\r\n ", result);
                    resolve({entity: 'places', result: result});
                },
                error => {
                    if (debug) console.log("\r\n ", error);
                    reject(error);
                }
            );
        });
    }
}