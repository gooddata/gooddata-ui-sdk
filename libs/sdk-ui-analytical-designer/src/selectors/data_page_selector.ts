// (C) 2021-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getWorkspaceRef } from "../utils/uri.js";

import { getProjectId } from "./bootstrap_selector.js";

export const getLinkToLoadDataPage = createSelector(
    getProjectId,
    (projectId) => `/admin/load/#/${getWorkspaceRef(true)}/${projectId}`,
);

export const getLinkToDatasourcePage = createSelector(
    getProjectId,
    (projectId) => `/admin/connect/#/${getWorkspaceRef(true)}/${projectId}/datasource`,
);
