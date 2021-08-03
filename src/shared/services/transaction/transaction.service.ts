import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick, isEmpty } from "lodash";
import { User } from 'src/modules/entity/user.entity';
import { Pagination } from 'src/shared/class';
import { Transaction } from 'src/modules/entity/transaction.entity';
import { Wallet } from 'src/modules/entity/wallet.entity';
import { baseUrl, bindDataTableQuery } from 'src/common/utils';
import * as moment from 'moment';
import { CpoInvoice } from 'src/modules/entity/cpoInvoice.entity';
import { SettingService } from '../setting/setting.service';
import { Terrif } from 'src/modules/entity/terrif.entity';
var pdf = require("pdf-creator-node");
var fs = require('fs');

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Wallet)
        private readonly walletRepository: Repository<Wallet>,
        @InjectRepository(CpoInvoice)
        private readonly cpoInvoiceRepository: Repository<CpoInvoice>,

        @InjectRepository(Terrif)
        private readonly terrifRepository: Repository<Terrif>,

        private settingsService: SettingService,
    ) {}

    async getAllCpoInvoice(request) {
        try {
            const query = await this.cpoInvoiceRepository.createQueryBuilder('cpo_invoices')
                .leftJoinAndSelect('cpo_invoices.owner', 'owner')

            bindDataTableQuery(request, query);

            let response = await (new Pagination(query, User).paginate(request.limit, request.page));

            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAll(request) {
        try {
            const query = await this.transactionRepository.createQueryBuilder('header')
            if (request.order != undefined && request.order && request.order != '') {
                let order = JSON.parse(request.order);
                query.orderBy(`${order.name}`, order.direction.toUpperCase());
            } else {
                query.orderBy('id', 'ASC');
            }

            if (request.filter && request.filter != '') {
                query.where(`header.name LIKE :f`, { f: `%${request.filter}%` })
            }

            let limit = 10;
            if (request && request.limit) {
                limit = request.limit;
            }
            let page = 0;
            if (request && request.page) {
                page = request.page
            }
            request = pick(request, ['limit', 'page', 'name'])
            bindDataTableQuery(request, query);

            let response = await (new Pagination(query, User).paginate(limit, page));

            return response;
        } catch (error) {
            throw error;
        }
    }

    async getWalletTransaction(userId) {
        return await this.walletRepository.find({
            where: { user_id: userId } ,
            order: {
                id: "DESC"
            },
            relations: ['transaction','transaction.promoCode','transaction.location']
        });
    }


    async generateInvoice(request, user) {
        const { month, year } = request;

        let transactions: any = await this.transactionRepository.createQueryBuilder("transaction")
            .leftJoinAndSelect('transaction.location', 'location')
            .leftJoinAndSelect('transaction.owner', 'owner')
            .leftJoinAndSelect('transaction.user', 'user')
            .leftJoinAndSelect('transaction.connector', 'connector')
            .leftJoinAndSelect('transaction.promoCode', 'promoCode')
            .leftJoinAndSelect('transaction.terrif', 'terrif')
            .leftJoinAndSelect('terrif.price_component', 'price_component')
            .leftJoinAndSelect('transaction.chargerType', 'chargerType')
            .where('YEAR(date(transaction.created_at)) =' + Number(year))
            .where('MONTH(date(transaction.created_at)) =' + Number(month))
            .getMany();

        if (transactions) {
            let invoiceTransactions = [];
            await this.filter(transactions, async element => {
                element.created_at = moment(element.created_at).format("YYYY-MM-DD");
                invoiceTransactions.push(element);

            });

            let html = fs.readFileSync('views/invoice/cpo-invoice.html', 'utf8');
            let options = {
                format: "A4",
                orientation: "portrait",
                border: "10mm",
            }

            let file_name = 'cpo_invoice.pdf';

            if (fs.existsSync(baseUrl(`public/invoice/${file_name}`))) {
                await fs.unlinkSync(baseUrl(`public/invoice/${file_name}`));
            }

            var document = {
                html: html,
                data: {
                    transaction: invoiceTransactions,
                },
                path: `public/cpo-invoice/${file_name}`,
                type: 'pdf'
            };

            return await pdf.create(document, options)
                .then(res => {
                    return baseUrl(`public/cpo-invoice/${file_name}`);
                })
                .catch(error => {
                    return "Something went wrong"
                });
        }
        return `http://www.africau.edu/images/default/sample.pdf`;
    }

    async transactionPdf(transactioId, user) {
        let transaction: any = await this.transactionRepository.createQueryBuilder("transaction")
            .leftJoinAndSelect('transaction.location', 'location')
            .leftJoinAndSelect('transaction.owner', 'owner')
            .leftJoinAndSelect('transaction.user', 'user')
            .leftJoinAndSelect('transaction.connector', 'connector')
            .leftJoinAndSelect('transaction.promoCode', 'promoCode')
            .leftJoinAndSelect('transaction.terrif', 'terrif')
            .leftJoinAndSelect('terrif.price_component', 'price_component')
            .leftJoinAndSelect('transaction.chargerType', 'chargerType')
            .where('transaction.id =' + transactioId)
            .getOne();
        if (transaction) {

            transaction.created_at = moment(transaction.created_at).format("DD-MM-YYYY");
            let settings:any = await this.settingsService.get();
            let html = await fs.readFileSync('views/invoice/invoice.html', 'utf8');
            let options = {
                format: "A4",
                orientation: "portrait",
                /* footer: {
                    height: "15mm",
                    contents: {
                        default: '<p style="text-align:center;"></p>', // fallback value
                        last: '<p style="text-align:center;">This is a system generated invoice and hence no signature is required.</p>', // fallback value
                    }
                } */
            }

            let file_name = 'invoice_' + transaction.invoice_number + '.pdf';

            if (fs.existsSync(baseUrl(`public/invoice/${file_name}`))) {
                await fs.unlinkSync(baseUrl(`public/invoice/${file_name}`));
            }
            transaction.total_amount = parseFloat(transaction.total_amount).toFixed(2);
            let invoiceTitle = 'Bill of Supply/Receipt';
            if(settings.user_gst){
                settings.user_cgst = settings.user_gst/2;
                settings.user_sgst = settings.user_gst/2;
                transaction.amount_cgst = ((transaction.total_amount*settings.user_cgst)/(100 + parseFloat(settings.user_gst))).toFixed(2);
                transaction.amount_sgst = ((transaction.total_amount*settings.user_sgst)/(100 + parseFloat(settings.user_gst))).toFixed(2);
                transaction.user_tax_deduction = (parseFloat(transaction.amount_cgst) + parseFloat(transaction.amount_sgst)).toFixed(2);
                transaction.taxable_value = (transaction.total_amount - transaction.user_tax_deduction).toFixed(2);
            }
            if(!transaction.user.email){
                transaction.user.email = 'Not Available';
            }
            if(!transaction.connector.parking_fees){
                transaction.connector.parking_fees = 0;
            }
            transaction.user.label_state_code = null;
            transaction.user.state_code = null;
            if(transaction.user.company_name){
                transaction.user.name = transaction.user.company_name;
                transaction.user.state_code = (transaction.user.gst_number) ? transaction.user.gst_number.substring(0, 2) : '';
                transaction.user.label_state_code = 'State name & Code';
                invoiceTitle = 'Tax Invoice/ Receipt';
            }else{
                transaction.user.gst_number = 'Not Available';
                transaction.user.pan_number = 'Not Available';
            }
            transaction.parking_rate_note = null;
            transaction.amount_words = 'Indian Rupees '+ await this.inWords(parseFloat(transaction.total_amount));
            transaction.flat_rate_v = (transaction.flat_rate)? parseFloat(transaction.flat_rate).toFixed(2) : 0.00;
            transaction.electrict_deduction_v = parseFloat(''+transaction.user_electrict_deduction).toFixed(2);
            transaction.parking_rate_v = (transaction.parking_rate )? parseFloat(transaction.parking_rate).toFixed(2) : 0.00;
            transaction.amount = (transaction.amount )? parseFloat(transaction.amount).toFixed(2) : 0.00;

           // transaction.cashback = (transaction.kwik_promo_avail) ? -transaction.kwik_promo_avail : 0.00;
            transaction.cashback = (transaction.caseback_available) ? -transaction.caseback_available : 0.00;

            settings.electric_deduction = parseFloat(''+(transaction.electrict_deduction_v/transaction.total_energy)).toFixed(2);
            settings.address = settings.address.split(',');

            if(transaction.parking_rate_v){
                transaction.parking_rate_note = "*100 Rs./15 Min. after the session-end buffer period of 15 min.";
            }
            var document = {
                html: html,
                data: {
                    transaction: transaction,
                    settings: settings,
                    invoiceTitle: invoiceTitle
                },
                path: `public/invoice/${file_name}`,
                type: 'pdf'
            };

            return await pdf.create(document, options)
                .then(res => {
                    return baseUrl(`public/invoice/${file_name}`);
                })
                .catch(error => {
                    return "Something went wrong"
                });
        }

    }

    async inWords(number) {
        let num: any = parseInt(number);

        if(!num){
            return 'zero Only'
        }
        var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
        var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
        let n;
        if ((num = num.toString()).length > 9) return 'overflow';
        n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; var str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
        str += (n[5] != 0) ? (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + '' : '';

        let pointValue:any =  (number + "").split(".");
         if(pointValue[1]){
             str += ' Point';
             let pointValuePart = (pointValue[1] + "").split("");
            str += ' ' + (b[pointValuePart[0]] ? b[pointValuePart[0]] : 'zero');
            str += ' ' + (a[pointValuePart[1]] ? a[pointValuePart[1]] : '');
        }
        return str += ' Only';
    }


    async transactionDetails(id) {
        const response = await this.transactionRepository.createQueryBuilder("transaction")
            .leftJoinAndSelect('transaction.location', 'location')
            .leftJoinAndSelect('transaction.owner', 'owner')
            .leftJoinAndSelect('transaction.connector', 'connector')
            .leftJoinAndSelect('transaction.promoCode', 'promoCode')
            .leftJoinAndSelect('connector.eves', 'eves')
            .leftJoinAndSelect('transaction.terrif', 'terrif')
            .leftJoinAndSelect('terrif.price_component', 'price_component')
            .leftJoinAndSelect('transaction.chargerType', 'chargerType')
            .where('transaction.id =' + id)
            .getMany();
        return response;
    }

    async vehicleTransaction(vehicleId) {
        const response = await this.transactionRepository.createQueryBuilder("transaction")
            .leftJoinAndSelect('transaction.location', 'location')
            .leftJoinAndSelect('transaction.owner', 'owner')
            .leftJoinAndSelect('transaction.connector', 'connector')
            .leftJoinAndSelect('transaction.promoCode', 'promoCode')
            .leftJoinAndSelect('transaction.terrif', 'terrif')
            .leftJoinAndSelect('terrif.price_component', 'price_component')
            .leftJoinAndSelect('transaction.chargerType', 'chargerType')
            .where('transaction.vehicle_id =' + vehicleId)
            .orderBy('transaction.created_at', 'DESC')
            .getMany();
        return response;
    }

    async getOwnerTransaction(request, user) {
        try {

            if (request.filterBy) {
                request.filterBy = JSON.parse(request.filterBy);
            }
            const query = await this.transactionRepository.createQueryBuilder("transaction")
            query.leftJoinAndSelect("transaction.location", "location")
            query.leftJoinAndSelect("transaction.connector", "connector")
            query.leftJoinAndSelect("transaction.chargerType", "chargerType")

            if (user.roles.length > 0 && user.roles[0].name != 'Auditor' && request.party_id) {
                query.where(`transaction.party_id = ${request.party_id}`);
            }

            if (!isEmpty(request.filterBy)) {
                if (request.filterBy.starts_at && request.filterBy.expires_at) {
                    let startDate = moment(request.filterBy.starts_at, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    let endDate = moment(request.filterBy.expires_at, 'YYYY-MM-DD').format('YYYY-MM-DD');
                    query.andWhere(`DATE(transaction.created_at) BETWEEN '${startDate}' AND '${endDate}'`);
                }
                if (request.filterBy.isToday) {
                    var currentDate = moment().format("YYYY-MM-DD");
                    query.andWhere(`DATE(transaction.created_at) = '${currentDate}'`);
                }
                if (request.filterBy.location_id) {
                    query.andWhere(`EXISTS(SELECT * FROM locations where id = '${request.filterBy.location_id}' and locations.id = transaction.location_id)`)
                }
                if (request.filterBy.charger_type_id) {
                    query.andWhere(`transaction.charger_type_id = '${request.filterBy.charger_type_id}'`)
                }
            }

            bindDataTableQuery(request, query);

            let response = await (new Pagination(query, Transaction).paginate(request.limit, request.page, { relations: ['user', 'owner', 'location', 'connector','chargerType','promoCode'] }));
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getUserTransaction(request, id) {
        try {
            const query = await this.transactionRepository.createQueryBuilder("transaction")
            if (request.order != undefined && request.order && request.order != '') {
                let order = JSON.parse(request.order);
                query.orderBy(`${order.query.created_at}`, order.direction.toUpperCase());
            } else {
                query.orderBy('transaction.id', 'ASC');
            }
            query.where(`transaction.user_id = ${request.query.user_id}`);
            if (request.filter && request.filter != '') {
                query.andWhere(`transaction.user_id LIKE :f`, { f: `%${request.filter}%` })
            }

            let limit = 10;
            if (request && request.limit) {
                limit = request.limit;
            }
            let page = 0;
            if (request && request.page) {
                page = request.page
            }
            request = pick(request, ['limit', 'page', 'name'])
            bindDataTableQuery(request, query);
            let response = await (new Pagination(query, Transaction).paginate(limit, page, { relations: ['user','location'] }));
            return response;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        await this.transactionRepository.softDelete({ id: id })
    }

    async filter(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
    }
}
