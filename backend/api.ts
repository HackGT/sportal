import {Router} from "express";

// Auth
import requireAuth from "./middlewares/auth/verify";

// Controllers (route handlers)
import user from "./controllers/user";
import participant from "./controllers/participant";
import successHandler from "./middlewares/success/successHandler";

// Error handlers
import notFoundHandler from "./middlewares/error/notFoundHandler";
import errorHandler from "./middlewares/error/errorHandler";

const router = Router();

/**
 * Enable CORS
 */
router.use(function(req, res, next) {
    if (req.app.get("config").serverEnv === "development") {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

/**
 * Primary app routes.
 */
router.use("/user", user);
router.use("/participant", requireAuth, participant);

/**
 * Final Success Handler
 * This will pass requests with no status set to the 404 handler
 */
router.use(successHandler);

/**
 * 404 Error Handler
 */
router.use(notFoundHandler);

/**
 * Error Passthrough
 * Sends back 500 Internal Server Error if catching error
 */
router.use(errorHandler);


export default router;
