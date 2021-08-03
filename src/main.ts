import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as admin from 'firebase-admin';
import { StationsService } from './modules/stations/stations.service';

const API_PREFIX = "api";

const serviceAccount = require("../kwik-ev-firebase-adminsdk-p2so0-263216118a.json");

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

	/* const stationsService = app.get(StationsService);
	 await stationsService.connectAllStationsToCentralSystem();
	setInterval(() => {
		stationsService.connectAllStationsToCentralSystem();
	}, 30000); */

	app.setViewEngine('hbs');
	app.use(bodyParser.json({ limit: '50mb' }));
	app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
	app.enableCors();
	//app.setGlobalPrefix(API_PREFIX);

	app.useGlobalPipes(new ValidationPipe());
	app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public' });
	app.useStaticAssets(join(process.cwd(), 'backend/dist/fuse'), { prefix: '/admin' });
	//app.useStaticAssets(join(process.cwd(), 'backend/dist/fuse/assets'), { prefix: '/admin' });

	// app.useStaticAssets(join(process.cwd(), 'server', 'public'), {
	//   index: false,
	//   prefix: '/public',
	//   maxAge: '1y',
	//   fallthrough: true
	// });

	const config = app.get(ConfigService);
	const port = config.get('APP_PORT');

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		//databaseURL: ""
	});

	await app.listen(port).then(() => {
		console.log(`App listening on ${port || 4405}`);
	});
}
bootstrap();
