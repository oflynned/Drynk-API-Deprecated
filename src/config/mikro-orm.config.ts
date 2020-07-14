require('dotenv').config();

import { MikroORM, Options } from 'mikro-orm';
import { Alcohol } from '../microservices/alcohol-store/entities/alcohol.entity';
import { Base } from '../models/entities/base.entity';
import { Environment } from './environment';

export const bootstrapMikro = (): Promise<MikroORM> => MikroORM.init(config);

const baseConfig = {
  entities: [Base, Alcohol],
  entitiesDirsTs: ['./src/**/entities'],
  type: 'postgresql',
  clientUrl: process.env.DATABASE_URL
};

const devConfig = {
  debug: true,
  // driverOptions: {
  //   connection: {
  //     ssl: {
  //       rejectUnauthorized: false
  //     }
  //   }
  // }
};

const prodConfig = {
  debug: false
};

export const config: Options = {
  ...baseConfig,
  ...devConfig
  // ...(Environment.isProduction() ? prodConfig : devConfig)
};

export default config;
