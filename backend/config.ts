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

    // GraphQL Config
    public graphqlRegistrationEndpoint: string = process.env.GRAPHQL_REGISTRATION_ENDPOINT as string
        || "https://registration.hack.gt/graphql";
    public graphqlRegistrationApiKey: string = process.env.GRAPHQL_REGISTRATION_API_KEY as string;
    public graphqlInternalPaginationN: number = 50;

    // AWS SDK
    public awsAccessKeyId: string = process.env.AWS_ACCESS_KEY_ID as string;
    public awsSecretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY as string;
    public awsSignedUrlExpires: number = Number(process.env.AWS_SIGNED_URL_EXPIRES) || 60;
    public awsResumeBucket: string = process.env.AWS_RESUME_BUCKET as string || "registration-hackgt5-uploads";

    // ZLIB
    public zlibCompressionLevel: number = 1;

    // Required Configurations
    public required: string[] = [
        this.databaseConnectionString,
        this.graphqlRegistrationApiKey,
        this.awsAccessKeyId,
        this.awsSecretAccessKey
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
