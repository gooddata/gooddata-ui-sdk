// (C) 2025 GoodData Corporation
import { type IPivotTableExecutionDefinition } from "./types.js";

/**
 * Applies provided workspace to the execution definition.
 *
 * @internal
 */
export const applyWorkspaceToExecutionDef =
    ({ workspace }: { workspace: string }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        return {
            ...executionDefinition,
            workspace,
        };
    };
