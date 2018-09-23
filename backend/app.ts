import * as express from "express";
import * as compression from "compression";
import {Logger, getLogger} from "log4js";
import * as AWS from "aws-sdk";

import {loadConfig} from "./config";
import notFoundHandler from "./middlewares/error/notFoundHandler";
import errorHandler from "./middlewares/error/errorHandler";

// Auth
import requireAuth from "./middlewares/auth/verify";

// Controllers (route handlers)
import user from "./controllers/user";
import search from "./controllers/search";
import successHandler from "./middlewares/success/successHandler";

// Create Express server
const app: express.Application = express();

// Express configuration
const config = loadConfig();
app.set("config", config);
app.use(compression());
app.use(express.json({
    type() {
        return true;
    }
}));

// AWS Configuration
AWS.config.update({accessKeyId: app.get("config").awsAccessKeyId, secretAccessKey: app.get("config").awsSecretAccessKey});

// Setup console logging
const logger: Logger = getLogger();
if (app.get("config").serverEnv === "development") {
    logger.level = "debug";
} else {
    logger.level = "error";
}
app.set("logger", logger);

// Ensure response status error starts at 0 so that the middleware don't break
app.use((req, res, next) => {
    res.status(0);
    next();
});

/**
 * Primary app routes.
 */
app.use("/user", user);
app.use("/search", requireAuth, search)

/**
 * Final Success Handler
 * This will pass requests with no status set to the 404 handler
 */
app.use(successHandler);

/**
 * 404 Error Handler
 */
app.use(notFoundHandler);

/**
 * Error Passthrough
 * Sends back 500 Internal Server Error if catching error
 */
app.use(errorHandler);

export default app;
