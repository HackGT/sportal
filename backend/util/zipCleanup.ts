import {readdirSync, unlink} from "fs";
import {join} from "path";
import {Logger} from "log4js";

import {ZipState} from "../models/util/global/zipStateModel";

export function performZipCleanup(logger: Logger, zipStateMap: Map<string, ZipState>, zipDirectory: string) {
    logger.warn("CLEANING UP DIRECTORY " + zipDirectory + "...");
    const saveFiles = new Set<string>();
    const now = Date.now();
    zipStateMap.forEach((zipState, id, map) => {
        if (now < zipState.expires) {
            saveFiles.add("resumes-bulk-" + id + ".zip");
        } else {
            map.delete(id);
        }
    });
    const targetDir = join(process.cwd(), zipDirectory);
    readdirSync(targetDir).forEach((file) => {
        if (!saveFiles.has(file)) {
            unlink(join(targetDir, file), (err) => {
                if (err) {
                    logger.error("UNABLE TO DELETE FILE " + file + ", ERROR: " + String(err));
                }
            });
        }
    });
}