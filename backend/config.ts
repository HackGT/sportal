class Config {
    // Server Config
    public serverEnv: string = process.env.SERVER_ENV as string || "development";
    public serverPort: string = process.env.SERVER_PORT as string || "8080";
    public serverAdminApiKey: string = process.env.SERVER_ADMIN_API_KEY as string || "devTestKey";

    // Authentication Config
    public authExp: string = process.env.AUTH_EXP as string || "15m";
    public authSecret: string = process.env.AUTH_SECRET as string || "devTestSecret";

    // Database Config
    public databaseConnectionString: string = process.env.DB_CONNECTION_STRING as string;

    // Required Configurations
    public required: string[] = [
        this.databaseConnectionString
    ];
}

export function loadConfig(): Config {
    const config = new Config();
    for (let i = 0; i < config.required.length; i++) {
        if (!config.required[i]) {
            throw new Error("Unable to start server, you seem to be missing some configurations.");
        }
    }
    return config;
}
