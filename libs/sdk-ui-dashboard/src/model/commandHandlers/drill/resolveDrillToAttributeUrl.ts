// (C) 2020-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { IDrillToAttributeUrl, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    IDrillEvent,
    IDrillIntersectionAttributeItem,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";

import { getElementTitle } from "./getElementTitle.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";

function getDrillToAttributeUrlIntersectionAttributeItemHeader(
    drillConfig: IDrillToAttributeUrl,
    event: IDrillEvent,
): IDrillIntersectionAttributeItem {
    return event.drillContext.intersection!.find(
        (item) =>
            isDrillIntersectionAttributeItem(item.header) &&
            areObjRefsEqual(item.header.attributeHeader.ref, drillConfig.target.displayForm),
    )?.header as IDrillIntersectionAttributeItem;
}

export function* resolveDrillToAttributeUrl(
    drillConfig: IDrillToAttributeUrl,
    event: IDrillEvent,
    ctx: DashboardContext,
): SagaIterator<string | null | undefined> {
    const header = getDrillToAttributeUrlIntersectionAttributeItemHeader(drillConfig, event);
    if (!header) {
        return;
    }

    const url: PromiseFnReturnType<typeof getElementTitle> = yield call(
        getElementTitle,
        ctx.workspace,
        drillConfig.target.hyperlinkDisplayForm,
        header.attributeHeaderItem.uri,
        ctx,
    );

    return url;
}
