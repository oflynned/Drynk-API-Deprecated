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

  async create(firebaseToken: string, payload: object): Promise<void> {
    try {
      await ky.post(`${this.destination}/${this.endpoint}`, {
        headers: {
          authorization: firebaseToken,
          'x-proxy-secret': this.secret
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error(e);
    }
  }

  async update(firebaseToken: string, payload: object): Promise<void> {
    try {
      await ky.patch(`${this.destination}/${this.endpoint}`, {
        headers: {
          authorization: firebaseToken,
          'x-proxy-secret': this.secret
        },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error(e);
    }
  }

  async delete(firebaseToken: string, id?: string): Promise<void> {
    try {
      await ky.delete(`${this.destination}/${this.endpoint}/${id ?? ''}`, {
        headers: { authorization: firebaseToken, 'x-proxy-secret': this.secret }
      });
    } catch (e) {
      console.error(e);
    }
  }
}
