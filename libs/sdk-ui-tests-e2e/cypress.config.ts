// (C) 2022-2025 GoodData Corporation

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import cypressGrepPlugin from "@cypress/grep/src/plugin";
import axios from "axios";
import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";

import parseXlsx from "./cypress/plugins/parseXlsx";
import readPdf from "./cypress/plugins/readPdf";
import removePassingTestVideosPlugin from "./cypress/plugins/removePassingTestVideos";

export default defineConfig({
    e2e: {
        excludeSpecPattern: "*.js",
        supportFile: "cypress/support/index.ts",
        setupNodeEvents(on, config) {
            removePassingTestVideosPlugin(on);
            cypressGrepPlugin(config);
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
            readPdf(on);
            parseXlsx(on);
            installLogsPrinter(on, {
                outputRoot: "cypress/results/",
                specRoot: "cypress/integration",
                outputTarget: {
                    "logs|txt": "txt",
                },
            });
            return config;
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
        reporter: "cypress-multi-reporters",
        reporterOptions: {
            reporterEnabled: "mocha-junit-reporter",
            mochaJunitReporterReporterOptions: {
                mochaFile: "cypress/results/[suiteFilename].xml",
            },
        },
        specPattern: "./cypress/integration/**/*.spec.ts",
    },
    scrollBehavior: false,
    video: true,
});
