export type HttpErrorType = {
  _name: string;
  _context: string;
  _status: number;
  _time: Date;
};

export class HttpError extends Error {
  private readonly _name: string;
  private readonly _context: string;
  private readonly _status: number;
  private readonly _time: Date;

  constructor(name: string, status: number = 500, context: string) {
    super(name);
    Object.setPrototypeOf(this, HttpError.prototype);

    this._name = name;
    this._context = context;
    this._status = status;
    this._time = new Date();
  }

  get name(): string {
    return this._name;
  }

  get context(): string {
    return this._context;
  }

  get status(): number {
    return this._status;
  }

  get time(): Date {
    return this._time;
  }
}
