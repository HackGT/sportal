import * as express from "express";
import * as compression from "compression";
import {Logger, getLogger} from "log4js";
import * as AWS from "aws-sdk";
import {join} from "path";

import api from "./api";
import {loadConfig} from "./config";
import { ResponseCodes } from "./models/util/response/responseCodes";
// Create Express server
const app: express.Application = express();

// Express configuration
const config = loadConfig();
app.set("config", config);
app.use(compression());
app.use(express.json());

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

app.use("/api", api)

/**
 * Serve static react client
 */
app.use(express.static(join(__dirname, "../client/build")));

/**
 * 404 Redirect to react client
 */
app.use((req, res) => {
    res.status(ResponseCodes.FOUND);
    res.set("Location", req.hostname + "/");
});


export default app;
