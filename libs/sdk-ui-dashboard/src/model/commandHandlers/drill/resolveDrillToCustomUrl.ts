// (C) 2020-2021 GoodData Corporation
import { call, select, all, CallEffect, SagaReturnType } from "redux-saga/effects";
import {
    IDrillEvent,
    IDrillEventIntersectionElement,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import {
    isAttributeDescriptor,
    IAttributeDisplayFormMetadataObject,
    IDrillToCustomUrl,
    IInsightWidget,
} from "@gooddata/sdk-backend-spi";
import { idRef, ObjRef, areObjRefsEqual, insightId } from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes";
import { PromiseFnReturnType } from "../../types/sagas";
import { SagaIterator } from "redux-saga";
import { selectDashboardId } from "../../store/meta/metaSelectors";
import { selectWidgetByRef } from "../../store/layout/layoutSelectors";
import { selectInsightByRef } from "../../store/insights/insightsSelectors";
import { getElementTitle } from "./getElementTitle";
import { getAttributeIdentifiersPlaceholdersFromUrl } from "../../../_staging/drills/drillingUtils";
import { DrillToCustomUrl } from "../../commands/drill";
import { invalidArgumentsProvided } from "../../events/general";

export enum DRILL_TO_URL_PLACEHOLDER {
    PROJECT_ID = "{project_id}",
    WORKSPACE_ID = "{workspace_id}",
    INSIGHT_ID = "{insight_id}",
    WIDGET_ID = "{widget_id}",
    DASHBOARD_ID = "{dashboard_id}",
    CLIENT_ID = "{client_id}",
    DATA_PRODUCT_ID = "{data_product_id}",
}

interface IDrillToUrlPlaceholderReplacement {
    toBeReplaced: string;
    replacement: string;
    replaceGlobally?: boolean;
}

interface IDrillToUrlElement {
    identifier: string;
    elementTitle: string;
}

export function* loadElementTitle(
    dfRef: ObjRef,
    dfIdentifier: string,
    attrElementUri: string,
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlElement> {
    const elementTitle: PromiseFnReturnType<typeof getElementTitle> = yield call(
        getElementTitle,
        ctx.workspace,
        dfRef,
        attrElementUri,
        ctx,
    );
    return {
        identifier: dfIdentifier,
        elementTitle,
    };
}

export function* loadAttributeElementsForDrillIntersection(
    drillIntersectionElements: IDrillEventIntersectionElement[],
    attributesDisplayForms: IAttributeDisplayFormMetadataObject[],
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlElement[]> {
    const elements: IDrillToUrlElement[] = yield all(
        attributesDisplayForms.reduce((acc: CallEffect[], displayForm) => {
            const { id: dfIdentifier, attribute, ref: dfRef } = displayForm;

            const intersectionForAttribute = drillIntersectionElements.find(
                ({ header }) =>
                    isAttributeDescriptor(header) &&
                    areObjRefsEqual(attribute, header.attributeHeader.formOf.ref),
            );

            if (!intersectionForAttribute) {
                return acc;
            }

            if (!isDrillIntersectionAttributeItem(intersectionForAttribute.header)) {
                return acc;
            }

            acc.push(
                call(
                    loadElementTitle,
                    dfRef,
                    dfIdentifier,
                    intersectionForAttribute.header.attributeHeaderItem.uri,
                    ctx,
                ),
            );

            return acc;
        }, []),
    );

    return elements;
}

const encodeParameterIfSet = (parameter: string | undefined): string | undefined =>
    parameter === undefined ? parameter : encodeURIComponent(parameter);

export async function getAttributeDisplayForms(
    projectId: string,
    objRefs: ObjRef[],
    ctx: DashboardContext,
): Promise<IAttributeDisplayFormMetadataObject[]> {
    return await ctx.backend.workspace(projectId).attributes().getAttributeDisplayForms(objRefs);
}

export function* getAttributeIdentifiersReplacements(
    url: string,
    drillIntersectionElements: IDrillEventIntersectionElement[],
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const attributeIdentifiersPlaceholders = getAttributeIdentifiersPlaceholdersFromUrl(url);

    if (attributeIdentifiersPlaceholders.length === 0) {
        return [];
    }

    const displayForms: PromiseFnReturnType<typeof getAttributeDisplayForms> = yield call(
        getAttributeDisplayForms,
        ctx.workspace,
        attributeIdentifiersPlaceholders.map((placeholder) => idRef(placeholder.identifier)),
        ctx,
    );

    const elements: SagaReturnType<typeof loadAttributeElementsForDrillIntersection> = yield call(
        loadAttributeElementsForDrillIntersection,
        drillIntersectionElements,
        displayForms,
        ctx,
    );

    return attributeIdentifiersPlaceholders.map(
        ({ placeholder: toBeReplaced, identifier, toBeEncoded }): IDrillToUrlPlaceholderReplacement => {
            const elementTitle = elements.find(
                (element: IDrillToUrlElement) => element.identifier === identifier,
            )?.elementTitle;
            const replacement = toBeEncoded ? encodeParameterIfSet(elementTitle) : elementTitle;

            return {
                toBeReplaced,
                replacement: replacement!,
            };
        },
    );
}

const createIdentifierReplacement = (
    toBeReplaced: DRILL_TO_URL_PLACEHOLDER,
    replacement = "",
): IDrillToUrlPlaceholderReplacement => ({ toBeReplaced, replacement, replaceGlobally: true });

export function* getInsightIdentifiersReplacements(
    customUrl: string,
    widgetRef: ObjRef,
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const { workspace, clientId, dataProductId } = ctx;
    const dashboardId: ReturnType<typeof selectDashboardId> = yield select(selectDashboardId);
    const widget: IInsightWidget = yield select(selectWidgetByRef(widgetRef));
    const insight: ReturnType<ReturnType<typeof selectInsightByRef>> = yield select(
        selectInsightByRef(widget.insight),
    );

    const replacements = [
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.PROJECT_ID, workspace),
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.WORKSPACE_ID, workspace),
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.DASHBOARD_ID, dashboardId),
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.CLIENT_ID, clientId),
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.DATA_PRODUCT_ID, dataProductId),
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.INSIGHT_ID, insightId(insight!)),
    ];

    if (customUrl.includes(DRILL_TO_URL_PLACEHOLDER.WIDGET_ID)) {
        return [
            ...replacements,
            createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.WIDGET_ID, widget.identifier),
        ];
    }

    return replacements;
}

const applyReplacements = (url: string, replacements: IDrillToUrlPlaceholderReplacement[]) =>
    replacements.reduce(
        (customUrlWithReplacedPlaceholders, { toBeReplaced, replacement, replaceGlobally }) =>
            customUrlWithReplacedPlaceholders.replace(
                replaceGlobally ? new RegExp(toBeReplaced, "g") : toBeReplaced,
                replacement,
            ),
        url,
    );

export function* resolveDrillToCustomUrl(
    drillConfig: IDrillToCustomUrl,
    widgetRef: ObjRef,
    event: IDrillEvent,
    ctx: DashboardContext,
    cmd: DrillToCustomUrl,
): SagaIterator<string> {
    const customUrl = drillConfig.target.url;

    const attributeIdentifiersReplacements: IDrillToUrlPlaceholderReplacement[] = yield call(
        getAttributeIdentifiersReplacements,
        customUrl,
        event.drillContext.intersection!,
        ctx,
    );

    const missingReplacement = attributeIdentifiersReplacements.find(
        ({ replacement }) => replacement === undefined,
    );

    if (missingReplacement) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Drill to custom URL unable to resolve missing paramter ${missingReplacement.toBeReplaced}`,
        );
    }

    const insightIdentifiersReplacements: IDrillToUrlPlaceholderReplacement[] = yield call(
        getInsightIdentifiersReplacements,
        customUrl,
        widgetRef,
        ctx,
    );

    const replacements = [...attributeIdentifiersReplacements, ...insightIdentifiersReplacements];

    const resolvedUrl = applyReplacements(customUrl, replacements);

    return resolvedUrl;
}
