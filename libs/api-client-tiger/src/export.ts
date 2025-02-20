// (C) 2019-2025 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    ActionsApi,
    ActionsApiInterface,
    TabularExportRequest,
    RawExportRequest,
    TabularExportRequestFormatEnum,
    RawExportRequestFormatEnum,
    Settings,
    CustomOverride,
    CustomLabel,
    CustomMetric,
    VisualExportRequest,
    PdfTableStyle,
    PdfTableStyleProperty,
} from "./generated/export-json-api/index.js";

export const tigerExportClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);

export type {
    ActionsApiInterface as ExportActionsApiInterface,
    TabularExportRequest as TabularExportActionsRequest,
    RawExportRequest as RawExportActionsRequest,
    VisualExportRequest as VisualExportActionsRequest,
    Settings as ExportActionsSettings,
    CustomOverride as ExportActionsCustomOverride,
    CustomLabel as ExportActionsCustomLabel,
    CustomMetric as ExportActionsCustomMetric,
    PdfTableStyle as ExportActionsPdfTableStyle,
    PdfTableStyleProperty as ExportActionsPdfTableStyleProperty,
};
export {
    TabularExportRequestFormatEnum as TabularExportActionsRequestFormatEnum,
    RawExportRequestFormatEnum as RawExportActionsRequestFormatEnum,
};
