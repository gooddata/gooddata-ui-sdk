// (C) 2019-2022 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    ActionsApi,
    ActionsApiInterface,
    ActionsApiCreateTabularExportRequest,
    ActionsApiGetTabularExportRequest,
    TabularExportResult,
    TabularExportRequest,
} from "./generated/export-json-api";

export const tigerExportClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);

export {
    ActionsApiInterface as ExportActionsApiInterface,
    ActionsApiCreateTabularExportRequest,
    TabularExportRequest,
    TabularExportResult,
    ActionsApiGetTabularExportRequest,
};
