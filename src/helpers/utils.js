const cultureRu = require('./culture-ru.js');

// return image url by name & sizes
function cultureRuImage(name, w = 388, h = 172) {
    let base = name.split('.');
    let ext = base.pop();
    return cultureRu.url + 'uploads/' + base.join('.') + `_w${w}_h${h}.` + ext;
}

// return all images urls by event object & sizes
function cultureRuImages(event, w = 388, h = 172) {
    let images = [];
    if (event.image) {
        images.push(cultureRuImage(event.image.name, w, h));
    }
    if (event.gallery && event.gallery.length) {
        event.gallery.map(image => images.push(cultureRuImage(image.name, w, h)));
    }
    return images;
}

// sort events by nearest start time
function sort(items) {
    let order = {};
    let sorted = [];
    let mapped = items.map((element, index) => {
        if (!(element.nearestStart in order)) {
            order[element.nearestStart] = [];
        }
        order[element.nearestStart].push(index);
        return element;
    });

    Object.keys(order).sort().forEach(start => {
        order['' + start].forEach(index => {
            sorted.push(mapped['' + index]);
        });
    });

    return sorted;
}

module.exports = {
    cultureRuImage,
    cultureRuImages,
    sort
}