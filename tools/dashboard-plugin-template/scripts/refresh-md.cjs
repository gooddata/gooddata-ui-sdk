#!/usr/bin/env node
// (C) 2022 GoodData Corporation

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.secrets") });

const workspace = process.env.WORKSPACE;
const hostname = process.env.BACKEND_URL;
const backend = "bear";

const output = "./src/md/full.ts";

process.argv.push(
    "--backend",
    backend,
    "--hostname",
    hostname,
    "--workspace-id",
    workspace,
    "--catalog-output",
    output,
);

require("@gooddata/catalog-export");
