let cultureRu = {
    url: 'https://all.culture.ru/',
    urlApi: 'https://all.culture.ru/api/2.2/',
    eventsUrl: 'https://culture.ru/',

    similarLocales: {
        1075: [1078, 2112],
        1078: [1075, 2112],
        2112: [1075, 1078],

        1071: [1074, 1083],
        1074: [1071, 1083],
        1083: [1071, 1074]
    },
    
    locales: [
        {"_id":1071, "name":"Салехард", "level":4},
        {"_id":1074, "name":"Лабытнанги", "level":4},
        {"_id":1075, "name":"Муравленко", "level":4},
        {"_id":1077, "name":"Новый Уренгой", "level":4},
        {"_id":1078, "name":"Ноябрьск", "level":4},
        {"_id":2112, "name":"Губкинский", "level":4},
        {"_id":2771, "name":"Надым", "level":4},
        {"_id":1080, "name":"Красноселькупский район", "level":3},
        {"_id":1081, "name":"Надымский район", "level":3},
        {"_id":1083, "name":"Приуральский район", "level":3},
        {"_id":1085, "name":"Пуровский район", "level":3},
        {"_id":1086, "name":"Тазовский район", "level":3},
        {"_id":1088, "name":"Шурышкарский район", "level":3},
        {"_id":1089, "name":"Ямальский район", "level":3}
    ],

    // localesIds: [1071, 1074, 1075, 1077, 1078, 2112, 2771],
    localesIds: [1071, 1074, 1075, 1077, 1078, 2112, 2771, 1080, 1081, 1083, 1085, 1086, 1088, 1089],

    // Салехард      / 1071 / 54
    // Лабытнанги    / 1074 / 9
    // Муравленко    / 1075 / 25
    // Новый Уренгой / 1077 / 20
    // Ноябрьск      / 1078 / 20
    // Губкинский    / 2112 / 8
    // Надым         / 2771 / 13

    fields: {
        events: [
            'ageRestriction',
            'actions',
            'category',
            'cover',
            'description',
            'shortDescription',
            'existsAccepted',
            'image',
            'gallery',
            'isDraft',
            'isFree',
            'name',
            'price',
            'maxPrice',
            'seancesSchedule',
            'tickets',
            'venues',
            'start',
            'end',
            'tags',
            'places',
            'localeIds',
            'seances'
        ],
        places: [
            'name',
            'description',
            'tags',
            'category',
            'workingSchedule',
            'workingScheduleComment',
            'address',
            'image',
            'gallery',
            'contacts',
            'locale',
            'localeIds',
            'organization',
            'mapPosition'
        ],
        _dev: [
            'limit',
            'offset',
            'sort',
            'categories',
            'status',
            'locales'
        ]
    }
}

cultureRu.getSimilarLocales = function(locales) {
    if (!Array.isArray(locales)) {
        return [];
    }

    let similar = {};
    locales.map(locale => {
        if (locale in cultureRu.similarLocales) {
            cultureRu.similarLocales[locale].map(similarLocale => {
                similar[similarLocale] = true;
            });
        }
    });
    return Object.keys(similar);
}

module.exports = cultureRu;