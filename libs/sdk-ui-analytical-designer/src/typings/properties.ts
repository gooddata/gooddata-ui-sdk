// (C) 2007-2026 GoodData Corporation

import { type ISortItem } from "@gooddata/sdk-model";

/**
 * The `controls` bag of the visualization properties — an open per-visualization record (each
 * pluggable visualization configures its own keys; sdk-ui-ext does not re-export its
 * IDefaultControlProperties, so the bag is typed as the open record it is).
 */
export type IVisualizationPropertiesControls = Record<string, unknown>;

/**
 * The visualization properties AD READS — structurally sdk-ui-ext's `IVisualizationProperties`,
 * declared here so that consumers can NAME it.
 *
 * The SDK's own type declares `controls: IDefaultControlProperties & ControlProperties`, and
 * `IDefaultControlProperties` is NOT on sdk-ui-ext's internal barrel. Any exported selector whose
 * type is INFERRED from a value of that type therefore cannot be written down without a path into
 * `node_modules/@gooddata/sdk-ui-ext/esm/...`, and `tsc` rejects it as non-portable (TS2742) —
 * which is the same reason `IVisualizationPropertiesControls` above exists.
 *
 * Assignable both ways with the SDK type, so the plug-viz boundary needs no conversion.
 */
export interface IStoredVisualizationProperties {
    sortItems?: ISortItem[];
    controls?: IVisualizationPropertiesControls;
    [property: string]: unknown;
}
