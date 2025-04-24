import { logAudit } from "../utils/auditLogger.js";

const auditMiddleware = (actionName) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await logAudit({
          userId: req.user?.id || null,
          action: actionName,
          ipAddress: req.ip,
          details: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            body: req.body,
          },
        });
      }
    });

    next();
  };
};

export default auditMiddleware;
