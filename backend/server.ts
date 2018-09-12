import app from "./app";

/**
 * Start Express server.
 */
const server = app.listen(app.get("config").serverPort, () => {
  console.log(
    "App is running at http://localhost:%d in %s mode",
    app.get("config").serverPort,
    app.get("config").serverEnv
  );
  console.log("Press CTRL-C to stop\n");
});

export default server;
