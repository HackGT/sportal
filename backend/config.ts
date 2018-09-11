class Config {
    // Server Config
    serverEnv: string = <string> process.env.SERVER_ENV || 'development'
    serverPort: string = <string> process.env.SERVER_PORT || '8080';
    serverAdminApiKey: string = <string> process.env.SERVER_ADMIN_API_KEY || 'devTestKey';

    // Authentication Config
    authExp: string = <string> process.env.AUTH_EXP || '15m';
    authSecret: string = <string> process.env.AUTH_SECRET || 'devTestSecret';

    // Database Config
    databaseConnectionString: string = <string> process.env.DB_CONNECTION_STRING;

    // Required Configurations
    required: string[] = [
        this.databaseConnectionString
    ];
}

export function loadConfig(): Config {
    const config = new Config();
    for (let i = 0; i < config.required.length; i++) {
        if (!config.required[i]) {
            throw new Error('Unable to start server, you seem to be missing some configurations.');
        }
    }
    return config;
}