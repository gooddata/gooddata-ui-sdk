// (C) 2020-2026 GoodData Corporation

import stringify from "json-stable-stringify";
import { groupBy } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type CallEffect, type SagaReturnType, all, call, select } from "redux-saga/effects";

import {
    type DashboardAttributeFilterItem,
    type DashboardTextAttributeFilter,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardMeasureValueFilter,
    type IDrillToCustomUrl as IDrillToCustomUrlModel,
    type IFilter,
    type IInsightWidget,
    type IMeasureValueFilter,
    type MatchFilterOperator,
    type MeasureValueFilterCondition,
    type ObjRef,
    type TextAttributeFilter,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardFilterObjRef,
    filterAttributeElements,
    filterObjRef,
    idRef,
    insightFilters as insightDefinitionFilters,
    insightId,
    isArbitraryAttributeFilter,
    isAttributeDescriptor,
    isAttributeElementsByValue,
    isComparisonCondition,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardTextAttributeFilter,
    isIdentifierRef,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isRangeCondition,
    isTextAttributeFilter,
    isUriRef,
    measureValueFilterConditions,
    measureValueFilterMeasure,
} from "@gooddata/sdk-model";
import {
    type IDrillToUrlPlaceholder,
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getDashboardMeasureValueFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
    getInsightMeasureValueFilterPlaceholdersFromUrl,
} from "@gooddata/sdk-model/internal";
import {
    type IDrillEvent,
    type IDrillEventIntersectionElement,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";

import { type IDrillToCustomUrl } from "../../commands/drill.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { queryWidgetFilters } from "../../queries/widgets.js";
import { query } from "../../store/_infra/queryCall.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogMeasuresMap,
    selectCatalogDateAttributes,
} from "../../store/catalog/catalogSelectors.js";
import { selectEnableMeasureValueFilterKD } from "../../store/config/configSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectFilterContextAttributeFilterItems,
    selectFilterContextMeasureValueFilters,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { selectAnalyticalWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { DRILL_TO_URL_PLACEHOLDER } from "../../types/drillTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";
import {
    dashboardMeasureValueFilterMatchesIdentifier,
    insightMeasureValueFilterMatchesIdentifier,
} from "../../utils/measureValueFilterUtils.js";

import { getElementTitle, getElementsSecondaryTitles } from "./getElementTitle.js";

interface IDrillToUrlPlaceholderReplacement {
    toBeReplaced: string;
    replacement: string | undefined;
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

export function* loadSecondaryElementTitles(
    dfRef: ObjRef,
    attrElementValues: (string | null)[],
    ctx: DashboardContext,
): SagaIterator<Array<string | null>> {
    const elementsTitles: PromiseFnReturnType<typeof getElementsSecondaryTitles> = yield call(
        getElementsSecondaryTitles,
        ctx.workspace,
        dfRef,
        attrElementValues,
        ctx,
    );
    return elementsTitles;
}

function isInRefList(list: ObjRef[], ref: ObjRef) {
    return list.some((itemRef) => areObjRefsEqual(itemRef, ref));
}

/**
 * Tolerant ObjRef match used when resolving drill-to-URL placeholders against a drill intersection.
 *
 * The intersection comes from the execution result while the display-form metadata comes from the
 * metadata API; the two can describe the same object with refs that differ in shape (idRef vs uriRef)
 * or in `type`. The strict {@link areObjRefsEqual} then returns false and silently breaks
 * `attribute_title(...)` resolution. This compares by the underlying identifier/uri, ignoring those
 * representational differences.
 */
function refsMatchTolerant(a: ObjRef | undefined, b: ObjRef | undefined): boolean {
    if (!a || !b) {
        return false;
    }
    if (areObjRefsEqual(a, b)) {
        return true;
    }
    const keyOf = (ref: ObjRef): string | undefined =>
        isIdentifierRef(ref) ? ref.identifier : isUriRef(ref) ? ref.uri : undefined;
    const keyA = keyOf(a);
    return keyA !== undefined && keyA === keyOf(b);
}

/**
 * @internal
 */
export function findDrillIntersectionAttributeHeaderItem(
    drillIntersectionElements: IDrillEventIntersectionElement[],
    displayForm: IAttributeDisplayFormMetadataObject,
) {
    const intersectionForAttribute = drillIntersectionElements.find(({ header }) => {
        if (!isAttributeDescriptor(header)) {
            return false;
        }
        const { identifier, ref: labelRef, formOf } = header.attributeHeader;

        // A placeholder names a display form by identifier. Match that identifier string directly —
        // it is immune to ObjRef shape/type differences between the execution result and the
        // metadata API. Fall back to tolerant ref matches on the display form and its parent
        // attribute so a differently-labelled column on the same attribute still resolves.
        return (
            displayForm.id === identifier ||
            refsMatchTolerant(displayForm.ref, labelRef) ||
            refsMatchTolerant(displayForm.attribute, formOf.ref)
        );
    });

    if (intersectionForAttribute && isDrillIntersectionAttributeItem(intersectionForAttribute.header)) {
        const { attributeHeader } = intersectionForAttribute.header;

        // Tripwire: if the strict comparison the resolver relied on before (attribute ref equality)
        // would NOT have matched this element, the tolerant fallback / identifier match rescued it.
        // That means the execution result and the metadata API disagree on the attribute's ObjRef
        // representation — the drill still works, but the underlying (likely backend) mismatch should
        // be known and fixed at the source.
        if (!areObjRefsEqual(displayForm.attribute, attributeHeader.formOf.ref)) {
            console.warn(
                `Drill to custom URL: attribute "${displayForm.id}" matched the drill intersection only via a tolerant reference comparison; the execution result and metadata report different references for the same attribute.`,
                {
                    displayFormAttributeRef: displayForm.attribute,
                    intersectionAttributeRef: attributeHeader.formOf.ref,
                },
            );
        }

        return intersectionForAttribute.header.attributeHeaderItem;
    }

    // No matching attribute element in the intersection — the {attribute_title(...)} placeholder will
    // stay unresolved and the drill will fail with "Failed to load URL". Log what we looked for vs. what
    // the intersection actually carried, so the cause (cross-API ref differences, or a drilled column
    // that does not carry the referenced attribute) is diagnosable from the console alone.
    const intersectionAttributes = drillIntersectionElements
        .map(({ header }) => (isAttributeDescriptor(header) ? header.attributeHeader : undefined))
        .filter(
            (attributeHeader): attributeHeader is NonNullable<typeof attributeHeader> => !!attributeHeader,
        )
        .map((attributeHeader) => ({
            identifier: attributeHeader.identifier,
            ref: attributeHeader.ref,
            attribute: attributeHeader.formOf.ref,
        }));
    console.warn(
        `Drill to custom URL: attribute "${displayForm.id}" referenced by an attribute_title placeholder was not found in the drill intersection.`,
        {
            wanted: { id: displayForm.id, ref: displayForm.ref, attribute: displayForm.attribute },
            intersectionAttributes,
        },
    );

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

    const dateAttributes: ReturnType<typeof selectCatalogDateAttributes> =
        yield select(selectCatalogDateAttributes);
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

    const mappedElements = displayFormsWithKnownValues.reduce((acc: IDrillToUrlElement[], displayForm) => {
        const attributeHeaderItem = findDrillIntersectionAttributeHeaderItem(
            drillIntersectionElements,
            displayForm,
        );
        if (!attributeHeaderItem) {
            return acc;
        }

        acc.push({
            identifier: displayForm.id,
            elementTitle: attributeHeaderItem.uri,
        });
        return acc;
    }, []);

    const loadedElement: IDrillToUrlElement[] = yield all(
        displayFormForValueLoad.reduce((acc: CallEffect[], displayForm) => {
            const { id: dfIdentifier, ref: dfRef } = displayForm;

            const attributeHeaderItem = findDrillIntersectionAttributeHeaderItem(
                drillIntersectionElements,
                displayForm,
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
    parameter === null || parameter === undefined ? parameter : encodeURIComponent(parameter);

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

function* resolveDashboardAttributeFilterReplacement(
    { placeholder: toBeReplaced, ref }: IDrillToUrlPlaceholder,
    attributeFilters: DashboardAttributeFilterItem[],
    catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap>,
    attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides>,
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlPlaceholderReplacement> {
    // Check for text filters (arbitrary/match) first — they use different value structures.
    const textFilter = attributeFilters.find((filter) => {
        if (!isDashboardTextAttributeFilter(filter)) {
            return false;
        }
        const df = catalogDisplayForms.get(dashboardAttributeFilterItemDisplayForm(filter));
        return df && areObjRefsEqual(idRef(df.id), ref);
    });

    if (textFilter && isDashboardTextAttributeFilter(textFilter)) {
        const parsedFilter = stringifyTextFilterSelection(textFilter);
        const replacement = encodeParameterIfSet(parsedFilter);
        return {
            toBeReplaced,
            replacement: replacement!,
        };
    }

    // Standard (element-based) attribute filters
    const standardFilters = attributeFilters.filter(isDashboardAttributeFilter);

    let usedFilter = standardFilters.find((filter) => {
        const df = catalogDisplayForms.get(filter.attributeFilter.displayForm);
        return df && areObjRefsEqual(idRef(df.id), ref);
    });
    let attributeElementsValues = [];

    if (usedFilter) {
        const elements = usedFilter?.attributeFilter.attributeElements;
        attributeElementsValues = isAttributeElementsByValue(elements)
            ? elements.values
            : (elements?.uris ?? []);
    } else {
        const usedConfig = attributeFilterConfigs.find((config) => {
            return config.displayAsLabel && areObjRefsEqual(config.displayAsLabel, ref);
        });
        usedFilter = standardFilters.find((filter) => {
            return filter.attributeFilter.localIdentifier === usedConfig?.localIdentifier;
        });
        const elements = usedFilter?.attributeFilter.attributeElements;
        const primaryElementsValues = elements
            ? isAttributeElementsByValue(elements)
                ? elements.values
                : elements.uris
            : [];
        attributeElementsValues = yield call(loadSecondaryElementTitles, ref, primaryElementsValues, ctx);
    }

    const isNegative = usedFilter?.attributeFilter.negativeSelection;

    const parsedFilter = usedFilter
        ? stringifyAttributeFilterSelection(attributeElementsValues, isNegative!)
        : undefined;

    const replacement = encodeParameterIfSet(parsedFilter);

    return {
        toBeReplaced,
        replacement: replacement!,
    };
}

export function* getDashboardAttributeFilterReplacements(
    url: string,
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const attributeFilterPlaceholders = getDashboardAttributeFilterPlaceholdersFromUrl(url);

    if (attributeFilterPlaceholders.length === 0) {
        return [];
    }

    const attributeFilters: ReturnType<typeof selectFilterContextAttributeFilterItems> = yield select(
        selectFilterContextAttributeFilterItems,
    );
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    const attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides> = yield select(
        selectAttributeFilterConfigsOverrides,
    );

    return yield all(
        attributeFilterPlaceholders.map((placeholder) =>
            call(
                resolveDashboardAttributeFilterReplacement,
                placeholder,
                attributeFilters,
                catalogDisplayForms,
                attributeFilterConfigs,
                ctx,
            ),
        ),
    );
}

function resolveDashboardMeasureValueFilterReplacement(
    { placeholder: toBeReplaced, identifier }: IDrillToUrlPlaceholder,
    measureValueFilters: IDashboardMeasureValueFilter[],
    catalogMeasures: ReturnType<typeof selectAllCatalogMeasuresMap>,
): IDrillToUrlPlaceholderReplacement {
    const usedFilter = measureValueFilters.find((filter) => {
        const measureRef = dashboardFilterObjRef(filter)!;

        return dashboardMeasureValueFilterMatchesIdentifier(measureRef, identifier, catalogMeasures);
    });

    const parsedFilter = stringifyMeasureValueFilterCondition(
        usedFilter?.dashboardMeasureValueFilter.conditions,
    );
    const replacement = usedFilter ? encodeParameterIfSet(parsedFilter) : undefined;

    return {
        toBeReplaced,
        replacement: replacement!,
    };
}

export function* getDashboardMeasureValueFilterReplacements(
    url: string,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const measureValueFilterPlaceholders = getDashboardMeasureValueFilterPlaceholdersFromUrl(url);

    if (measureValueFilterPlaceholders.length === 0) {
        return [];
    }

    const measureValueFilters: ReturnType<typeof selectFilterContextMeasureValueFilters> = yield select(
        selectFilterContextMeasureValueFilters,
    );
    const catalogMeasures: ReturnType<typeof selectAllCatalogMeasuresMap> =
        yield select(selectAllCatalogMeasuresMap);

    return measureValueFilterPlaceholders.map((placeholder: IDrillToUrlPlaceholder) =>
        resolveDashboardMeasureValueFilterReplacement(placeholder, measureValueFilters, catalogMeasures),
    );
}

function resolveInsightMeasureValueFilterReplacement(
    { placeholder: toBeReplaced, identifier }: IDrillToUrlPlaceholder,
    measureValueFilters: IMeasureValueFilter[],
): IDrillToUrlPlaceholderReplacement {
    const usedFilter = measureValueFilters.find((filter) => {
        const measureRef = measureValueFilterMeasure(filter);
        return insightMeasureValueFilterMatchesIdentifier(measureRef, identifier);
    });

    const parsedFilter = stringifyMeasureValueFilterCondition(
        usedFilter ? measureValueFilterConditions(usedFilter) : undefined,
    );
    const replacement = usedFilter ? encodeParameterIfSet(parsedFilter) : undefined;

    return {
        toBeReplaced,
        replacement: replacement!,
    };
}

export function* getInsightMeasureValueFilterReplacements(
    url: string,
    widgetRef: ObjRef,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const measureValueFilterPlaceholders = getInsightMeasureValueFilterPlaceholdersFromUrl(url);

    if (measureValueFilterPlaceholders.length === 0) {
        return [];
    }

    const widget: IInsightWidget = yield select(selectAnalyticalWidgetByRef(widgetRef));
    const insight: ReturnType<ReturnType<typeof selectInsightByRef>> = yield select(
        selectInsightByRef(widget.insight),
    );
    const measureValueFilters = insight ? insightDefinitionFilters(insight).filter(isMeasureValueFilter) : [];

    return measureValueFilterPlaceholders.map((placeholder: IDrillToUrlPlaceholder) =>
        resolveInsightMeasureValueFilterReplacement(placeholder, measureValueFilters),
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
        ({ placeholder: toBeReplaced, ref }): IDrillToUrlPlaceholderReplacement => {
            const usedFilter = widgetFilters.find((filter) => {
                const filterRef = filterObjRef(filter);
                const df = filterRef && catalogDisplayForms.get(filterRef);
                return df && areObjRefsEqual(idRef(df.id), ref);
            });

            let parsedFilter: string | undefined;

            if (usedFilter && isTextAttributeFilter(usedFilter)) {
                parsedFilter = stringifyTextFilterSelection(usedFilter);
            } else if (usedFilter) {
                const elements = filterAttributeElements(usedFilter);
                const attributeElementsValues = isAttributeElementsByValue(elements)
                    ? elements.values
                    : (elements?.uris ?? []);
                const isNegative = isNegativeAttributeFilter(usedFilter);
                parsedFilter = stringifyAttributeFilterSelection(attributeElementsValues, isNegative);
            }

            const replacement = encodeParameterIfSet(parsedFilter);

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
                replacement!,
            ),
        url,
    );

export function* resolveDrillToCustomUrl(
    drillConfig: IDrillToCustomUrlModel,
    widgetRef: ObjRef,
    event: IDrillEvent,
    ctx: DashboardContext,
    cmd: IDrillToCustomUrl,
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
        ctx,
    );

    const insightAttributeFilterReplacements: IDrillToUrlPlaceholderReplacement[] = yield call(
        getInsightAttributeFilterReplacements,
        customUrl,
        widgetRef,
    );

    const dashboardMeasureValueFilterReplacements: IDrillToUrlPlaceholderReplacement[] = yield call(
        getDashboardMeasureValueFilterReplacements,
        customUrl,
    );

    const enableMeasureValueFilterKD: ReturnType<typeof selectEnableMeasureValueFilterKD> = yield select(
        selectEnableMeasureValueFilterKD,
    );
    const insightMeasureValueFilterReplacements: IDrillToUrlPlaceholderReplacement[] =
        enableMeasureValueFilterKD
            ? yield call(getInsightMeasureValueFilterReplacements, customUrl, widgetRef)
            : getInsightMeasureValueFilterPlaceholdersFromUrl(customUrl).map(({ placeholder }) => ({
                  toBeReplaced: placeholder,
                  replacement: undefined,
              }));

    const missingReplacements = [
        ...attributeIdentifiersReplacements,
        ...dashboardAttributeFilterReplacements,
        ...insightAttributeFilterReplacements,
        ...dashboardMeasureValueFilterReplacements,
        ...insightMeasureValueFilterReplacements,
    ].filter(({ replacement }) => replacement === undefined);

    if (missingReplacements.length > 0) {
        // Surface every unresolved placeholder (not just the first) and the URL, so a "Failed to load
        // URL" is diagnosable from the console without a debugger.
        console.warn(
            `Drill to custom URL: could not resolve parameter(s) ${missingReplacements
                .map(({ toBeReplaced }) => toBeReplaced)
                .join(", ")} in URL "${customUrl}". The drill cannot open.`,
        );
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Drill to custom URL unable to resolve missing parameter ${missingReplacements[0].toBeReplaced}`,
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
        ...dashboardMeasureValueFilterReplacements,
        ...insightMeasureValueFilterReplacements,
        ...insightIdentifiersReplacements,
    ];

    return applyReplacements(customUrl, replacements);
}

function stringifyAttributeFilterSelection(selection: (string | null)[], isNegative: boolean): string {
    return `${isNegative ? "NOT_IN" : "IN"}${stringify(selection)}`;
}

/**
 * @internal
 */
export function stringifyTextFilterSelection(
    filter: DashboardTextAttributeFilter | TextAttributeFilter,
): string {
    if (isDashboardArbitraryAttributeFilter(filter) || isArbitraryAttributeFilter(filter)) {
        const { values, negativeSelection } = filter.arbitraryAttributeFilter;
        return stringifyAttributeFilterSelection(values, negativeSelection ?? false);
    }
    const { literal, operator, negativeSelection } = filter.matchAttributeFilter;
    return stringifyMatchFilterSelection(literal, operator, negativeSelection ?? false);
}

const MATCH_OPERATOR_MAP: Record<MatchFilterOperator, string> = {
    contains: "CONTAINS",
    startsWith: "STARTS_WITH",
    endsWith: "ENDS_WITH",
};

function stringifyMatchFilterSelection(literal: string, operator: string, isNegative: boolean): string {
    const operatorStr = MATCH_OPERATOR_MAP[operator as MatchFilterOperator];
    const prefix = isNegative ? `NOT_${operatorStr}` : operatorStr;
    return `${prefix}${stringify([literal])}`;
}

/**
 * @internal
 */
export function stringifyMeasureValueFilterCondition(
    conditions: MeasureValueFilterCondition[] | undefined,
): string {
    if (!conditions || conditions.length === 0) {
        return "ALL";
    }

    return conditions
        .map((condition) => {
            if (isComparisonCondition(condition)) {
                return `${condition.comparison.operator}(${condition.comparison.value})`;
            }
            if (isRangeCondition(condition)) {
                return `${condition.range.operator}(${condition.range.from},${condition.range.to})`;
            }
            return "ALL";
        })
        .join("|");
}
