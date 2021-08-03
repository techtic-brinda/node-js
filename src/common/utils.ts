import { ConfigService } from './config.service';
import * as crypto from 'crypto';
import * as fs from 'fs';

import { Brackets, SelectQueryBuilder, getConnection, In } from 'typeorm';
import _ from 'underscore';

const mime = require('mime');

export function baseUrl(path?: string) {
    return ConfigService.get('APP_URL') + (path ? '/' + path : '');
}
export function adminUrl(path?: string) {
    return ConfigService.get('ADMIN_URL') + (path ? '/' + path : '');
}
export function frontUrl(path?: string) {
    return ConfigService.get('FRONT_URL') + (path ? '/' + path : '');
}

export function becrypt(password: string) {
    return crypto.createHmac('sha256', password).digest('hex');
}
export async function bindDataTableQuery(input: any, query: any = {}) {

    query.where = query.where || [];
    let tablePath = query.expressionMap.aliases[0].name;
    
    if (input.filter) {
        if (input.filter_in) {
            input.filter_in = JSON.parse(input.filter_in);
            query.andWhere(new Brackets((qb: any) => {
                for (let index = 0; index < input.filter_in.length; index++) {
                    const filter = input.filter_in[index];
                    switch (filter.name) {
                        case "category.name":
                            qb.orWhere(`EXISTS(SELECT * FROM faq_categories WHERE name LIKE  '%${input.filter}%' and id = ${tablePath}.category_id)`)
                            continue;
                            break;

                        case "user.name":
                            qb.orWhere(`EXISTS(SELECT * FROM users Where name LIKE  '%${input.filter}%' and id = ${tablePath}.party_id)`)
                            continue;
                            break;

                        case "vehicleMake.name":
                            qb.orWhere(`EXISTS(SELECT * FROM vehicle_makes Where name LIKE '%${input.filter}%' and id = ${tablePath}.vehicle_make_id)`)
                            continue;
                            break;

                        case "location.name":
                            qb.orWhere(`EXISTS(SELECT * FROM locations Where lower(name) LIKE  '%${input.filter}%' and id = ${tablePath}.location_id)`)
                            continue;
                            break;

                        case "terrif_user.name":
                            qb.orWhere(`EXISTS(SELECT * FROM users Where lower(name) LIKE  '%${input.filter}%' and id = ${tablePath}.party_id)`)
                            continue;
                            break;

                        case "location.party_id":
                                qb.orWhere(`EXISTS(SELECT * FROM users Where lower(name) LIKE  '%${input.filter}%' and id = ${tablePath}.party_id)`)
                                continue;
                                break;

                        case "promoCode.location":
                            qb.orWhere(`EXISTS(SELECT * FROM locations Where lower(name) LIKE  '%${input.filter}%' and id = ${tablePath}.location_id)`)
                            continue;
                            break;

                        case "connector.standard":
                            qb.orWhere(`EXISTS(SELECT * FROM connector Where lower(standard) LIKE  '%${input.filter}%' and id = ${tablePath}.connector_id)`)
                            continue;
                            break;
                        case "connector.uid":
                            qb.orWhere(`EXISTS(SELECT * FROM connector Where uid LIKE  '%${input.filter}%' and id = ${tablePath}.connector_id)`)
                            continue;
                            break;
                        case "promoCode.id":
                            qb.orWhere(`EXISTS(SELECT * FROM promo_codes Where voucher_code LIKE  '%${input.filter}%' and id = ${tablePath}.promocode_id)`)
                            continue;
                            break;

                        case "user.name":
                            qb.orWhere(`EXISTS(SELECT * FROM user Where lower(CONCAT(first_name,' ', last_name)) LIKE  '%${input.filter}%' and id = ${tablePath}.user_id)`)
                            continue;
                            break;

                        default:
                            qb.orWhere(`${tablePath}.${filter.name} like '%${input.filter}%'`)
                            break;
                    }


                    switch (filter.type) {
                        case "int":
                            let inputFilter = parseFloat(input.filter.replace(/[^0-9.-]+/g, ""));
                            if (Number.isInteger(inputFilter)) {
                                qb.orWhere(`${filter.name} = '${inputFilter}'`)
                            }
                            break;
                        default:
                            qb.orWhere(`${tablePath}.${filter.name} like '%${input.filter}%'`)
                            break;
                    }
                }
            }))
        }
    }

    if (input.order) {
        input.order = JSON.parse(input.order);
        switch (input.order.name) {

            case "referral.username":
                query.orderBy(`user.first_name`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "user.name":
                query.orderBy(`user.name`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "location.party_id":
                query.orderBy(`user.name`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "promoCode.location":
                query.orderBy(`location.name`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "terrif_user.name":
                query.orderBy(`tariffs.party_id`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "vehicleMake.name":
                query.orderBy('vehicle_make_id', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "location.name":
                query.orderBy('location.name', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
            case "connector.chargerType":
                query.orderBy('chargerType.name', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "connector.uid":
                query.orderBy('connector.uid', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "service_price":
                query.orderBy('service.price', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "faqCategory":
                query.orderBy('category.name', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "Categories.slug":
                query.orderBy('service_categories.slug', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "Categories.description":
                query.orderBy('service_categories.description', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "Categories.description":
                query.orderBy('service_categories.description', input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;

            case "service_categories_id":
                query.orderBy(`service.name`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
            case "category.name":
                query.orderBy(`faqs.category_id`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
            case "price_components.price":
                query.orderBy(`tariffs.id`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
            case "max_amount":
                query.orderBy(`CAST(promo_codes.max_amount as SIGNED INTEGER)`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
            case "min_amount":
                query.orderBy(`CAST(promo_codes.min_amount as SIGNED INTEGER)`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
            case "discount_amount":
                query.orderBy(`CAST(promo_codes.discount_amount as SIGNED INTEGER)`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
            default:
                query.orderBy(`${tablePath}.${input.order.name}`, input.order.direction == 'asc' ? 'ASC' : 'DESC')
                break;
        }

    }

    return query;
}


export function toSlug(text: string) {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

export function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function saveBase64Image(dataString, path: string = "uploads"): string {
    let matches = dataString.match(/^data:(.+);base64,(.+)$/);

    let response: any = {};
    if (!matches || matches.length !== 3) {
        return null;
    }

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    response.type = matches[1];

    response.data = Buffer.from(matches[2], 'base64');

    const ext = mime.getExtension(response.type);

    const file_name = (new Date()).getTime();

    const file_path: string = `public/${path}/${file_name}.${ext}`;

    fs.writeFile(file_path, response.data, 'base64', function (err) {
        if (err) throw err
    })

    return file_path;
}

export function saveBase64(dataString, path: string = "uploads"): string {

    let matches = dataString.match(/^data:(.+);base64,(.+)$/);
    let response: any = {};

    if (!matches || matches.length !== 3) {
        return null;
    }

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], 'base64');

    const ext = mime.getExtension(response.type);

    // base64 encoded data doesn't contain commas
    let mimeType = dataString.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split("/");


    const buffer = Buffer.from(matches[2]);
    const file_size = (buffer.length / 1e+6).toString();
    const file_name = (new Date()).getTime();
    const file_path: string = `public/${path}/${file_name}.${mimeType[1]}`;
    fs.writeFile(file_path, response.data, 'base64', function (err) {
        if (err) throw err
    })

    return file_path;
}

export async function asyncFilter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
}

export async function incrementNumber(number, type = 'location') {
    if (type == 'location') {
        number = number.slice(6);
        let incrementvalue = 0;
        if(number){
            incrementvalue = (+number) + 1
        }
        return ("000" + incrementvalue).slice(-3);
    }
    if (type == 'evse') {
        number = number.slice(8);
        let incrementvalue = (+number) + 1;
        return ("00" + incrementvalue).slice(-2);
    }
    if (type == 'connector') {
        number = number.slice(10);
        let incrementvalue = (+number) + 1;
        return ("00" + incrementvalue).slice(-2);
    }
    if (type == 'invoice') {
        var currentTime = new Date();
        var currentOffset = currentTime.getTimezoneOffset();
        var ISTOffset = 330;   // IST offset UTC +5:30
        var date = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

       // let date = new Date();
        var year = (date.getFullYear()+'').substr(2);
        let m = date.getMonth()+ 1;
        let month = (m > 9) ? m : '0'+m;
        let d = date.getDate();
        let day = (d > 9) ? d : '0'+d;
        let h = date.getHours();
        let hour = (h > 9) ? h : '0'+h;
        let min = date.getMinutes();
        let minutes = (min > 9) ? min : '0'+min;

        let new_invoice_number:any = year+month+day+hour+ minutes;
        let old_invoice_number;
        if(number == null){
            new_invoice_number += '000001';
        }else{
            old_invoice_number = number.slice(0, 10);
            if(new_invoice_number == old_invoice_number){
                new_invoice_number = Number(number) + 1;
            }else{
                new_invoice_number += '000001'
            }
        }
        return new_invoice_number;
    }
}
