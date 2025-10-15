// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { areObjRefsEqual, isAttributeDescriptor, isMeasureDescriptor } from "@gooddata/sdk-model";

import { IDashboardDrillEvent } from "../../../types.js";
import { KeyDriverAnalysis } from "../../commands/drill.js";
import {
    DashboardKeyDriverAnalysisResolved,
    keyDriverAnalysisRequested,
    keyDriverAnalysisResolved,
} from "../../events/drill.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* keyDriverAnalysisHandler(
    ctx: DashboardContext,
    cmd: KeyDriverAnalysis,
): SagaIterator<DashboardKeyDriverAnalysisResolved> {
    const { drillDefinition, drillEvent, keyDriveItem } = cmd.payload;

    yield put(keyDriverAnalysisRequested(ctx, drillDefinition, drillEvent, keyDriveItem, cmd.correlationId));

    const localIdentifiers = loadLocalIdentifiers(drillEvent);
    // Load data
    const attribute = drillEvent.dataView.definition.attributes.find((a) => {
        return localIdentifiers.includes(a.attribute.localIdentifier);
    });
    const metric = drillEvent.dataView.definition.measures.find((m) => {
        return localIdentifiers.includes(m.measure.localIdentifier);
    });

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

    if (!from.attributeHeaderItem.normalizedValue) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Key drive analysis failed to resolve date attribute normalized value.`,
        );
    }
    if (!to.attributeHeaderItem.normalizedValue) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Key drive analysis failed to resolve date attribute normalized value.`,
        );
    }

    return keyDriverAnalysisResolved(
        ctx,
        cmd.payload.drillDefinition,
        cmd.payload.drillEvent,
        {
            metric,
            dateAttribute: dateAttribute.attribute.ref,
            range: [
                {
                    date: from.attributeHeaderItem.normalizedValue,
                    format: from.attributeHeader.format,
                    value: keyDriveItem.values[0],
                },
                {
                    date: to.attributeHeaderItem.normalizedValue,
                    format: to.attributeHeader.format,
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
                if (isAttributeDescriptor(header.header)) {
                    return header.header.attributeHeader.localIdentifier;
                }
                return null;
            })
            .filter(Boolean) as string[]) ?? []
    );
}
