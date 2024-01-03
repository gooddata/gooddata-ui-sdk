// (C) 2020-2023 GoodData Corporation
import { all, call, CallEffect, SagaReturnType, select } from "redux-saga/effects";
import isNil from "lodash/isNil.js";
import {
    IDrillEvent,
    IDrillEventIntersectionElement,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import {
    idRef,
    ObjRef,
    areObjRefsEqual,
    insightId,
    IDrillToCustomUrl,
    IInsightWidget,
    IAttributeDisplayFormMetadataObject,
    isAttributeDescriptor,
    isAttributeElementsByValue,
    filterObjRef,
    IFilter,
    filterAttributeElements,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { DashboardContext } from "../../types/commonTypes.js";
import { PromiseFnReturnType } from "../../types/sagas.js";
import { SagaIterator } from "redux-saga";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { selectAnalyticalWidgetByRef } from "../../store/layout/layoutSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { getElementTitle } from "./getElementTitle.js";
import {
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
} from "../../../_staging/drills/drillingUtils.js";
import { DrillToCustomUrl } from "../../commands/drill.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectCatalogDateAttributes,
} from "../../store/catalog/catalogSelectors.js";
import groupBy from "lodash/groupBy.js";
import { DRILL_TO_URL_PLACEHOLDER } from "../../types/drillTypes.js";
import { selectFilterContextAttributeFilters } from "../../store/filterContext/filterContextSelectors.js";
import { query } from "../../store/_infra/queryCall.js";
import { queryWidgetFilters } from "../../queries/widgets.js";
import stringify from "json-stable-stringify";

interface IDrillToUrlPlaceholderReplacement {
    toBeReplaced: string;
    replacement: string;
    replaceGlobally?: boolean;
}

interface IDrillToUrlElement {
    identifier: string;
    elementTitle: string | null;
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

function isInRefList(list: ObjRef[], ref: ObjRef) {
    return list.some((itemRef) => areObjRefsEqual(itemRef, ref));
}

function findDrillIntersectionAttributeHeaderItem(
    drillIntersectionElements: IDrillEventIntersectionElement[],
    attributeRef: ObjRef,
) {
    const intersectionForAttribute = drillIntersectionElements.find(
        ({ header }) =>
            isAttributeDescriptor(header) && areObjRefsEqual(attributeRef, header.attributeHeader.formOf.ref),
    );

    if (intersectionForAttribute && isDrillIntersectionAttributeItem(intersectionForAttribute.header)) {
        return intersectionForAttribute.header.attributeHeaderItem;
    }

    return undefined;
}

export function* splitDFToLoadingAndMapping(
    attributesDisplayForms: IAttributeDisplayFormMetadataObject[],
    ctx: DashboardContext,
): SagaIterator<{
    displayFormsWithKnownValues: IAttributeDisplayFormMetadataObject[];
    displayFormForValueLoad: IAttributeDisplayFormMetadataObject[];
}> {
    if (ctx.backend.capabilities.supportsElementUris) {
        return {
            displayFormForValueLoad: attributesDisplayForms,
            displayFormsWithKnownValues: [],
        };
    }
    // in tiger there are no uris for attribute values, only primary values
    // we can't call collectLabelElements for date attributes because there are no date "elements", but we can use this values directly.

    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> = yield select(
        selectCatalogDateAttributes,
    );
    const dateAttributeRefs = dateAttributes.map((da) => da.attribute.ref);

    const { true: displayFormsWithKnownValues = [], false: displayFormForValueLoad = [] } = groupBy(
        attributesDisplayForms,
        (df) => isInRefList(dateAttributeRefs, df.attribute),
    );

    return {
        displayFormsWithKnownValues,
        displayFormForValueLoad,
    };
}

export function* loadAttributeElementsForDrillIntersection(
    drillIntersectionElements: IDrillEventIntersectionElement[],
    attributesDisplayForms: IAttributeDisplayFormMetadataObject[],
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlElement[]> {
    const splitDisplayForms: SagaReturnType<typeof splitDFToLoadingAndMapping> = yield call(
        splitDFToLoadingAndMapping,
        attributesDisplayForms,
        ctx,
    );
    const { displayFormsWithKnownValues, displayFormForValueLoad } = splitDisplayForms;

    const mappedElements = displayFormsWithKnownValues.reduce(
        (acc: IDrillToUrlElement[], { id: dfIdentifier, attribute }) => {
            const attributeHeaderItem = findDrillIntersectionAttributeHeaderItem(
                drillIntersectionElements,
                attribute,
            );
            if (!attributeHeaderItem) {
                return acc;
            }

            acc.push({
                identifier: dfIdentifier,
                elementTitle: attributeHeaderItem.uri,
            });
            return acc;
        },
        [],
    );

    const loadedElement: IDrillToUrlElement[] = yield all(
        displayFormForValueLoad.reduce((acc: CallEffect[], displayForm) => {
            const { id: dfIdentifier, attribute, ref: dfRef } = displayForm;

            const attributeHeaderItem = findDrillIntersectionAttributeHeaderItem(
                drillIntersectionElements,
                attribute,
            );
            if (!attributeHeaderItem) {
                return acc;
            }

            acc.push(call(loadElementTitle, dfRef, dfIdentifier, attributeHeaderItem.uri, ctx));

            return acc;
        }, []),
    );

    return [...mappedElements, ...loadedElement];
}

const encodeParameterIfSet = (parameter: string | undefined | null): string | undefined | null =>
    isNil(parameter) ? parameter : encodeURIComponent(parameter);

export function getAttributeDisplayForms(
    projectId: string,
    objRefs: ObjRef[],
    ctx: DashboardContext,
): Promise<IAttributeDisplayFormMetadataObject[]> {
    return ctx.backend.workspace(projectId).attributes().getAttributeDisplayForms(objRefs);
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

export function* getDashboardAttributeFilterReplacements(
    url: string,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const attributeFilterPlaceholders = getDashboardAttributeFilterPlaceholdersFromUrl(url);

    if (attributeFilterPlaceholders.length === 0) {
        return [];
    }

    const attributeFilters: ReturnType<typeof selectFilterContextAttributeFilters> = yield select(
        selectFilterContextAttributeFilters,
    );
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    return attributeFilterPlaceholders.map(
        ({ placeholder: toBeReplaced, ref, toBeEncoded }): IDrillToUrlPlaceholderReplacement => {
            const usedFilter = attributeFilters.find((filter) => {
                const df = catalogDisplayForms.get(filter.attributeFilter.displayForm);
                return df && areObjRefsEqual(idRef(df.id), ref);
            });

            const elements = usedFilter?.attributeFilter.attributeElements;
            const attributeElementsValues = isAttributeElementsByValue(elements)
                ? elements.values
                : elements?.uris ?? [];
            const isNegative = usedFilter?.attributeFilter.negativeSelection;

            const parsedFilter = usedFilter
                ? stringifyAttributeFilterSelection(attributeElementsValues, isNegative!)
                : undefined;

            const replacement = toBeEncoded ? encodeParameterIfSet(parsedFilter) : parsedFilter;

            return {
                toBeReplaced,
                replacement: replacement!,
            };
        },
    );
}

export function* getInsightAttributeFilterReplacements(
    url: string,
    widgetRef: ObjRef,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const attributeFilterPlaceholders = getInsightAttributeFilterPlaceholdersFromUrl(url);

    if (attributeFilterPlaceholders.length === 0) {
        return [];
    }

    const widgetFilters: IFilter[] = yield call(query, queryWidgetFilters(widgetRef));
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    return attributeFilterPlaceholders.map(
        ({ placeholder: toBeReplaced, ref, toBeEncoded }): IDrillToUrlPlaceholderReplacement => {
            const usedFilter = widgetFilters.find((filter) => {
                const filterRef = filterObjRef(filter);
                const df = filterRef && catalogDisplayForms.get(filterRef);
                return df && areObjRefsEqual(idRef(df.id), ref);
            });

            const elements = usedFilter ? filterAttributeElements(usedFilter) : undefined;
            const attributeElementsValues = isAttributeElementsByValue(elements)
                ? elements.values
                : elements?.uris ?? [];
            const isNegative = isNegativeAttributeFilter(usedFilter);

            const parsedFilter = usedFilter
                ? stringifyAttributeFilterSelection(attributeElementsValues, isNegative)
                : undefined;

            const replacement = toBeEncoded ? encodeParameterIfSet(parsedFilter) : parsedFilter;

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
    const widget: IInsightWidget = yield select(selectAnalyticalWidgetByRef(widgetRef));
    const insight: ReturnType<ReturnType<typeof selectInsightByRef>> = yield select(
        selectInsightByRef(widget.insight),
    );

    const replacements = [
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_PROJECT_ID, workspace),
        createIdentifierReplacement(
            DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_WORKSPACE_ID,
            workspace,
        ),
        createIdentifierReplacement(
            DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_DASHBOARD_ID,
            dashboardId,
        ),
        createIdentifierReplacement(DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_CLIENT_ID, clientId),
        createIdentifierReplacement(
            DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_DATA_PRODUCT_ID,
            dataProductId,
        ),
        createIdentifierReplacement(
            DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_INSIGHT_ID,
            insightId(insight!),
        ),
    ];

    if (customUrl.includes(DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_WIDGET_ID)) {
        return [
            ...replacements,
            createIdentifierReplacement(
                DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_WIDGET_ID,
                widget.identifier,
            ),
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

    const dashboardAttributeFilterReplacements: IDrillToUrlPlaceholderReplacement[] = yield call(
        getDashboardAttributeFilterReplacements,
        customUrl,
    );

    const insightAttributeFilterReplacements: IDrillToUrlPlaceholderReplacement[] = yield call(
        getInsightAttributeFilterReplacements,
        customUrl,
        widgetRef,
    );

    const missingReplacement = [
        ...attributeIdentifiersReplacements,
        ...dashboardAttributeFilterReplacements,
        ...insightAttributeFilterReplacements,
    ].find(({ replacement }) => replacement === undefined);

    if (missingReplacement) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Drill to custom URL unable to resolve missing parameter ${missingReplacement.toBeReplaced}`,
        );
    }

    const insightIdentifiersReplacements: IDrillToUrlPlaceholderReplacement[] = yield call(
        getInsightIdentifiersReplacements,
        customUrl,
        widgetRef,
        ctx,
    );

    const replacements = [
        ...attributeIdentifiersReplacements,
        ...dashboardAttributeFilterReplacements,
        ...insightAttributeFilterReplacements,
        ...insightIdentifiersReplacements,
    ];

    return applyReplacements(customUrl, replacements);
}

function stringifyAttributeFilterSelection(selection: (string | null)[], isNegative: boolean): string {
    return `${isNegative ? "NOT_IN" : "IN"}${stringify(selection)}`;
}
