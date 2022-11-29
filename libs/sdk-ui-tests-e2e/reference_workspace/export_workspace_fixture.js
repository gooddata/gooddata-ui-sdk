#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import "../scripts/env.js";

const { SDK_BACKEND } = process.env;

process.stdout.write(`Starting to export fixture for backend: ${SDK_BACKEND}\n`);
if (SDK_BACKEND === "TIGER") {
    await import("./lib/export_tiger_workspace_fixture.js");
} else if (SDK_BACKEND === "BEAR") {
    await import("./lib/export_bear_workspace_fixture.js");
} else {
    process.stderr.write(`Not supported backend: ${SDK_BACKEND}\n`);
}
