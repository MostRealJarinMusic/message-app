export class BadRequestError extends Error {
  status = 400;
  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  status = 409;
  constructor(message = "Conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

export class GoneError extends Error {
  status = 410;
  constructor(message: string) {
    super(message);
    this.name = "GoneError";
  }
}

export class InternalServerError extends Error {
  status = 500;
  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
  }
}
