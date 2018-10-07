import * as uuid from "uuid/v4";

class Config {
    // Server Config
    public serverEnv: string = process.env.SERVER_ENV as string || "development";
    public serverPort: string = process.env.SERVER_PORT as string || "8080";
    public serverAdminApiKey: string = process.env.SERVER_ADMIN_API_KEY as string || "devTestKey";

    // Authentication Config
    public authExp: string = process.env.AUTH_EXP as string || "15m";
    public authSecret: string = process.env.AUTH_SECRET as string || "devTestSecret";

    // Database Config
    public databaseConnectionString: string = process.env.POSTGRES_URL as string;

    // AWS SDK
    public awsAccessKeyId: string = process.env.AWS_ACCESS_KEY_ID as string;
    public awsSecretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY as string;
    public awsSignedUrlExpires: number = parseInt(process.env.AWS_SIGNED_URL_EXPIRES as string, 10) || 60;
    public awsResumeBucket: string = process.env.AWS_RESUME_BUCKET as string;
    public awsRegion: string = process.env.AWS_REGION as string;

    // Resume Zipping
    public zlibCompressionLevel: number = 1;
    public zipExpires: number = parseInt(process.env.ZIP_EXPIRES as string, 10) || 55 * 60 * 1000; // 55m
    public zipUUIDNamespace: string = uuid();

    // Bulk Download
    public bulkDownloadLimit: number = parseInt(process.env.BULK_DOWNLOAD_LIMIT as string, 10) || 1000; // Once per second

    // Required Configurations
    public required: string[] = [
        this.databaseConnectionString,
        this.awsAccessKeyId,
        this.awsSecretAccessKey,
        this.awsResumeBucket,
        this.awsRegion
    ];
    public requiredProd: string[] = [
        this.serverAdminApiKey,
        this.authSecret,
    ];
}

export function loadConfig(): Config {
    const config = new Config();
    for (let i = 0; i < config.required.length; i++) {
        if (!config.required[i]) {
            throw new Error("Unable to start server, you seem to be missing some configurations.");
        }
    }
    if (config.serverEnv !== "development") {
        for (let i = 0; i < config.requiredProd.length; i++) {
            if (!config.required[i]) {
                throw new Error("Unable to start server, you seem to be missing some production configurations.");
            }
        }
    }
    return config;
}
