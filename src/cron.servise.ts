import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from '@nestjs/schedule';
import { EvseService } from "./shared/services/evse/evse.service";

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    constructor(
        @Inject(forwardRef(() => EvseService))
        private evseService: EvseService,
        //private readonly userService: UserService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
   // @Cron(CronExpression.EVERY_SECOND)
    sendNotificationToDatabaseForMachine() {
        this.logger.debug(new Date());
        this.evseService.sendNotificationToDatabaseForMachine();
       // this.userService.sendOnboardingUserNotification();
    }
}
