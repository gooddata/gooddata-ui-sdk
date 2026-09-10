// (C) 2021-2026 GoodData Corporation

import { type IWorkspaceCatalog, type IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";
import {
    type CatalogItemType,
    type DateAttributeGranularity,
    type ICatalogComputedAttribute,
    idRef,
} from "@gooddata/sdk-model";

import { isComputedAttributesUnavailableError } from "../../../../_staging/catalog/computedAttributes.js";
import { type InitializeDashboard } from "../../../commands/dashboard.js";
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

export interface ILoadedCatalog {
    catalog: IWorkspaceCatalog;
    computedAttributes: ICatalogComputedAttribute[];
}

export async function loadCatalog(
    ctx: DashboardContext,
    cmd: InitializeDashboard,
    includeComputedAttributes: boolean,
): Promise<ILoadedCatalog> {
    const { backend, workspace } = ctx;
    const availability = cmd.payload.config?.objectAvailability;

    const metricTypes: CatalogItemType[] = backend.capabilities.supportsKpiWidget
        ? ["fact", "measure"]
        : ["measure"];
    const tagOptions: Pick<IWorkspaceCatalogFactoryOptions, "excludeTags" | "includeTags"> = {
        excludeTags: (availability?.excludeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        includeTags: (availability?.includeObjectsWithTags ?? []).map((tag) => idRef(tag)),
    };
    const options: IWorkspaceCatalogFactoryOptions = {
        ...tagOptions,
        types: ["attribute", ...metricTypes, "dateDataset", "attributeHierarchy"],
        includeDateGranularities: SupportedCatalogGranularity,
        loadGroups: false,
    };

    // The computed-attributes load is separate so it can never take the base catalog down with
    // it. It is skipped when the enableComputedAttributes setting is off: the backend then
    // refuses the listing outright (400), so nothing can be consumed anyway and asking would
    // only produce console noise. With the setting on, only an "unavailable" refusal (a race
    // with the setting being turned off, an older backend) degrades to none; a genuine failure
    // is rethrown so it is not silenced as an empty catalog.
    const loadComputedAttributes = async (): Promise<ICatalogComputedAttribute[]> => {
        if (!includeComputedAttributes) {
            return [];
        }
        try {
            const computedAttributesCatalog = await backend
                .workspace(workspace)
                .catalog()
                .withOptions({ ...tagOptions, types: ["computedAttribute"], loadGroups: false })
                .load();
            return computedAttributesCatalog.computedAttributes();
        } catch (error) {
            if (isComputedAttributesUnavailableError(error)) {
                return [];
            }
            throw error;
        }
    };

    const [catalog, computedAttributes] = await Promise.all([
        backend.workspace(workspace).catalog().withOptions(options).load(),
        loadComputedAttributes(),
    ]);

    return { catalog, computedAttributes };
}
