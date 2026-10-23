// (C) 2021-2026 GoodData Corporation

import { type Ref } from "react";

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IMetadataObject,
    type ISeparators,
    type IWorkspacePermissions,
} from "@gooddata/sdk-model";
import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { type FormField } from "../Form/data.js";
import { type CancelData, type SaveData } from "../hooks/useEditCallbacks.js";
import { type IMeasureDef, type IMeasureSetting } from "../metric/metricHelpers.js";

export enum SaveNameMode {
    save = "save",
    saveAsNew = "save_as_new",
}

export enum CancelMode {
    Continue = "continue",
    Cross = "cross",
    Cancel = "cancel",
}

export interface IEditMetricContentProps {
    metric: IMeasureDef;
    permissions: IWorkspacePermissions;
    setting?: IMeasureSetting;
    focusedField?: FormField;
    generateNewId?: boolean;
    saveMode?: SaveNameMode;
    usage?: IMeasureReferencing;
    onCancel: (value: CancelData) => void;
    onDelete: () => void;
    onSave: (value: SaveData) => Promise<void>;
    onDirtyChanged?: (dirty: boolean) => void;
    onValueChange?: (value: IMeasureDef, valid: boolean) => void;
    showCloseButton?: boolean;
    insightOpenType?: "external" | "internal";
    activeInsight?: IInsight;
    onInsightClick?: (object: IInsight) => void;
    metricOpenType?: "external" | "internal";
    onMetricClick?: (object: IMetadataObject) => void;
    ref?: Ref<IEditMetricContentApi | undefined>;
    isWhiteLabeled?: boolean;
    separators?: ISeparators;
    onSettingsChange?: (setting: Partial<IMeasureSetting>) => void;
    useReferences?: boolean;
    currencyFormatOverride?: string | null;
    enableMetricFormatOverrides?: boolean;
    /** Access drafted so far, kept by the tab. */
    draftAccess?: IObjectShareDraft;
    onDraftAccessChange?: (draftAccess: IObjectShareDraft | undefined) => void;
}

export interface IEditMetricContentApi {
    close: () => void;
    save: () => Promise<void>;
    saveForce: () => Promise<void>;
}
