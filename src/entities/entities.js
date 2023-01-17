const events = require('./events.js');
const places = require('./places.js');

module.exports = {
	events,
	places,
	db: {
		markup(request, response, result) {
			result.rows.map(row => {
				response.write(`<h5>${row.table_name}</h5>`);
			});

			response.write(`<pre style="display: block; width: 100%; white-space: normal; word-wrap: break-word">${JSON.stringify(result)}</pre>`);
			response.end();
		},
		draw(request, response, result) {
			result.rows.map(row => {
				response.write(`<h5>${row.table_name}</h5>`);
			});

			response.write(`<pre style="display: block; width: 100%; white-space: normal; word-wrap: break-word">${JSON.stringify(result)}</pre>`);
			response.end();
		}
	}
}