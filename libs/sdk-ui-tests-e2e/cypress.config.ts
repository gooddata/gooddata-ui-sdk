// (C) 2022 GoodData Corporation
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cypressGrepPlugin from "@cypress/grep/src/plugin";
import { defineConfig } from "cypress";
import axios from "axios";
import readPdf from "./cypress/plugins/readPdf";

export default defineConfig({
    e2e: {
        excludeSpecPattern: "*.js",
        supportFile: "cypress/support/index.ts",
        setupNodeEvents(on, _config) {
            cypressGrepPlugin(_config);
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
            readPdf(on, _config);
            return _config;
        },
        viewportWidth: 1400,
        viewportHeight: 800,
        defaultCommandTimeout: 30000,
        env: {
            grepFilterSpecs: true,
        },
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
        videoUploadOnPasses: false,
    },
    scrollBehavior: false,
    video: true,
});
