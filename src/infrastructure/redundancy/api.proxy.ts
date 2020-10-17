import ky from 'ky-universal';

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
    try {
      await ky(`${this.destination}/${this.endpoint}/${options.id ?? ''}`, {
        method,
        headers: {
          authorization: firebaseToken,
          'x-proxy-secret': this.secret
        },
        body: JSON.stringify(options.body ?? {})
      });
    } catch (e) {
      console.error(
        'Steamrolled an exception, API redundancy may be out of sync'
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
