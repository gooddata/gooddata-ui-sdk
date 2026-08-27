// (C) 2026 GoodData Corporation

import {
    type IWorkspaceReportsPersistence,
    InMemoryWorkspaceReportsService,
} from "@gooddata/sdk-backend-base";

function localStoragePersistence(workspace: string): IWorkspaceReportsPersistence | undefined {
    // Reading the accessor itself throws a SecurityError in opaque-origin sandboxed
    // frames and under storage-blocking privacy settings, so the probe is guarded too.
    let storage: Storage;
    try {
        if (typeof localStorage === "undefined") {
            return undefined;
        }
        storage = localStorage;
    } catch {
        return undefined;
    }

    const key = `gd.reports.${workspace}`;
    return {
        load: () => storage.getItem(key),
        save: (value) => storage.setItem(key, value),
    };
}

/**
 * Temporary implementation used until the backend entities (reportPageLayout, reportTemplate,
 * report) exist: serves the built-in report page layouts and persists created objects to
 * localStorage, scoped per workspace, so a UI built on the SPI works across page reloads.
 * Falls back to plain in-memory state where localStorage is unavailable.
 */
export class TigerWorkspaceReportsService extends InMemoryWorkspaceReportsService {
    constructor(workspace: string) {
        super(localStoragePersistence(workspace));
    }
}

// One service instance per workspace for the process lifetime. With localStorage the
// service reads persisted state through on every operation, so instances converge even
// across tabs; the cache only matters where no storage exists (node), and there the
// state is per-process scratch data for development, not tenant data.
const servicesByWorkspace = new Map<string, TigerWorkspaceReportsService>();

export function getTigerWorkspaceReportsService(workspace: string): TigerWorkspaceReportsService {
    let service = servicesByWorkspace.get(workspace);
    if (!service) {
        service = new TigerWorkspaceReportsService(workspace);
        servicesByWorkspace.set(workspace, service);
    }
    return service;
}
