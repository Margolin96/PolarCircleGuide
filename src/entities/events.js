const cultureRu = require('../helpers/culture-ru.js');
const utils =     require('../helpers/utils.js');
const debug =     require('../helpers/debug.js');

const moment = require('moment');
moment.locale('ru');

module.exports = {
    markup(request, response, items) {
        response.write(`<div class="container">`);

        items.forEach(event => {
            response.write(`
                <h5>${event.title}</h5>
            `);
        });

        response.write(`</div>`);
    },
    draw(request, response, items) {
        items.forEach(event => {
            response.write(`
                <table class="table">
                    <tr><th><big>id</big></th>    <td>${event.id}</td>
                    <tr><th>title</th>            <td>${event.title}</td></tr>
                    <tr><th>description</th>      <td>${event.description}</td></tr>
                    <tr><th>descriptionShort</th> <td>${event.descriptionShort}</td></tr>
                    <tr><th>start</th>            <td>${event.moment.start.format('x')}
                                                      (${event.moment.start.fromNow()})</td></tr>
                    <tr><th>end</th>              <td>${event.moment.end.format('x')}
                                                      (${event.moment.end.fromNow()})</td></tr>
                    <tr><th>duration</th>         <td>${event.duration}
                                                      (${event.moment.duration.humanize()})</td></tr>
                    <tr><th>images</th>           <td><div>${event.images ? '<img src="' + event.images.join('"><img src="') + '">' : ''}</div></td></tr>
                    <tr><th>ageRestriction</th>   <td>${event.ageRestriction}</td></tr>
                    <tr><th>price</th>            <td>${event.price}</td></tr>
                    <tr><th>maxPrice</th>         <td>${event.maxPrice}</td></tr>
                    <tr><th>places</th>           <td>${JSON.stringify(event.places)}</td></tr>
                    <tr><th>tags</th>             <td>${event.tags ? event.tags.join(', ') : ''}</td></tr>
                    <tr><th>links</th>            <td>${event.links ? event.links.join(', ') : ''}</td></tr>
                    <tr><th>categoryName</th>     <td>${event.categoryName}</td></tr>
                    <tr><th>categoryKey</th>      <td>${event.categoryName}</td></tr>
                    <tr><th>locale</th>           <td>${event.locale.join(', ')}</td>
                    <tr><th>cityId</th>           <td>${event.cityId}</td>
                    <tr><th>seances[0]</th>       <td>${JSON.stringify(event.seances[0])}</td>
                    <tr><th>nearestStart</th>     <td>${event.moment.nearestStart.fromNow()}</td>
                </table>
            `);
        });
    },
    mapper(object) {
        let places = {
            addresses: [],
            locales: {},
            localeIds: {}
        };

        object.places.map(place => {
            places.addresses.push({
                ['name']:    place.name,
                ['address']: place.address.street,
                ['coords']:  place.address.mapPosition ? place.address.mapPosition.coordinates : null,
            });
            places.locales[place.locale.name] = true;
            places.localeIds[place.localeIds] = true;
        });

        let price = object.price ? object.price : 0;
        let priceMax = object.priceMax ? object.priceMax : price;

        let mapped = {
            id:                 object._id,
            title:              object.name,
            description:        object.description.replace(/<[^>]*>/g, '').replace(/&[^>]*;/g, ' '),
            descriptionShort:   object.shortDescription.replace(/<[^>]*>/g, '').replace(/&[^>]*;/g, ' '),
            start:              object.start,
            end:                object.end,
            image:              utils.cultureRuImage(object.image.name),
            images:             utils.cultureRuImages(object),
            ageRestriction:     object.ageRestriction,
            price:              price,
            priceMax:           priceMax,
            places:             places.addresses,
            tags:               object.tags.map(tag => tag.name),
            links:              object.externalInfo ? object.externalInfo.map(info => info.url) : [],
            categoryName:       object.category.name,
            categoryKey:        object.category.sysName,
            locale:             Object.keys(places.locales),
            localeIds:          Object.keys(places.localeIds),
            cityId:             Object.keys(places.localeIds)[0].split(',')[0],
            seances:            object.seances ? object.seances.filter(s => s.end > moment()._d) : [],
            duration:           object.end - object.start,
        };

        mapped.nearestSeance = (mapped.seances && mapped.seances.length)
                            ? mapped.seances[0]
                            : false;
        mapped.nearestStart = mapped.nearestSeance
                            ? mapped.nearestSeance.start
                            : mapped.start;
        
        if (mapped.nearestSeance) {
            mapped.seances = Object.values(mapped.seances).map(seance => {
                return {
                    start: seance.start,
                    end: seance.end
                };
            });
            if (mapped.nearestSeance.start > new Date().getTime()) {
                mapped.nearestDate = mapped.nearestSeance.start;
            } else {
                mapped.nearestDate = mapped.nearestSeance.end;
            }
        } else {
            mapped.seances = [];
            mapped.nearestDate = mapped.end;
        }

        mapped.moment = {
            start:        moment(mapped.start),
            end:          moment(mapped.end),
            duration:     moment.duration(mapped.duration),
            nearestStart: moment(mapped.nearestStart)
        };

        return mapped;
    }
}

/*  Event
        id:               ID,
        title:            Название,
        description:      Описание,
        descriptionShort: Описание короткое,
        start:            Начало,
        end:              Конец,
        image:            Картинка,
        images:           Все изображения,
        ageRestriction:   Возрастное ограничение,
        price:            Цена,
        priceMax:         Максимальная цена,
        places:           Массив мест
        meta: {
            tags:         Теги,
            link:         Ссылка на публикации,
            category:     Категория
        },
        localeIds:       ID регионов
*/