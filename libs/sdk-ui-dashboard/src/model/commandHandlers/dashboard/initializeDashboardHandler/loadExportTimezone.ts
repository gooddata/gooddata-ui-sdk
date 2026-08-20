// (C) 2026 GoodData Corporation

import { type DashboardContext } from "../../../types/commonTypes.js";

/**
 * Loads the explicit timezone stored with the export the dashboard is being rendered for (when
 * running in export mode, i.e. with `exportId` in the config).
 *
 * The export stores a timezone only when it cannot be derived at export time: an ad-hoc view-mode
 * override or a resolved browser-detected timezone. The value is applied as the timezone override
 * before the first widget executions so the headless render matches what the export was created
 * with. Undefined means the dashboard's own (or workspace/organization) timezone applies.
 */
export function loadExportTimezone(ctx: DashboardContext): Promise<string | undefined> {
    const { exportId, exportType } = ctx.config ?? {};

    if (!exportId) {
        return Promise.resolve(undefined);
    }

    return ctx.backend
        .workspace(ctx.workspace)
        .dashboards()
        .getExportDataByExportId(exportId, exportType)
        .then((exportMetadata) => exportMetadata?.timezoneId)
        .catch((error) => {
            console.error("Loading of the export timezone failed", error);
            return undefined;
        });
}
