#!/usr/bin/env node
// (C) 2021 GoodData Corporation

const { spawn } = require("child_process");

async function main() {
    console.log("Process environment PWD", process.env.PWD);

    const editorNginxProcess = spawn("docker", [
        "run",
        "-p",
        "9500:9500",
        "-e NGINX_ENTRYPOINT_QUIET_LOGS=1",
        "-e BACKEND_HOST=staging3.intgdc.com",
        "-e BACKEND_URL=https://staging3.intgdc.com",
        "-v",
        `${process.env.PWD}/scenarios/build:/usr/share/nginx/html/gooddata-ui-sdk:ro`,
        "-v",
        `${process.env.PWD}/nginx/nginx.conf:/etc/nginx/nginx.conf:ro`,
        "-v",
        `${process.env.PWD}/nginx/proxy-isolated-tests-local.conf:/etc/nginx/extra-conf.d/proxy-isolated-tests-local.conf:ro`,
        "nginxinc/nginx-unprivileged:1.21.6-alpine",
    ]);

    editorNginxProcess.stdout.on("data", (data) => {
        process.stdout.write(data);
    });
    editorNginxProcess.stderr.on("data", (data) => {
        process.stderr.write(data);
    });
    process.stdout.write("Started Scenarios in Nginx\n");
}

main();
