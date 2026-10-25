// (C) 2007-2026 GoodData Corporation

import { type ActionCreatorWithPreparedPayload, createAction } from "@reduxjs/toolkit";

import { type IOpenAsReportUiConfig } from "@gooddata/sdk-ui";
import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import { ActionTypeKeys } from "../constants/actions.js";
import { type IPropertiesMetaState } from "../store/properties/properties_meta_state.js";

// The two creators taking IVisualizationProperties are annotated explicitly: the type is generic
// over a control-properties parameter whose DEFAULT (IDefaultControlProperties) sdk-ui-ext does
// not re-export, so the inferred createAction type cannot be named in the emitted declarations
// (TS2742). Writing the annotation keeps the reference unexpanded.
export const visualizationPropertiesChanged: ActionCreatorWithPreparedPayload<
    [properties: IVisualizationProperties, ignoreUndoRedo: boolean],
    { properties: IVisualizationProperties; ignoreUndoRedo: boolean },
    ActionTypeKeys.UI_VIS_PROPERTIES_CHANGED
> = createAction(
    ActionTypeKeys.UI_VIS_PROPERTIES_CHANGED,
    (properties: IVisualizationProperties, ignoreUndoRedo: boolean) => ({
        payload: { properties, ignoreUndoRedo },
    }),
);

// The merged properties can still carry the `totals` / `bucketType` riders the apply reducer
// routes into the buckets subtree — IVisualizationProperties' index signature covers them.
export const storeVisualizationProperties: ActionCreatorWithPreparedPayload<
    [
        newCurrentProperties: IVisualizationProperties | undefined,
        newMergedProperties: IVisualizationProperties | undefined,
    ],
    {
        newCurrentProperties: IVisualizationProperties | undefined;
        newMergedProperties: IVisualizationProperties | undefined;
    },
    ActionTypeKeys.STORE_VIS_PROPERTIES_CHANGED
> = createAction(
    ActionTypeKeys.STORE_VIS_PROPERTIES_CHANGED,
    (
        newCurrentProperties: IVisualizationProperties | undefined,
        newMergedProperties: IVisualizationProperties | undefined,
    ) => ({
        payload: { newCurrentProperties, newMergedProperties },
    }),
);

export const visualizationPropertiesMetaChanged = createAction(
    ActionTypeKeys.VIS_PROPERTIES_META_CHANGED,
    (newPropertiesMeta: IPropertiesMetaState) => ({ payload: newPropertiesMeta }),
);

// The payload is the pluggable visualization's initialProperties push, which wraps the
// properties as `{ supportedProperties }` — the shape both reducers read.
export const visualizationPropertiesInitialized: ActionCreatorWithPreparedPayload<
    [properties: { supportedProperties: IVisualizationProperties }],
    { supportedProperties: IVisualizationProperties },
    ActionTypeKeys.VIS_PROPERTIES_INITIALIZED
> = createAction(
    ActionTypeKeys.VIS_PROPERTIES_INITIALIZED,
    (properties: { supportedProperties: IVisualizationProperties }) => ({
        payload: properties,
    }),
);

export const openAsReportToggled = createAction(
    ActionTypeKeys.OPEN_AS_REPORT_TOGGLED,
    (openAsReportConfig: IOpenAsReportUiConfig) => ({ payload: openAsReportConfig }),
);

export const stackMeasures = createAction(ActionTypeKeys.STACK_MEASURES, (value: boolean) => ({
    payload: { value },
}));

export const stackToPercent = createAction(ActionTypeKeys.STACK_TO_PERCENT, (value: boolean) => ({
    payload: { value },
}));

export const toggleDualAxis = createAction(
    ActionTypeKeys.BUCKET_TOGGLE_DUAL_AXIS,
    (localIdentifier: string, value: boolean) => ({ payload: { localIdentifier, value } }),
);

export const logVisPropertiesTooLong = createAction(
    ActionTypeKeys.LOG_VIS_PROPERTIES_TOO_LONG,
    (propertiesLength: number) => ({ payload: { propertiesLength } }),
);

export type IVisualizationPropertiesChangedAction = ReturnType<typeof visualizationPropertiesChanged>;
export type IStoreVisualizationPropertiesAction = ReturnType<typeof storeVisualizationProperties>;
export type IToggleDualAxisAction = ReturnType<typeof toggleDualAxis>;
