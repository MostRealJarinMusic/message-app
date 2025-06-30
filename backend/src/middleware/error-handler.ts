export function errorHandler(err: any, req: any, res: any, next: any) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
}
