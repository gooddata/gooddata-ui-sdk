// (C) 2026 GoodData Corporation

import { type IExecutionState } from "../store/execution/execution_state.js";
import { type IObjectMeta } from "../typings/bear/bearTypes.js";
import { type IReport, type IReportContent } from "../typings/report.js";

/**
 * TYPED patching of the two `report` VALUES fixtures reach into below the branch: the current
 * execution and the MD object the save/compare currency is made of.
 *
 * `state_builder.test.helpers.ts` gets a fixture to `report.execution` and `report.lastSavedObject`;
 * these say what goes INSIDE one, in report terminology, over the real types.
 *
 * TEST-ONLY, and named so.
 */

/**
 * `execution.error` — the failure a selector reads. `error` is ABSENT-until-written on purpose and
 * every reader tests for presence, so this materializes the container rather than assuming one.
 */
export const withExecutionError = (
    execution: IExecutionState,
    patch: Partial<NonNullable<IExecutionState["error"]>>,
): IExecutionState => ({ ...execution, error: { ...execution?.error, ...patch } });

/** `visualizationObject.meta` — title, uri, identifier, the locked flag. */
export const withMdObjectMeta = (mdObject: IReport, patch: Partial<IObjectMeta>): IReport => ({
    ...mdObject,
    visualizationObject: {
        ...mdObject?.visualizationObject,
        meta: { ...mdObject?.visualizationObject?.meta, ...patch },
    },
});

/** `visualizationObject.content` — the buckets/filters/properties the report was saved with. */
export const withMdObjectContent = (mdObject: IReport, content: IReportContent | null): IReport => ({
    ...mdObject,
    visualizationObject: { ...mdObject?.visualizationObject, content },
});
