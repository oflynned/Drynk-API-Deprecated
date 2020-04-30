import { BaseDocument } from 'mongoize-orm';

export class Puke extends BaseDocument<any, any> {
  joiSchema(): object {
    return undefined;
  }
}
