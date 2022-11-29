// (C) 2022 GoodData Corporation
import { defineConfig } from "cypress";
import axios from "axios";

export default defineConfig({
    e2e: {
        excludeSpecPattern: "*.js",
        supportFile: "cypress/support/index.ts",
        setupNodeEvents(on, _config) {
            on("task", {
                async resetRecordingsScenarios(mockServerUrl: string) {
                    try {
                        const response = await axios.post(`${mockServerUrl}/__admin/scenarios/reset`);
                        return response.data;
                    } catch (e: any) {
                        if (e.code === "ECONNREFUSED") {
                            throw new Error("Cannot reach the Wiremock server. Make sure it's running");
                        }
                        throw e;
                    }
                },
                log(message: string) {
                    // eslint-disable-next-line no-console
                    console.log(message);
                    return null;
                },
            });
        },
        viewportWidth: 1400,
        viewportHeight: 800,
        defaultCommandTimeout: 30000,
        retries: {
            runMode: 2,
            openMode: 0,
        },
        trashAssetsBeforeRuns: false,
        reporter: "junit",
        reporterOptions: {
            mochaFile: "./cypress/results/result.[hash].xml",
        },
        specPattern: "./cypress/integration/**/*.spec.ts",
        video: true,
        videoUploadOnPasses: false,
    },
});
