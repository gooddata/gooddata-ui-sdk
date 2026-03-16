#!/usr/bin/env node
// (C) 2021-2026 GoodData Corporation

import "./scripts/env.js";

process.stdout.write("Delete ref workspace");
await import("./lib/delete_tiger_workspace.js");
