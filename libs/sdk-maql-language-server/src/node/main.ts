// (C) 2021-2026 GoodData Corporation

import * as process from "process";

import { type Connection, ProposedFeatures, createConnection } from "vscode-languageserver/node.js";

import { TigerTokenAuthProvider, tigerFactory } from "@gooddata/sdk-backend-tiger";

import { startServer } from "../maqlServer.js";
import { MetadataService } from "../metadataService.js";

const connection: Connection = createConnection(ProposedFeatures.all);

connection.tracer.log("Connected to the MAQL language server");

const endpoint: string = process.env["TIGER_ENDPOINT"] ?? "http://localhost:3000";
const workspaceId: string = process.env["TIGER_WORKSPACE_ID"] ?? "demo";
const apiToken: string = process.env["TIGER_API_TOKEN"] ?? "YWRtaW46Ym9vdHN0cmFwOmFkbWluMTIz";

// The standalone Node entry is its own host, so building a backend here is legitimate — this is
// the one place in the package that owns authentication.
const backend = tigerFactory(undefined, { packageName: "@gooddata/sdk-maql-language-server" })
    .onHostname(endpoint)
    .withAuthentication(new TigerTokenAuthProvider(apiToken));

const metadataService = MetadataService.withBackend(workspaceId, backend);

startServer(connection, metadataService);
