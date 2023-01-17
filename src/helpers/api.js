const request = require('request');

const cultureRu = require('./culture-ru.js');
const entities = require('../entities/entities.js');

const utils = require('./utils.js');
const debug = require('./debug.js');

/** Запрос к API culture.ru
* entity - Запрашиваемая сущность (events, places)
* params - Параметры запроса
*/
function api(entity, params) {
    if (debug) console.log("\r\n api", entity, params);

    return new Promise((resolve, reject) => {
        if (!(entity in entities)) {
            reject({error: 'undefined entity'});
            return;
        }

        params = Object.assign({
            fields: cultureRu.fields[entity].join(','),
            status: 'accepted',
            offset: 0,
            limit: cultureRu.limit,
            sort: '-id'
        }, params);

        if (entity != 'events') {
            delete params.start;
            delete params.end;
        } else {
            params.start = params.start || new Date().getTime();
        }

        if (params.start) params.start = Math.max(params.start, new Date().getTime());
        if (params.end)   params.end =   Math.max(params.start, params.end);

        if (debug) console.log("\r\n ", params);

        request({
            url: cultureRu.urlApi + entity,
            qs: params,
            json: true
        }, (err, res, body) => {
            if (err) {
                reject({error: err});
                return;
            }
            if (!(entity in body)) {
                reject({error: body});
                return;
            }

            if (debug) console.log("\r\n total", body.total);

            let mapped = body[entity].map((element) => entities[entity].mapper(element));
            resolve({
                total: body.total,
                items: mapped
            });
        });
    });
}

/** Получает события по нескольким городам и ближайшим к ним
* locales - Массив ID города
* params - Параметры запроса
*/
function getEventsByLocales(locales, params) {
    if (debug) console.log("\r\n getEventsByLocales", locales, params);

    return new Promise((resolve, reject) => {
        if (!locales) {
            reject({error: 'empty locales'});
            return;
        }

        if (!Array.isArray(locales)) {
            reject({error: 'locale must be an array'});
            return;
        }

        let needSimilar = !params.ignoreSimilar;
        if (needSimilar) {
            similar = cultureRu.getSimilarLocales(locales);
        }

        let events = {};
        let allLocales = {};
        similar.map(locale => {
            allLocales[locale] = true
        });
        locales.map(locale => {
            allLocales[locale] = false
        });

        if (debug) {
            console.log(allLocales);
            console.log('');
        }

        Object.keys(allLocales).map(locale => {
            // console.log("\r\n load", locale);

            getEventsByLocale(locale, params).then(
                items => {
                    events[locale] = {status: true, items};

                    if (Object.values(events).filter(locale => locale.status).length == Object.keys(allLocales).length) {
                        console.log("\r\n Events loaded");

                        let eventsArray = [];

                        locales.map(locale => {
                            eventsArray = eventsArray.concat(utils.sort(events[locale].items));
                        });
                        similar.map(locale => {
                            eventsArray = eventsArray.concat(utils.sort(events[locale].items));
                        });

                        resolve(eventsArray);
                    }
                },
                error => {
                    console.log(error);
                    reject(error);
                }
            );
        });
    });
}

/** Получает события конкретного города
* locale - ID города
* params - Параметры запроса
* offset - Смещение
*/
function getEventsByLocale(locale, params, offset = 0) {
    if (debug) console.log("\r\n getEventsByLocale", locale, params, offset);

    let total = Infinity;
    let items = [];

    return new Promise((resolve, reject) => {
        delete params.locales;

        try {
            if (!locale) {
                resolve([]);
                return;
            }

            let limit = params.limit || cultureRu.limit;

            api('events', Object.assign({
                locales: locale,
                offset: offset,
                limit: limit
            }, params)).then(
                result => {
                    total = result.total;

                    if ((offset + limit) < total) {
                        if (debug || true) {
                            console.log(locale, 'getEventsByLocale next');
                            console.log('');
                        }
                        getEventsByLocale(locale, params, 1*offset + 1*limit).then(
                            items => resolve(result.items.concat(items)),
                            error => reject(error)
                        );
                    } else {
                        if (debug || true) console.log("\r\n ", locale, ' events loaded. total: ', total);
                        resolve(result.items);
                    }
                },
                error => {
                    if (debug) {
                        console.log(locale, error);
                        console.log('');
                    }
                    reject(error);
                }
            );
        } catch(e) {
            reject(e);
        }
    });
}

/** Получает места по городам
* locales - Массив ID города
* params - Параметры запроса
*/
function getPlacesByLocales(locales, params) {
    if (debug) console.log("\r\n getPlacesByLocales", locales, params);

    return new Promise((resolve, reject) => {
        if (!locales) {
            reject({error: 'empty locales'});
            return;
        }

        if (!Array.isArray(locales)) {
            reject({error: 'locale must be an array'});
            return;
        }

        let needSimilar = !params.ignoreSimilar;
        if (needSimilar) {
            similar = cultureRu.getSimilarLocales(locales);
        }

        let places = {};
        let allLocales = {};
        similar.map(locale => allLocales[locale] = true);
        locales.map(locale => allLocales[locale] = false);

        if (debug) console.log("\r\n ", allLocales);

        Object.keys(allLocales).map(locale => {
            // console.log("\r\n load", locale);

            getPlacesByLocale(locale, params).then(
                items => {
                    places[locale] = {status: true, items};

                    if (Object.values(places).filter(locale => locale.status).length == Object.keys(allLocales).length) {
                        console.log("\r\n Places loaded");

                        let placesArray = [];

                        locales.map(locale => {
                            placesArray = placesArray.concat(utils.sort(places[locale].items));
                        });
                        similar.map(locale => {
                            placesArray = placesArray.concat(utils.sort(places[locale].items));
                        });

                        resolve(placesArray);
                    }
                },
                error => {
                    console.log(error);
                    reject(error);
                }
            );
        });
    });
}

/** Получает места конкретного города
* locale - ID города
* params - Параметры запроса
* offset - Смещение
*/
function getPlacesByLocale(locale, params, offset = 0) {
    if (debug) console.log("\r\n getPlacesByLocale", locale, params, offset);

    let total = Infinity;
    let items = [];

    return new Promise((resolve, reject) => {
        delete params.locales;

        try {
            if (!locale) {
                resolve([]);
                return;
            }

            let limit = params.limit || cultureRu.limit;

            api('places', Object.assign({
                locales: locale,
                offset: offset,
                limit: limit
            }, params)).then(
                result => {
                    total = result.total;

                    if ((offset + limit) < total) {
                        if (debug || true) console.log("\r\n ", locale, 'getPlacesByLocale next');
                        getPlacesByLocale(locale, params, 1*offset + 1*limit).then(
                            items => resolve(result.items.concat(items)),
                            error => reject(error)
                        );
                    } else {
                        if (debug || true) console.log("\r\n ", locale, ' places loaded. total: ', total);
                        resolve(result.items);
                    }
                },
                error => {
                    if (debug) console.log("\r\n ", locale, error);
                    reject(error);
                }
            );
        } catch(e) {
            reject(e);
        }
    });
}

module.exports = {
    api,

    getEventsByLocales,
    getEventsByLocale,

    getPlacesByLocales,
    getPlacesByLocale
}