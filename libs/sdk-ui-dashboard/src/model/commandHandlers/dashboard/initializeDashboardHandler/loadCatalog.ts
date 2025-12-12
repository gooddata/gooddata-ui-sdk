// (C) 2021-2025 GoodData Corporation
import { type IWorkspaceCatalog, type IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import { type CatalogItemType, type DateAttributeGranularity, idRef } from "@gooddata/sdk-model";

import { type InitializeDashboard } from "../../../commands/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

const SupportedCatalogGranularity: DateAttributeGranularity[] = [
    "GDC.time.day_in_week",
    "GDC.time.day_in_month",
    "GDC.time.day_in_quarter",
    "GDC.time.day_in_year",
    "GDC.time.week_in_quarter",
    "GDC.time.week_in_year",
    "GDC.time.month_in_quarter",
    "GDC.time.month_in_year",
    "GDC.time.quarter_in_year",
];

export function loadCatalog(ctx: DashboardContext, cmd: InitializeDashboard): Promise<IWorkspaceCatalog> {
    const { backend, workspace } = ctx;
    const availability = cmd.payload.config?.objectAvailability;

    const metricTypes: CatalogItemType[] = backend.capabilities.supportsKpiWidget ? ["fact", "measure"] : [];
    const options: IWorkspaceCatalogFactoryOptions = {
        excludeTags: (availability?.excludeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        includeTags: (availability?.includeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        types: ["attribute", ...metricTypes, "dateDataset", "attributeHierarchy"],
        includeDateGranularities: SupportedCatalogGranularity,
        loadGroups: false,
    };

    return backend.workspace(workspace).catalog().withOptions(options).load();
}
