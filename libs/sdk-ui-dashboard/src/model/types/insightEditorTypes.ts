// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

/**
 * Opens the insight of a widget on the dashboard. In edit mode Analytical Designer edits the insight,
 * in view mode it explores a copy of it.
 *
 * @alpha
 */
export interface IInsightEditorWidgetTarget {
    type: "widget";
    ref: ObjRef;
}

/**
 * Opens an insight that is not on the dashboard.
 *
 * @alpha
 */
export interface IInsightEditorInsightTarget {
    type: "insight";
    ref: ObjRef;
}

/**
 * Creates a new insight for the placeholder that the user dropped in the layout.
 *
 * @alpha
 */
export interface IInsightEditorPlaceholderTarget {
    type: "placeholder";
}

/**
 * Creates a new insight without a position in the layout.
 *
 * @alpha
 */
export interface IInsightEditorNewTarget {
    type: "new";
}

/**
 * What the embedded Analytical Designer opens.
 *
 * @alpha
 */
export type InsightEditorTarget =
    | IInsightEditorWidgetTarget
    | IInsightEditorInsightTarget
    | IInsightEditorPlaceholderTarget
    | IInsightEditorNewTarget;
