import * as express from "express";
import * as compression from "compression";
import {Logger, getLogger} from "log4js";
import * as AWS from "aws-sdk";
import {join} from "path";
import {existsSync, mkdirSync} from "fs";

import api from "./api";
import {loadConfig} from "./config";
import {ResponseCodes} from "./models/util/response/responseCodes";
import {ZipState} from "./models/util/global/zipStateModel";
import {LastDownload} from "./models/util/global/lastDownloadModel";
import {performZipCleanup} from "./util/zipCleanup";

// Create Express server
const app: express.Application = express();

// Express configuration
const config = loadConfig();
app.set("config", config);
// Load Resume State
app.set("zipStateMap", new Map<string, ZipState>());
// Create Resume Zip Directory
if (!existsSync(join(process.cwd(), app.get("config").zipDirectory))) {
    mkdirSync(join(process.cwd(), app.get("config").zipDirectory));
}
// Load User Download State for Rate Limiting
app.set("lastDownloadMap", new Map<string, LastDownload>());

// Set middleware
app.use(compression());
app.use(express.json({limit: "200kb"}));

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

// Start Cleanup interval task
performZipCleanup(logger, app.get("zipStateMap"), app.get("config").zipDirectory);
setInterval(() => {
    performZipCleanup(logger, app.get("zipStateMap"), app.get("config").zipDirectory);
}, app.get("config").zipDirectoryCleanupInterval);

/**
 * Paths
 */
app.use("/api", api)

/**
 * Log successful client retrieval
 */
app.use((req, res, next) => {
    if (req.originalUrl === "/") {
        logger.info(req.method + " " + req.originalUrl + ": Retrieve Client");
    }
    next();
});

/**
 * Serve static react client
 */
app.use(express.static(join(__dirname, "../client/build/")));

/**
 * 404 Redirect to react client
 */
app.use((req, res) => {
    logger.warn(req.method + " " + req.originalUrl + ": 404 Not Found");
    res.status(ResponseCodes.FOUND);
    res.redirect("/");
});


export default app;
