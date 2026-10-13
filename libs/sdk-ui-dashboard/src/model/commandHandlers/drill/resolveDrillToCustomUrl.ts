// (C) 2020-2026 GoodData Corporation

import stringify from "json-stable-stringify";
import { groupBy } from "lodash-es";
import { type SagaIterator } from "redux-saga";
import { type CallEffect, type SagaReturnType, all, call, select } from "redux-saga/effects";

import {
    type DashboardAttributeFilterItem,
    type DashboardTextAttributeFilter,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardMeasureValueFilter,
    type IDrillToCustomUrl as IDrillToCustomUrlModel,
    type IInsightWidget,
    type IMeasureValueFilter,
    type MatchFilterOperator,
    type MeasureValueFilterCondition,
    type ObjRef,
    type TextAttributeFilter,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    dashboardFilterLocalIdentifier,
    dashboardMeasureValueFilterLocalIdentifier,
    filterAttributeElements,
    filterObjRef,
    insightFilters as insightDefinitionFilters,
    insightId,
    isArbitraryAttributeFilter,
    isAttributeDescriptor,
    isAttributeElementsByValue,
    isAttributeFilter,
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
    DRILL_TO_URL_PLACEHOLDER,
    type DrillUrlPlaceholderType,
    type IDrillToUrlPlaceholder,
    displayFormPlaceholderRef,
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getDashboardMeasureValueFilterPlaceholdersFromUrl,
    getDrillUrlPlaceholderTypes,
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
import {
    selectAllCatalogDisplayFormsMap,
    selectAllCatalogMeasuresMap,
    selectCatalogDateAttributes,
} from "../../store/catalog/catalogSelectors.js";
import { selectEnableMeasureValueFilterKD } from "../../store/config/configSelectors.js";
import { selectRestrictedDashboardFilterLocalIdentifiers } from "../../store/filtering/dashboardFilterSelectors.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { selectDashboardId } from "../../store/meta/metaSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectFilterContextAttributeFilterItems,
    selectFilterContextMeasureValueFilters,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { selectAnalyticalWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";
import { type PromiseFnReturnType } from "../../types/sagas.js";
import { resolveDisplayFormMetadata } from "../../utils/displayFormResolver.js";
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
    ref: ObjRef;
    elementTitle: string | null;
}

export function* loadElementTitle(
    dfRef: ObjRef,
    placeholderRef: ObjRef,
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
        ref: placeholderRef,
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
            ref: displayFormPlaceholderRef(displayForm),
            elementTitle: attributeHeaderItem.uri,
        });
        return acc;
    }, []);

    const loadedElement: IDrillToUrlElement[] = yield all(
        displayFormForValueLoad.reduce((acc: CallEffect[], displayForm) => {
            const attributeHeaderItem = findDrillIntersectionAttributeHeaderItem(
                drillIntersectionElements,
                displayForm,
            );
            if (!attributeHeaderItem) {
                return acc;
            }

            acc.push(
                call(
                    loadElementTitle,
                    displayForm.ref,
                    displayFormPlaceholderRef(displayForm),
                    attributeHeaderItem.uri,
                    ctx,
                ),
            );

            return acc;
        }, []),
    );

    return [...mappedElements, ...loadedElement];
}

const encodeParameterIfSet = (parameter: string | undefined | null): string | undefined | null =>
    parameter === null || parameter === undefined ? parameter : encodeURIComponent(parameter);

export function* getAttributeIdentifiersReplacements(
    url: string,
    drillIntersectionElements: IDrillEventIntersectionElement[],
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlPlaceholderReplacement[]> {
    const attributeIdentifiersPlaceholders = getAttributeIdentifiersPlaceholdersFromUrl(url);

    if (attributeIdentifiersPlaceholders.length === 0) {
        return [];
    }

    // The placeholder refs carry their own type, so this resolves a label through the labels API and a
    // computed attribute through the computedAttributes service - the labels API cannot describe one.
    // It reads the catalog first but falls back to loading, so a computed attribute that the catalog
    // does not carry (excluded by tags, or created after the dashboard was initialised) still resolves.
    const { resolved, missing }: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        attributeIdentifiersPlaceholders.map(({ ref }) => ref),
    );

    if (missing.length > 0) {
        console.warn(
            "Drill to custom URL: no metadata found for attributes referenced by attribute_title placeholders; those placeholders cannot be resolved.",
            { missing },
        );
    }

    const elements: SagaReturnType<typeof loadAttributeElementsForDrillIntersection> = yield call(
        loadAttributeElementsForDrillIntersection,
        drillIntersectionElements,
        [...resolved.values()],
        ctx,
    );

    return attributeIdentifiersPlaceholders.map(
        ({ placeholder: toBeReplaced, ref, toBeEncoded }): IDrillToUrlPlaceholderReplacement => {
            // Matched by reference, not by identifier alone: a computed attribute and a label can
            // share an identifier, and they must not resolve to each other's element titles.
            const elementTitle = elements.find((element: IDrillToUrlElement) =>
                areObjRefsEqual(element.ref, ref),
            )?.elementTitle;
            const replacement = toBeEncoded ? encodeParameterIfSet(elementTitle) : elementTitle;

            return {
                toBeReplaced,
                replacement: replacement!,
            };
        },
    );
}

/**
 * The filter a dashboard attribute filter placeholder names. A readable filter wins: a text filter with
 * the placeholder's label, then a list filter with it, then a list filter displayed by it. A restricted
 * filter matched in any of these ways is applied nowhere, so it filters nothing.
 */
export type DashboardAttributeFilterPlaceholderMatch =
    | { type: "text"; filter: DashboardTextAttributeFilter }
    | { type: "label"; filter: IDashboardAttributeFilter }
    | { type: "displayAsLabel"; filter: IDashboardAttributeFilter }
    | { type: "restricted" };

export function findDashboardAttributeFilterPlaceholderMatch(
    ref: ObjRef,
    attributeFilters: DashboardAttributeFilterItem[],
    restrictedLocalIdentifiers: ReadonlySet<string>,
    catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap>,
    attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides>,
): DashboardAttributeFilterPlaceholderMatch | undefined {
    const isReadable = (filter: DashboardAttributeFilterItem) =>
        !restrictedLocalIdentifiers.has(dashboardFilterLocalIdentifier(filter) ?? "");
    const hasLabel = (filter: DashboardAttributeFilterItem) => {
        const df = catalogDisplayForms.get(dashboardAttributeFilterItemDisplayForm(filter));
        return !!df && areObjRefsEqual(displayFormPlaceholderRef(df), ref);
    };
    const isDisplayedByLabel = (filter: DashboardAttributeFilterItem) =>
        attributeFilterConfigs.some(
            (config) =>
                config.localIdentifier === dashboardAttributeFilterItemLocalIdentifier(filter) &&
                !!config.displayAsLabel &&
                areObjRefsEqual(config.displayAsLabel, ref),
        );

    const textFilter = attributeFilters.find(
        (filter): filter is DashboardTextAttributeFilter =>
            isDashboardTextAttributeFilter(filter) && isReadable(filter) && hasLabel(filter),
    );
    if (textFilter) {
        return { type: "text", filter: textFilter };
    }
    const labelFilter = attributeFilters.find(
        (filter): filter is IDashboardAttributeFilter =>
            isDashboardAttributeFilter(filter) && isReadable(filter) && hasLabel(filter),
    );
    if (labelFilter) {
        return { type: "label", filter: labelFilter };
    }
    const displayedFilter = attributeFilters.find(
        (filter): filter is IDashboardAttributeFilter =>
            isDashboardAttributeFilter(filter) && isReadable(filter) && isDisplayedByLabel(filter),
    );
    if (displayedFilter) {
        return { type: "displayAsLabel", filter: displayedFilter };
    }
    return attributeFilters.some(
        (filter) => !isReadable(filter) && (hasLabel(filter) || isDisplayedByLabel(filter)),
    )
        ? { type: "restricted" }
        : undefined;
}

function* resolveDashboardAttributeFilterReplacement(
    { placeholder: toBeReplaced, ref }: IDrillToUrlPlaceholder,
    attributeFilters: DashboardAttributeFilterItem[],
    restrictedLocalIdentifiers: ReadonlySet<string>,
    catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap>,
    attributeFilterConfigs: ReturnType<typeof selectAttributeFilterConfigsOverrides>,
    ctx: DashboardContext,
): SagaIterator<IDrillToUrlPlaceholderReplacement> {
    const match = findDashboardAttributeFilterPlaceholderMatch(
        ref,
        attributeFilters,
        restrictedLocalIdentifiers,
        catalogDisplayForms,
        attributeFilterConfigs,
    );

    // a placeholder whose filter is missing from the dashboard stays unresolved, which rejects the drill
    let parsedFilter: string | undefined;
    if (match?.type === "text") {
        parsedFilter = stringifyTextFilterSelection(match.filter);
    } else if (match?.type === "label") {
        const elements = match.filter.attributeFilter.attributeElements;
        parsedFilter = stringifyAttributeFilterSelection(
            isAttributeElementsByValue(elements) ? elements.values : elements.uris,
            match.filter.attributeFilter.negativeSelection,
        );
    } else if (match?.type === "displayAsLabel") {
        const elements = match.filter.attributeFilter.attributeElements;
        const primaryElementsValues = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const elementTitles: SagaReturnType<typeof loadSecondaryElementTitles> = yield call(
            loadSecondaryElementTitles,
            ref,
            primaryElementsValues,
            ctx,
        );
        parsedFilter = stringifyAttributeFilterSelection(
            elementTitles,
            match.filter.attributeFilter.negativeSelection,
        );
    } else if (match?.type === "restricted") {
        parsedFilter = stringifyAttributeFilterSelection([], true);
    }

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
    const restrictedLocalIdentifiers: ReturnType<typeof selectRestrictedDashboardFilterLocalIdentifiers> =
        yield select(selectRestrictedDashboardFilterLocalIdentifiers);
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
                restrictedLocalIdentifiers,
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
    restrictedLocalIdentifiers: ReadonlySet<string>,
    catalogMeasures: ReturnType<typeof selectAllCatalogMeasuresMap>,
): IDrillToUrlPlaceholderReplacement {
    const isPlaceholderFilter = (filter: IDashboardMeasureValueFilter) =>
        dashboardMeasureValueFilterMatchesIdentifier(
            filter.dashboardMeasureValueFilter.measure,
            identifier,
            catalogMeasures,
        );
    const usedFilter = measureValueFilters.find(
        (filter) =>
            !restrictedLocalIdentifiers.has(dashboardMeasureValueFilterLocalIdentifier(filter)) &&
            isPlaceholderFilter(filter),
    );

    // A restricted filter is applied nowhere, so it filters nothing and resolves as "ALL". A
    // placeholder whose filter is missing from the dashboard stays unresolved, which rejects the drill.
    const parsedFilter =
        usedFilter || measureValueFilters.some(isPlaceholderFilter)
            ? stringifyMeasureValueFilterCondition(usedFilter?.dashboardMeasureValueFilter.conditions)
            : undefined;
    const replacement = encodeParameterIfSet(parsedFilter);

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
    const restrictedLocalIdentifiers: ReturnType<typeof selectRestrictedDashboardFilterLocalIdentifiers> =
        yield select(selectRestrictedDashboardFilterLocalIdentifiers);
    const catalogMeasures: ReturnType<typeof selectAllCatalogMeasuresMap> =
        yield select(selectAllCatalogMeasuresMap);

    return measureValueFilterPlaceholders.map((placeholder: IDrillToUrlPlaceholder) =>
        resolveDashboardMeasureValueFilterReplacement(
            placeholder,
            measureValueFilters,
            restrictedLocalIdentifiers,
            catalogMeasures,
        ),
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

    // The {attribute_filter_selection(...)} placeholder is scoped to the visualization, so it reads the
    // insight's own filters. Resolving it against the widget's effective filters would let a dashboard
    // filter on the same attribute take precedence and override the insight's selection.
    const widget: IInsightWidget = yield select(selectAnalyticalWidgetByRef(widgetRef));
    const insight: ReturnType<ReturnType<typeof selectInsightByRef>> = yield select(
        selectInsightByRef(widget.insight),
    );
    const insightAttributeFilters = insight
        ? insightDefinitionFilters(insight).filter(isAttributeFilter)
        : [];
    const catalogDisplayForms: ReturnType<typeof selectAllCatalogDisplayFormsMap> = yield select(
        selectAllCatalogDisplayFormsMap,
    );

    return attributeFilterPlaceholders.map(
        ({ placeholder: toBeReplaced, ref }): IDrillToUrlPlaceholderReplacement => {
            const usedFilter = insightAttributeFilters.find((filter) => {
                const filterRef = filterObjRef(filter);
                const df = filterRef && catalogDisplayForms.get(filterRef);
                return df && areObjRefsEqual(displayFormPlaceholderRef(df), ref);
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

    const resolveContext = () => getInsightIdentifiersReplacements(customUrl, widgetRef, ctx);
    const resolvers: Record<
        DrillUrlPlaceholderType,
        () => SagaIterator<IDrillToUrlPlaceholderReplacement[]>
    > = {
        attribute_title: () =>
            getAttributeIdentifiersReplacements(customUrl, event.drillContext.intersection!, ctx),
        dash_attribute_filter_selection: () => getDashboardAttributeFilterReplacements(customUrl, ctx),
        attribute_filter_selection: () => getInsightAttributeFilterReplacements(customUrl, widgetRef),
        dash_mvf_condition: () => getDashboardMeasureValueFilterReplacements(customUrl),
        mvf_condition: function* () {
            const enabled: ReturnType<typeof selectEnableMeasureValueFilterKD> = yield select(
                selectEnableMeasureValueFilterKD,
            );
            return enabled
                ? yield call(getInsightMeasureValueFilterReplacements, customUrl, widgetRef)
                : getInsightMeasureValueFilterPlaceholdersFromUrl(customUrl).map(({ placeholder }) => ({
                      toBeReplaced: placeholder,
                      replacement: undefined,
                  }));
        },
        [DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_PROJECT_ID]: resolveContext,
        [DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_WORKSPACE_ID]: resolveContext,
        [DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_INSIGHT_ID]: resolveContext,
        [DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_WIDGET_ID]: resolveContext,
        [DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_DASHBOARD_ID]: resolveContext,
        [DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_CLIENT_ID]: resolveContext,
        [DRILL_TO_URL_PLACEHOLDER.DRILL_TO_URL_PLACEHOLDER_DATA_PRODUCT_ID]: resolveContext,
    };
    const replacements: IDrillToUrlPlaceholderReplacement[] = [];
    for (const resolve of new Set(getDrillUrlPlaceholderTypes(customUrl).map((type) => resolvers[type]))) {
        const resolved: IDrillToUrlPlaceholderReplacement[] = yield call(resolve);
        replacements.push(...resolved);
    }
    const missingReplacements = replacements.filter(({ replacement }) => replacement === undefined);

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
