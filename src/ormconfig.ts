import { ConnectionOptions } from 'typeorm';
import { join } from 'path';
import { ConfigService } from './common/config.service';

// Check typeORM documentation for more information.
const config: ConnectionOptions = {
    type: "mysql",
    host: ConfigService.get('DB_HOST'),
    port: ConfigService.get('DB_PORT'),
    username: ConfigService.get('DB_USERNAME'),
    password: ConfigService.get('DB_PASSWORD'),
    database: ConfigService.get('DB_DATABASE'),
    entities: [join(__dirname, '**/**.entity{.ts,.js}')],
    // We are using migrations, synchronize should be set to false.
    synchronize: false,

    // Run migrations automatically,
    // you can disable this if you prefer running migration manually.
    migrationsRun: false,
    logging: false,
    logger: 'file',
    debug: false,

    // Allow both start:prod and start:dev to use migrations
    // __dirname is either dist or src folder, meaning either
    // the compiled js in prod or the ts in dev.
    migrations: [join(__dirname, 'migrations', '**/*{.ts,.js}')],
    cli: {
        // Location of migration should be inside src folder
        // to be compiled into dist/ folder.
        migrationsDir: join(__dirname, 'migrations'),
    },
    timezone:"Asia/Kolkata"
};
export default config;
