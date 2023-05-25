// (C) 2019-2023 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    ActionsApi,
    ActionsApiInterface,
    ActionsApiCreateTabularExportRequest,
    ActionsApiGetTabularExportRequest,
    TabularExportRequest,
} from "./generated/export-json-api/index.js";

export const tigerExportClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);

export {
    ActionsApiInterface as ExportActionsApiInterface,
    ActionsApiCreateTabularExportRequest,
    TabularExportRequest,
    ActionsApiGetTabularExportRequest,
};
