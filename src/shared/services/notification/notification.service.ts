
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/modules/entity/notification.entity';
import { UserNotification } from 'src/modules/entity/user_notification.entity';
import { _ } from "underscore";
import * as admin from 'firebase-admin';
import { User } from 'src/modules/entity/user.entity';


@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(UserNotification)
        private readonly userNotificationRepository: Repository<UserNotification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,

    ) { }

    async get(userId) {
        try {
            const response = await this.userNotificationRepository.find({
                where: { user_id: userId },
                relations: ['notification']
            });
            await this.userNotificationRepository.query(`Update user_notification set is_read=1 where user_id=${userId}`)
            return response;
        } catch (error) {
            throw error;
        }
    }

    async filter(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
    }

    async addNotification(type: string = "", body: string = "", userId, dataDetail={}) {
        try {
            let notification = new Notification();
            notification.statement = body;
            notification.type = type;
            let notificationData = await this.notificationRepository.save(notification);
            if (userId && notificationData) {
                let userNotification = new UserNotification();
                userNotification.notification_id = notificationData.id;
                userNotification.user_id = userId;
                await this.userNotificationRepository.save(userNotification);

                const user = await this.userRepository.findOne({
                    where: { id: userId },
                    relations: ['device_token']
                });

                //Send notification to user
                if (user && user.device_token) {
                    let token = user.device_token.device_token;
                    let notfication = await this.userNotificationRepository.query(`select count(id) from user_notification where user_id = '${user.id}' and is_read = 0 `);
                    let notifyCount = Object.values(notfication[0]);
                    let badgeCount = notifyCount && notifyCount.length && notifyCount[0] > 1 ? Number (notifyCount[0]) : 1;

                    let message = {
                        notification: {
                            title: type,
                            body: body
                        },
                        data: dataDetail,
                        android: {
                            notification: {
                                sound: 'default',
                                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                            },
                        },
                        apns: {
                            payload: {
                                aps: {
                                    badge: badgeCount,
                                    sound: 'default',
                                },
                            },
                        },
                        token: token,
                    }
                    this.sendPushNotification(message);
                }
            }
        } catch (err) {
            throw (err);
        }
    }

    async addMultipleNotification(type: string = "", body: string = "", title: string = "") {
        try {
            let notification = new Notification();
            notification.statement = body;
            notification.type = type;
            let notificationData = await this.notificationRepository.save(notification);
            let userSendNotify = [];
            if (notificationData) {
                let users = await this.userRepository.createQueryBuilder('user')
                    .leftJoinAndSelect('user.roles', 'roles')
                    .leftJoinAndSelect('user.device_token', 'device_token')
                    .where("user.status = :status", { status: 'active' })
                    .andWhere("user.is_notify = :is_notify", { is_notify: '1' })
                    .andWhere("roles.name = :name", { name: 'User' })
                    .getMany();

                if (users.length > 0) {
                    await this.filter(users, async (res) => {
                        if (res.is_notify == 1 && res.device_token) {
                            await userSendNotify.push({ token: res.device_token.device_token, userId: res.id });
                        }
                        let userNotification = new UserNotification();
                        userNotification.notification_id = notificationData.id;
                        userNotification.user_id = res.id;
                        await this.userNotificationRepository.save(userNotification);
                    });
                }
            }



            if (userSendNotify.length > 0) {
                await this.filter(userSendNotify, async notify => {
                    let notfication = await this.userNotificationRepository.query(`select count(id) from user_notification where user_id = '${notify.userId}' and is_read = 0 `);
                    let notifyCount = Object.values(notfication[0]);
                    let badgeCount = notifyCount && notifyCount.length && notifyCount[0] > 1 ? Number (notifyCount[0]) : 1;
                    //console.log(badgeCount,'badgeCount');
                    let message = {
                        notification: {
                            title: title,
                            body: body
                        },
                        android: {
                            notification: {
                                sound: 'default',
                                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                            },
                        },
                        apns: {
                            payload: {
                                aps: {
                                    badge: badgeCount,
                                    sound: 'default',
                                },
                            },
                        },
                        token: notify.token,
                    }
                    this.sendPushNotification(message);
                });
            }
            return notificationData;
        } catch (err) {
            throw (err);
        }
    }

    async sendPushNotification(message) {

        await admin.messaging().send(message).then((res) => {
            console.log("Successfully sent with response: ", res);
        }).catch((err) => {
            console.log("Something has gone wrong!", err);
        });
    }
}
