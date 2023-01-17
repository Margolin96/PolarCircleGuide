const utils = require('../helpers/utils.js');

module.exports = {
    draw(request, response, items) {
        items.forEach(place => {
            response.write(`
                <table class="table">
                    <tr><th><big>id</big></th>    <td>${place.id}</td>
                    <tr><th>title</th>            <td>${place.title}</td>
                    <tr><th>description</th>      <td>${place.description}</td>
                    <tr><th>tags</th>             <td>${place.tags.join(', ')}</td>
                    <tr><th>categoryName</th>     <td>${place.categoryName}</td>
                    <tr><th>categoryKey</th>      <td>${place.categoryKey}</td>
                    <tr><th>schedule</th>         <td>${JSON.stringify(place.schedule)}</td>
                    <tr><th>scheduleComment</th>  <td>${place.scheduleComment}</td>
                    <tr><th>address</th>          <td>${JSON.stringify(place.address)}</td>
                <!--<tr><th>image</th>            <td><img src="${place.image}"></td></tr>-->
                    <tr><th>images</th>           <td><div>${place.images ? '<img src="' + place.images.join('"><img src="') + '">' : ''}</div></td></tr>
                    <tr><th>vk</th>               <td>${place.vk}</td>
                    <tr><th>email</th>            <td>${place.email}</td>
                    <tr><th>phones</th>           <td>${place.phones.join(', ')}</td>
                    <tr><th>cityId</th>           <td>${place.cityId}</td>
                    <tr><th>organization</th>     <td>${JSON.stringify(place.organization)}</td>
                </table>
            `);
        });
    },
    mapper(object) {
        let schedule = [];
        if (object.workingSchedule) {
            for(day in object.workingSchedule) {
                schedule[day] = {
                    start: object.workingSchedule[day].from,
                    end: object.workingSchedule[day].to
                };
            }
        }

        let data = {
            id:              object._id,
            title:           object.name,
            description:     object.description.replace(/<[^>]*>/g, '').replace(/&[^>]*;/g, ' '),
            categoryName:    object.category.name,
            categoryKey:     object.category.sysName,
            tags:            object.tags.map(tag => tag.name),
            schedule:        schedule,
            scheduleComment: object.workingScheduleComment || '',
            address:         object.address.street,
            addressComment:  object.address.comment,
            coords:          object.address.mapPosition.coordinates,
            images:          utils.cultureRuImages(object),
            vk:              object.contacts.vkontakte || '',
            email:           object.contacts.email || '',
            phones:          object.contacts.phones ? object.contacts.phones.map(phone => phone.value) : [],
            cityId:          object.locale._id,
            organization:    object.organization.name
        };

        for(key in data) { if (!data[key]) data[key] = ''; }

        return data;
    }
}

/*  Place
        id:              ID,
        title:           Название,
        description:     Описание,
        meta: {
            tags:        Теги
            types:       Тип
            category:    Категория
        },
        schedule:        Расписание работы
        scheduleComment: Комментарий
        address: {
            address:     Адрес
            comment:     Комментарий
            coords:      Координаты
        },
        image:           Картинка,
        images:          Все изображения,
        contacts:        Контакты
        locale:          Регион,
        localeIds:       ID регионов,
        organization:    Название организации
*/