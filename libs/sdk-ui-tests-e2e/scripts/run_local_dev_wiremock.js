#!/usr/bin/env node
// (C) 2021-2024 GoodData Corporation

/*
 * Starts Wiremock in Docker without recording
 * params:
 * --verbose - Verbose Wiremock
 * --proxy - Proxy to HOST specified in the .env file
 * --simulate-recording - Behave as if recording was enabled
 *
 * Required env variables:
 * HOST (optional, mandatory when --proxy given)
 */

import { spawn } from "child_process";

import "./env.js";
import {
    wiremockWait,
    wiremockMockLogRequests,
    wiremockStartRecording,
    wiremockSettings,
} from "./lib/wiremock.js";
import { recordingsPresent } from "./lib/recordings.js";

const wiremockHost = "localhost:8080";

async function main() {
    const verbose = process.argv.indexOf("--verbose") != -1;
    const proxy = process.argv.indexOf("--proxy") != -1;
    const simulateRecording = process.argv.indexOf("--simulate-recording") != -1;

    const { HOST } = process.env;

    if (proxy && !HOST) {
        process.stderr.write("In the proxy mode the HOST needs to be specified in the .env file.\n");
        return;
    }

    if (!recordingsPresent() && !proxy) {
        process.stderr.write("Recordings are missing. You can still run the backend in --proxy mode\n");
        return;
    }

    runWiremockDocker(HOST, verbose, proxy);

    await wiremockWait(wiremockHost);
    await wiremockSettings(wiremockHost);

    if (simulateRecording) {
        await wiremockStartRecording(wiremockHost, HOST);
    }
    await wiremockMockLogRequests(wiremockHost);
}

function runWiremockDocker(host, verbose, proxy) {
    const wiremockParams = [];
    const dockerParams = [];
    if (verbose) {
        wiremockParams.push("--verbose");
    }
    if (proxy) {
        wiremockParams.push(
            `--proxy-all=${host}`,
            "--extensions",
            "org.gooddata.extensions.ResponseHeadersTransformer,org.gooddata.extensions.RequestHeadersTransformer",
        );
        dockerParams.push("-e", `PROXY_HOST=${host}`);
    }

    const wiremockDockerProcess = spawn("docker", [
        "run",
        "-p",
        "8080:8080",
        ...dockerParams,
        "-v",
        `${process.env.PWD}/recordings/wiremock_extension/jar:/var/wiremock/extensions:ro`,
        "wiremock/wiremock:2.33.2",
        ...wiremockParams,
    ]);

    wiremockDockerProcess.stdout.on("data", (data) => {
        process.stdout.write(data);
    });
    wiremockDockerProcess.stderr.on("data", (data) => {
        process.stderr.write(data);
    });
}

main();
