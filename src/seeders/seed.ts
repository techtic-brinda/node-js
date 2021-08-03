import { NestFactory } from "@nestjs/core";
import { SeederModule } from "./seeder.module";
import { Logger } from "@nestjs/common";
import { Seeder } from "./seeder";

const argv = require('yargs').argv;

async function bootstrap() {
    NestFactory.createApplicationContext(SeederModule)
        .then(appContext => {
            const logger = appContext.get(Logger);
            const seeder = appContext.get(Seeder);
            let table = argv.table;
            seeder
                .seed(table)
                .then(() => {
                    logger.debug('Seeding complete!');
                })
                .catch(error => {
                    logger.error('Seeding failed!');
                    throw error;
                })
                .finally(() => appContext.close());
        })
        .catch(error => {
            throw error;
        });
}
bootstrap();
