const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const envConfig = dotenv.parse(fs.readFileSync(path.join(process.cwd(),  '.env')));

const config = {
  type: 'mysql',
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  username: envConfig.DB_USERNAME,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_DATABASE,
  entities: [path.join(__dirname, '**/**.entity{.ts,.js}')],
  synchronize: false,
  migrationsRun: false,
  logging: false,
  logger: 'file',
  debug: false,
  migrations: [path.join(__dirname, 'migrations', '**/*{.ts,.js}')],
  cli: {
    migrationsDir: 'src/migrations',
  },
  timezone:"Asia/Kolkata"
};
module.exports = [ config ] ;
