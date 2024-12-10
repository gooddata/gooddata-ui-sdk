// (C) 2021-2024 GoodData Corporation
import { unlink } from "fs";
import { promisify } from "util";

const rm = promisify(unlink);

export default ((on, _config) => {
    const filesToDelete: string[] = [];
    on("after:spec", (_spec, results) => {
        if (results.stats.failures === 0 && results.video) {
            filesToDelete.push(results.video);
        }
    });
    on("after:run", async () => {
        // eslint-disable-next-line no-console
        console.log("Deleting %d videos from successful specs", filesToDelete.length);
        await Promise.all(filesToDelete.map((videoFile) => rm(videoFile)));
    });
}) as Cypress.PluginConfig;
