import { ConfigService } from "@nestjs/config";
import { Brackets } from "typeorm";
import * as fs from 'fs';
const mime = require('mime');

const configService = new ConfigService();

export function baseUrl(path?: string, type?: string) {
  let app_url =
    type == 'front-end'
      ? configService.get('FRONTEND_URL')
      : configService.get('APP_URL');
  if (path) {
    app_url += `/${path}`;
  }
  return app_url;
}

export async function bindDataTableQuery(input: any, query: any = {}) {
  query.where = query.where || [];
  let tablePath = query.expressionMap.aliases[0].name;

  if (input.filter) {

    if (input.filter_in) {
      query.andWhere(new Brackets((qb: any) => {
        for (let index = 0; index < input.filter_in.length; index++) {
          const filter = input.filter_in[index];

          switch (filter.type) {
            case "int":
              let inputFilter = parseFloat(input.filter.replace(/[^0-9.-]+/g, ""));
              if (Number.isInteger(inputFilter)) {
                qb.orWhere(`${filter.name} like '%${inputFilter}%'`)
              }
              break;
            default:
              qb.orWhere(`${filter.name} like '%${input.filter}%'`)
              break;
          }
        }
      }))
    }
  }

  if (input.order) {
    query.orderBy(input.order.name, input.order.direction == 'asc' ? 'ASC' : 'DESC')
  }
  return query;
}

export function saveBase64Image(dataString, path: string = 'uploads'): string {
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
  const file_name = new Date().getTime();
  const file_path: string = `public/${path}/${file_name}.${ext}`;
  fs.writeFile(file_path, response.data, 'base64', function(err) {
    if (err) throw err;
  });

  return file_path;
}

