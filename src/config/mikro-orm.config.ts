import { MikroORM, Options } from 'mikro-orm';
import { Alcohol } from '../microservices/alcohol-store/entities/alcohol.entity';
import { Base } from '../models/entities/base.entity';
import { Environment } from './environment';

export const bootstrapMikro = (): Promise<MikroORM> => MikroORM.init(config);

export const config: Options = {
  entities: [Base, Alcohol],
  entitiesDirsTs: ['./src/**/entities'],
  debug: !Environment.isProduction(),
  type: 'postgresql',
  clientUrl: process.env.DATABASE_URI || 'postgresql://postgres@localhost:5432/drynk'
};

export default config;