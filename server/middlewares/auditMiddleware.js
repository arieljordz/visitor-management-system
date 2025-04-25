import { logAudit } from "../utils/auditLogger.js";

const auditMiddleware = (actionName) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        // Clone and sanitize body
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = "[REDACTED]";

        await logAudit({
          userId: req.user?.id || req.user?._id || null,
          action: actionName,
          ipAddress: req.ip,
          details: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            body: sanitizedBody,
          },
        });
      }
    });

    next();
  };
};

export default auditMiddleware;
