import ky from 'ky-universal';
import { SentryHelper } from '../../common/sentry';

type Endpoint = 'users' | 'drinks';

// temp class to forward any writes to the new api
// this can be removed in a few months when usage drops to 0
// the app should probably have some killswitch put in to force an update
// as this write-through solution isn't bad, but it needs to be deprecated relatively soon
export class ApiProxy {
  private readonly secret: string;
  private readonly destination: string;
  private readonly endpoint: Endpoint;

  constructor(endpoint: Endpoint) {
    this.endpoint = endpoint;
    this.secret = process.env.PROXY_SECRET;
    this.destination = process.env.PROXY_API_URL;
  }

  private async request(
    method: 'post' | 'patch' | 'delete',
    firebaseToken: string,
    options: {
      id?: string;
      body?: object;
    }
  ): Promise<void> {
    const id = options.id ?? '';
    const url = `${this.destination}/proxy/${this.endpoint}/${id}`;

    console.log(`Forwarding ${method.toUpperCase()} req to ${url}`);

    try {
      await ky(url, {
        method,
        headers: {
          authorization: firebaseToken,
          'x-proxy-secret': this.secret,
          'content-type': 'application/json'
        },
        body: JSON.stringify(options.body ?? {})
      });
    } catch (e) {
      SentryHelper.captureException(e);
      console.info(
        'Steamrolled an exception, API redundancy may be out of sync!!'
      );
    }
  }

  async create(firebaseToken: string, body: object): Promise<void> {
    await this.request('post', firebaseToken, { body });
  }

  async update(firebaseToken: string, body: object): Promise<void> {
    await this.request('patch', firebaseToken, { body });
  }

  async delete(firebaseToken: string, id?: string): Promise<void> {
    await this.request('delete', firebaseToken, { id });
  }
}
