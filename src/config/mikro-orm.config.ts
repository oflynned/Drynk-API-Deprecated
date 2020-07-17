require('dotenv').config();

import { MikroORM, Options } from 'mikro-orm';
import { Alcohol } from '../microservices/alcohol-store/entities/alcohol.entity';
import { Base } from '../models/entities/base.entity';
import { Environment } from './environment';

export const bootstrapMikro = (): Promise<MikroORM> => MikroORM.init(config);

const baseConfig: Options = {
  entities: [Base, Alcohol],
  entitiesDirsTs: ['./src/**/entities'],
  type: 'postgresql',
  clientUrl: process.env.DATABASE_URL,
  driverOptions: {
    connection: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
};

const devConfig: Partial<Options> = {
  debug: true
};

const prodConfig: Partial<Options> = {
  debug: true
};

export const config: Options = {
  ...baseConfig,
  ...(Environment.isProduction() ? prodConfig : devConfig)
};

export default config;
