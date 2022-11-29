#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import "../scripts/env.js";

const { SDK_BACKEND } = process.env;

process.stdout.write(`Delete ref workspace for backend: ${SDK_BACKEND}\n`);
if (SDK_BACKEND === "TIGER") {
    await import("./lib/delete_tiger_workspace.js");
} else if (SDK_BACKEND === "BEAR") {
    await import("./lib/delete_bear_workspace.js");
} else {
    process.stderr.write(`Not supported backend: ${SDK_BACKEND}\n`);
}
