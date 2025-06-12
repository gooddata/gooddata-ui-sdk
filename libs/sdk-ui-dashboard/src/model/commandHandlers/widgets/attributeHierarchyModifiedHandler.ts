// (C) 2023 GoodData Corporation

import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { DateAttributeGranularity, idRef } from "@gooddata/sdk-model";
import { IWorkspaceCatalog, IWorkspaceCatalogFactoryOptions } from "@gooddata/sdk-backend-spi";

import { DashboardContext, ObjectAvailabilityConfig } from "../../types/commonTypes.js";

import { PromiseFnReturnType } from "../../types/sagas.js";
import { catalogActions } from "../../store/catalog/index.js";
import { loadDateHierarchyTemplates } from "../dashboard/initializeDashboardHandler/loadDateHierarchyTemplates.js";
import { AttributeHierarchyModified } from "../../commands/index.js";

import { AttributeHierarchyModifiedEvent, attributeHierarchyModifiedEvent } from "../../events/insight.js";

import { selectObjectAvailabilityConfig } from "../../store/config/configSelectors.js";

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

function loadCatalog(
    ctx: DashboardContext,
    availability: ObjectAvailabilityConfig,
): Promise<IWorkspaceCatalog> {
    const { backend, workspace } = ctx;

    const options: IWorkspaceCatalogFactoryOptions = {
        excludeTags: (availability.excludeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        includeTags: (availability.includeObjectsWithTags ?? []).map((tag) => idRef(tag)),
        types: ["attribute", "fact", "measure", "dateDataset", "attributeHierarchy"],
        includeDateGranularities: SupportedCatalogGranularity,
        loadGroups: false,
    };

    return backend.workspace(workspace).catalog().withOptions(options).load();
}

export function* attributeHierarchyModifiedHandler(
    ctx: DashboardContext,
    cmd: AttributeHierarchyModified,
): SagaIterator<AttributeHierarchyModifiedEvent> {
    const { correlationId } = cmd;

    const availability: ReturnType<typeof selectObjectAvailabilityConfig> = yield select(
        selectObjectAvailabilityConfig,
    );

    const catalog: PromiseFnReturnType<typeof loadCatalog> = yield call(loadCatalog, ctx, availability);

    const dateHierarchyTemplates: PromiseFnReturnType<typeof loadDateHierarchyTemplates> = yield call(
        loadDateHierarchyTemplates,
        ctx,
    );

    yield put(
        catalogActions.setCatalogItems({
            attributes: catalog.attributes(),
            dateDatasets: catalog.dateDatasets(),
            facts: catalog.facts(),
            measures: catalog.measures(),
            attributeHierarchies: catalog.attributeHierarchies(),
            dateHierarchyTemplates,
        }),
    );

    return attributeHierarchyModifiedEvent(ctx, correlationId);
}
