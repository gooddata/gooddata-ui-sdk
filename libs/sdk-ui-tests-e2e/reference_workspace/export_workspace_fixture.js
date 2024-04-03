#!/usr/bin/env node
// (C) 2021-2024 GoodData Corporation

import "../scripts/env.js";

process.stdout.write("Starting to export fixture");
await import("./lib/export_tiger_workspace_fixture.js");
