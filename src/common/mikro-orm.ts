import { bootstrapMikro } from '../config/mikro-orm.config';

(async () => {
  const orm = await bootstrapMikro();
  const generator = orm.getSchemaGenerator();

  await generator.dropSchema();
  await generator.createSchema();
  await generator.updateSchema();
  await generator.generate()

  // await generator.getDropSchemaSQL();
  // await generator.getCreateSchemaSQL();
  // await generator.getUpdateSchemaSQL();
  // await generator.generate();

  await orm.close(true);
})();
