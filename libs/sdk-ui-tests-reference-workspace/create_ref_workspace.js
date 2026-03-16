#!/usr/bin/env node
// (C) 2021-2026 GoodData Corporation

import "./scripts/env.js";

process.stdout.write("Creating new ref workspace");
await import("./lib/create_tiger_workspace.js");
