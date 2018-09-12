import * as express from "express";
import * as compression from "compression";
import {Logger, getLogger} from "log4js";

import {loadConfig} from "./config";
import notFoundHandler from "./middlewares/error/notFoundHandler";
import errorHandler from "./middlewares/error/errorHandler";

// Controllers (route handlers)
import userController from "./controllers/user";
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

// Setup console logging
const logger: Logger = getLogger();
if (app.get("config").serverEnv === "development") {
    logger.level = "debug";
} else {
    logger.level = "error";
}
app.set("logger", logger);

/**
 * Primary app routes.
 */
app.use("/user", userController);

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
