// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import {
    type IDashboardAttributeFilter,
    areObjRefsEqual,
    isAttributeDescriptor,
    isMeasureDescriptor,
} from "@gooddata/sdk-model";

import { convertIntersectionToAttributeFilters } from "./common/intersectionUtils.js";
import { type IDashboardDrillEvent } from "../../../types.js";
import { type KeyDriverAnalysis } from "../../commands/drill.js";
import {
    type DashboardKeyDriverAnalysisResolved,
    keyDriverAnalysisRequested,
    keyDriverAnalysisResolved,
} from "../../events/drill.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { generateFilterLocalIdentifier } from "../../store/_infra/generators.js";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { selectWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { removeDateFilters, removeIgnoredWidgetFilters } from "../../utils/widgetFilters.js";

export function* keyDriverAnalysisHandler(
    ctx: DashboardContext,
    cmd: KeyDriverAnalysis,
): SagaIterator<DashboardKeyDriverAnalysisResolved> {
    const { drillDefinition, drillEvent, keyDriveItem, filters: availableFilters } = cmd.payload;

    yield put(keyDriverAnalysisRequested(ctx, drillDefinition, drillEvent, keyDriveItem, cmd.correlationId));

    const localIdentifiers = loadLocalIdentifiers(drillEvent);
    // Load data
    const attribute = drillEvent.dataView.definition.attributes.find((a) => {
        return localIdentifiers.includes(a.attribute.localIdentifier);
    });

    const metric = drillEvent.dataView.definition.measures.find((m) => {
        return localIdentifiers.includes(m.measure.localIdentifier);
    });
    const metrics = drillEvent.dataView.definition.measures.filter((m) => m !== metric);

    // Attributes that are used
    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> =
        yield select(selectCatalogDateAttributes);
    const dateAttribute = dateAttributes.find((a) => {
        return attribute ? areObjRefsEqual(attribute.attribute.displayForm, a.defaultDisplayForm.ref) : false;
    });

    if (!metric || !dateAttribute) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Key drive analysis failed to resolve metric or date attribute.`,
        );
    }

    const [from, to] = keyDriveItem.range;

    if (!from.header.attributeHeaderItem.normalizedValue) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Key drive analysis failed to resolve date attribute normalized value.`,
        );
    }
    if (!to.header.attributeHeaderItem.normalizedValue) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Key drive analysis failed to resolve date attribute normalized value.`,
        );
    }

    const dateDataSetsAttributesRefs = dateAttributes.map((dateAttribute) => dateAttribute.attribute.ref);
    const drillIntersectionFilters = convertIntersectionToAttributeFilters(
        cmd.payload.drillEvent.drillContext.intersection ?? [],
        dateDataSetsAttributesRefs,
        true,
        0,
    );
    const intersectionFilters = drillIntersectionFilters.map(({ attributeFilter }, i) => {
        const { displayForm, attributeElements, negativeSelection, title } = attributeFilter.attributeFilter;

        const dashboardFilter: IDashboardAttributeFilter = {
            attributeFilter: {
                displayForm,
                attributeElements,
                negativeSelection,
                localIdentifier: generateFilterLocalIdentifier(displayForm, i),
                selectionMode: "multi",
                title,
            },
        };

        return dashboardFilter;
    });

    const widget = yield select(selectWidgetByRef(drillEvent.widgetRef));
    const attributeFilters = removeDateFilters(removeIgnoredWidgetFilters(availableFilters, widget!));

    const filters = mergeFilters(intersectionFilters, attributeFilters);

    return keyDriverAnalysisResolved(
        ctx,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        {
            metric: {
                ...metric,
                measure: {
                    ...metric.measure,
                    title: metric.measure.title ?? keyDriveItem.measure.measureHeaderItem.name,
                    format: metric.measure.format ?? keyDriveItem.measure.measureHeaderItem.format,
                },
            },
            metrics,
            filters,
            dateAttribute: dateAttribute.attribute.ref,
            range: [
                {
                    date: from.header.attributeHeaderItem.normalizedValue,
                    format: from.descriptor.attributeHeader.format,
                    value: keyDriveItem.values[0],
                },
                {
                    date: to.header.attributeHeaderItem.normalizedValue,
                    format: to.descriptor.attributeHeader.format,
                    value: keyDriveItem.values[1],
                },
            ],
            type: keyDriveItem.type === "comparative" ? "previous_period" : "same_period_previous_year",
        },
        cmd.correlationId,
    );
}

function loadLocalIdentifiers(drillEvent: IDashboardDrillEvent) {
    return (
        (drillEvent.drillContext.intersection
            ?.map((header) => {
                if (isMeasureDescriptor(header.header)) {
                    return header.header.measureHeaderItem.localIdentifier;
                }
                //NOTE: Only date attributes
                if (isAttributeDescriptor(header.header) && header.header.attributeHeader.granularity) {
                    return header.header.attributeHeader.localIdentifier;
                }
                return null;
            })
            .filter(Boolean) as string[]) ?? []
    );
}

function mergeFilters(
    intersectionFilters: IDashboardAttributeFilter[],
    attributeFilters: IDashboardAttributeFilter[],
): IDashboardAttributeFilter[] {
    const unusedFilters = intersectionFilters.filter((filter) => {
        return !attributeFilters.find((f) =>
            areObjRefsEqual(f.attributeFilter.displayForm, filter.attributeFilter.displayForm),
        );
    });

    return [
        ...attributeFilters.map((filter) => {
            const intersectionFilter = intersectionFilters.find((f) =>
                areObjRefsEqual(f.attributeFilter.displayForm, filter.attributeFilter.displayForm),
            );
            if (intersectionFilter) {
                return intersectionFilter;
            }
            return filter;
        }),
        ...unusedFilters,
    ];
}
