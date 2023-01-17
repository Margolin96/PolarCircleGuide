let db = {
    pg: require('pg'),
    client: null,
    connected: false
};

module.exports = {
    connect() {
        // console.log("\r\n db.connect");

        return new Promise((resolve, reject) => {
            if (db.connected === true) {
                // console.log("\r\n db.connect", 'already connected');
                resolve(true);
                return;
            }

            process.env.POSTGRESQL_HOST     = process.env.POSTGRESQL_HOST     || 'my-postgresql-do-user-3624169-0.db.ondigitalocean.com';
            process.env.POSTGRESQL_PASSWORD = process.env.POSTGRESQL_PASSWORD ||'yd84m8axcy9m8qk4';
            process.env.POSTGRESQL_USER     = process.env.POSTGRESQL_USER     ||'doadmin';

            const cs = `postgres://${process.env.POSTGRESQL_USER}`
                     + `:${process.env.POSTGRESQL_PASSWORD}`
                     + `@${process.env.POSTGRESQL_HOST}:25060`
                     + `/polarcircleguide`
                     + `?ssl=true`;

            db.client = new db.pg.Client(cs);

            try {
                db.client.connect().then(
                    result => {
                        db.connected = true;
                        console.log("\r\n db.connect", 'connected');
                        resolve(true);
                    },
                    error => reject(error)
                );
            } catch(error) {
                reject(error);
            }
        });
    },
    query(query) {
        return new Promise((resolve, reject) => {
            this.connect().then(
                result => db.client.query(query).then(resolve, reject),
                error => reject(error)
            );
        });
    },

    insertEvent(event) {
        let eventData = {
            "Id":               `${event.id}`,
            "Title":            `'${event.title}'`,
            "Description":      `'${event.description}'`,
            "DescriptionShort": `'${event.descriptionShort}'`,
            "Start":            `${event.start}`,
            "End":              `${event.end}`,
            "Images":           `array[${event.images ? "'" + event.images.join("','") + "'" : ''}]`,
            "AgeRestriction":   `${event.ageRestriction}`,
            "Price":            `${event.price}`,
            "PriceMax":         `${event.priceMax}`,
            "Places":           `'${JSON.stringify(event.places)}'`,
            "Tags":             `array[${event.tags ? "'" + event.tags.join("','") + "'" : ''}]`,
            "Links":            `array[${event.links ? "'" + event.links.join("','") + "'" : ''}]`,
            "CategoryName":     `'${event.categoryName}'`,
            "CategoryKey":      `'${event.categoryKey}'`,
            "CityId":           `${event.cityId}`,
            "Schedule":         `'${JSON.stringify(event.seances)}'`,
            "Updated":          new Date().getTime()
        };

        return this.query(`
            INSERT INTO "Events" ("${Object.keys(eventData).join('","')}")
            VALUES (${Object.values(eventData)})
        `).then(
            result => console.log("\r\n Events INSERT", Boolean(result.rowCount), event.id),
            error => {
                if (error.code == 23505) {
                    // console.log("\r\n Events INSERT >> already exists", event.id);

                    delete eventData.Id;
                    delete eventData.Updated;

                    this.query(`
                        UPDATE "Events"
                        SET ${this.getUpdateString(eventData)}
                        WHERE "Id"=${event.id}
                    `).then(
                        result => console.log("\r\n Events INSERT >> UPDATE", Boolean(result.rowCount), event.id),
                        error => console.log(error)
                    );
                } else {
                    console.log(eventData, error);
                }
            }
        );
    },
    insertPlace(place) {
        let placeData = {
            "Id":              `${place.id}`,
            "Title":           `'${place.title}'`,
            "Description":     `'${place.description}'`,
            "Tags":            `array[${place.tags ? "'" + place.tags.join("','") + "'" : ''}]`,
            "CategoryName":    `'${place.categoryName}'`,
            "CategoryKey":     `'${place.categoryKey}'`,
            "Schedule":        `'${JSON.stringify(place.schedule)}'`,
            "ScheduleComment": `'${place.scheduleComment}'`,
            "Address":         `'${place.address}'`,
            "AddressComment":  `'${place.addressComment}'`,
            "Coords":          `array[${place.coords ? place.coords.join(',') : ''}]::integer[]`,
            "Images":          `array[${place.images ? "'" + place.images.join("','") + "'" : ''}]`,
            "Vk":              `'${place.vk}'`,
            "Phones":          `array[${place.phones ? "'" + place.phones.join("','") + "'" : ''}]`,
            "Email":           `'${place.email}'`,
            "CityId":          `${place.cityId}`,
            "Organization":    `'${place.organization}'`
        };

        let query = `
            INSERT INTO "Places" ("${Object.keys(placeData).join('","')}")
            VALUES (${Object.values(placeData)})
        `;

        return this.query(query).then(
            result => console.log("\r\n Places INSERT", Boolean(result.rowCount), place.id),
            error => {
                if (error.code == 23505) {
                    // console.log("\r\n Places INSERT >> already exists", place.id);

                    delete placeData.Id;

                    this.query(`
                        UPDATE "Places"
                        SET ${this.getUpdateString(placeData)}
                        WHERE "Id"=${place.id}
                    `).then(
                        result => console.log("\r\n Places INSERT >> UPDATE", Boolean(result.rowCount), place.id),
                        error => console.log(error)
                    );
                } else {
                    console.log("\r\n Place ERROR", place.id, query);
                }
            }
        );
    },

    getUpdateString(object) {
        let fields = [];
        for(key in object) {
            fields.push(`"${key}"=${object[key]}`);
        }
        return fields.join(',');
    },
    select(table, id) {
        console.log("\r\n db.select", table, id);

        return this.query(`SELECT * FROM "${table}" WHERE ` + (id ? `"Id"=${id}` : `true`)).then(
            result => result.rows // console.log(result.rows)
        )
    }
}