const moment = require('moment');
const request = require('request');
const https = require('https');
const http = require('http');
const url = require('url');
const port = 3000;

const entities =  require('./src/entities/entities.js');
const cultureRu = require('./src/helpers/culture-ru.js');
const api =       require('./src/helpers/api.js');
const endpoints = require('./src/endpoints.js');

const debug = require('./src/helpers/debug.js');
const db =    require('./src/helpers/database.js');

const requestHandler = (request, response, forced) => {
    let queryData, path, html;

    if (!forced) {
        response && response.setHeader("Content-Type", "text/html; charset=utf-8");

        queryData = url.parse(request.url, true).query;
        path = request.url.split('?')[0];
        html = queryData.html;
    } else {
        queryData = forced.query;
        html = forced.html;
        path = forced.path;
    }

    let entity = path.substr(1);

    if (!(entity in entities)) {
        response && response.end('{error: "undefined entity"}');
        return;
    }

    for(key in queryData) {
        if ((queryData[key] === '')
        || (cultureRu.fields[entity]
            && (cultureRu.fields[entity].indexOf(key) === -1)
            && (cultureRu.fields._dev.indexOf(key) === -1))) {
            delete queryData[key];
        }
    }

    if (path in endpoints) {
        endpoints[path](queryData).then(
            ({entity, result}) => {
                if (debug) console.log("\r\n ", result);

                switch(entity) {
                    case 'events': result.map(event => db.insertEvent(event)); break;
                    case 'places': result.map(place => db.insertPlace(place)); break;
                }

                switch(Number(html)) {
                    case 0:
                        return;
                    case 1:
                        styles = require('./src/assets/styles.css');
                        response && response.write(styles);
                        entities[entity].draw(request, response, result);
                        break;
                    case 2:
                        stylesMarkup = require('./src/assets/stylesMarkup.css');
                        response && response.write(stylesMarkup);
                        entities[entity].markup(request, response, result);
                        break;
                    default:
                        response && response.write(`{"${entity}": ${JSON.stringify(result)}}`);
                }

                response && response.end();
            },
            error => {
                response && response.write(JSON.stringify(error));
                response && response.end();
            }
        );
    } else {
        response && response.end();
    }
}

const server = http.createServer(requestHandler)
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log("\r\n ", moment().format('DD.MM.YYYY, HH:mm:ss'));
    console.log("\r\n server is listening on ", port);

    db.connect();

    updateEvents(); setInterval(updateEvents, 10 * 60 * 60 * 1000);
    updatePlaces(); setInterval(updatePlaces, 11 * 60 * 60 * 1000);
});

function updateEvents() {
    console.log("\r\n Events Update Interval");
    requestHandler(null, null, {query: {}, html: 0, path: '/events'});
}

function updatePlaces() {
    console.log("\r\n Places Update Interval");
    requestHandler(null, null, {query: {}, html: 0, path: '/places'});
}