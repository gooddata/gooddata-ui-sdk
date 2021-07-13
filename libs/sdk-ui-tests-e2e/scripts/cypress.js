#!/usr/bin/env node
// (C) 2021 GoodData Corporation

const { spawn, execSync } = require("child_process");

function runCypress(
    visual,
    appHost,
    mockServer,
    withAuthentication,
    filter = "",
    workspaceId = "",
    username = "",
    password = "",
) {
    process.stdout.write("Running cypress\n");

    const cypressProps = {
        CYPRESS_HOST: appHost,
        CYPRESS_WORKSPACE: workspaceId,
    };

    if (withAuthentication) {
        console.log("Setting up USERNAME with", username);
        cypressProps["CYPRESS_USERNAME"] = username;
        cypressProps["CYPRESS_PASSWORD"] = password;
    }

    if (mockServer) {
        cypressProps["CYPRESS_MOCK_SERVER"] = `http://${mockServer}`;
    }

    const args = [visual ? "open" : "run"];
    if (filter !== "") {
        args.push("--spec", `./**/*${filter}*`);
    }

    execSync(`rm -rf cypress/results`);

    const cypressProcess = spawn("cypress", args, {
        env: {
            ...process.env,
            ...cypressProps,
        },
    });

    cypressProcess.stdout.on("data", (data) => {
        process.stdout.write(data);
    });
    cypressProcess.stderr.on("data", (data) => {
        process.stderr.write(data);
    });
    return cypressProcess;
}

module.exports = {
    runCypress,
};
