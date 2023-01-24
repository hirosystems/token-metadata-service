/** Thrown when fetching metadata exceeds the max allowed byte size */
export class MetadataSizeExceededError extends Error {
  constructor(url: string) {
    super();
    this.message = `Fetch size limit exceeded: ${url}`;
    this.name = this.constructor.name;
  }
}

/** Thrown when fetching metadata exceeds the max allowed timeout */
export class MetadataTimeoutError extends Error {
  constructor(url: string) {
    super();
    this.message = `Time limit exceeded: ${url}`;
    this.name = this.constructor.name;
  }
}

/** Thrown when there is a parse error that prevented metadata processing */
export class MetadataParseError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
    this.name = this.constructor.name;
  }
}

export class HttpError extends Error {
  public cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super();
    this.message = message;
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

export class TooManyRequestsHttpError extends HttpError {}

export class JsonParseError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
    this.name = this.constructor.name;
  }
}
