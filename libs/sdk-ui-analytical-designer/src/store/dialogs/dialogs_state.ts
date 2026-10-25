// (C) 2026 GoodData Corporation

import { type ICatalogAttributeHierarchy, type ObjRef } from "@gooddata/sdk-model";

import { type IConfirmUnsavedChangesDialogActionPayloadData } from "../../actions/confirm_unsaved_changes_actions.js";
import { type ExportCsvMode } from "../../actions/export_report_actions.js";

export interface IDialogActiveState {
    active: boolean;
}

export interface IOpenReportConfirmationState {
    active: boolean;
    data: ObjRef | null;
}

export interface IDeleteReportConfirmationState {
    active: boolean;
    data: {
        insightRef: ObjRef;
        meta: { title: string };
    } | null;
}

export interface ISavingUntitledReportState {
    active: boolean;
    data?: {
        saveAsNew?: boolean;
        reOpenEmbedDialog?: boolean;
    };
}

export interface IExportCsvDialogState {
    active: boolean;
    mode: ExportCsvMode;
}

export interface IConfirmUnsavedChangesState {
    active: boolean;
    data: IConfirmUnsavedChangesDialogActionPayloadData | null;
}

export interface IAttributeHierarchyEditDialogState {
    active: boolean;
    data: ICatalogAttributeHierarchy | null;
}

export interface IDialogsState {
    openReportConfirmation: IOpenReportConfirmationState;
    deleteReportConfirmation: IDeleteReportConfirmationState;
    exportReport: IDialogActiveState;
    exportCsv: IExportCsvDialogState;
    exportPdf?: IDialogActiveState;
    savingUntitledReport: ISavingUntitledReportState;
    openSaveReportFromKD: IDialogActiveState;
    confirmUnsavedChanges: IConfirmUnsavedChangesState;
    openEmbedInsightDialog: IDialogActiveState;
    openAttributeHierarchyEditDialog: IAttributeHierarchyEditDialogState;
}

export const dialogsInitialState: IDialogsState = {
    openReportConfirmation: {
        active: false,
        data: null,
    },
    deleteReportConfirmation: {
        active: false,
        data: null,
    },
    exportReport: {
        active: false,
    },
    exportCsv: {
        active: false,
        mode: "formatted",
    },
    savingUntitledReport: {
        active: false,
    },
    openSaveReportFromKD: {
        active: false,
    },
    confirmUnsavedChanges: {
        active: false,
        data: null,
    },
    openEmbedInsightDialog: {
        active: false,
    },
    openAttributeHierarchyEditDialog: {
        active: false,
        data: null,
    },
};
