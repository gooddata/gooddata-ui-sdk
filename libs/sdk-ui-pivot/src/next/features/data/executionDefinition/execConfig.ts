// (C) 2025 GoodData Corporation
import { IExecutionConfig } from "@gooddata/sdk-model";

import { IPivotTableExecutionDefinition } from "./types.js";

/**
 * Applies provided execution config to the execution definition.
 *
 * @internal
 */
export const applyExecConfigToExecutionDef =
    ({ execConfig }: { execConfig: IExecutionConfig }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        return { ...executionDefinition, executionConfig: execConfig };
    };
