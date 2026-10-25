// (C) 2021-2026 GoodData Corporation

import { type ExplainConfig } from "@gooddata/sdk-backend-spi";
import { type IExecutionDefinition } from "@gooddata/sdk-model";

import { backend } from "../backend.js";

export async function explainDownload(
    explainExecDef: IExecutionDefinition,
    explainType: ExplainConfig<undefined> = {},
): Promise<void> {
    return backend
        .workspace(explainExecDef.workspace)
        .execution()
        .forDefinition(explainExecDef)
        .explain(explainType)
        .download()
        .then(() => window.location.replace(window.location.href.replace(/\/debug.*/, "/edit")));
}
