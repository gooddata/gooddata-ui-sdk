// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, memo, useCallback, useEffect, useMemo, useRef } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage, defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ObjRef } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button, IconCopy, RichText, ScrollGradient } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { type IShowAddMessagePayload, addMessage } from "../../../actions/messages_actions.js";
import { COMPUTED_ATTRIBUTE } from "../../../constants/bucket.js";
import { CatalogUiActions } from "../../../sagas/catalog/catalog_ui_actions.js";
import { getCatalogBubbleItemCacheKey } from "../../../sagas/catalog/catalog_utils.js";
import { canManageMetadata } from "../../../selectors/backend_capabilities_selector.js";
import { getProjectId, getSeparators } from "../../../selectors/bootstrap_selector.js";
import { getIsEmbedded } from "../../../selectors/meta_selector.js";
import { canEditCatalogMetric } from "../../../selectors/metric_permissions_selector.js";
import { canManageMetric } from "../../../selectors/permissions_selector.js";
import { isEmbeddedFromKD } from "../../../selectors/route_selector.js";
import {
    getAttributeHierarchiesWithCatalogItem,
    getItemTooltipDetails,
} from "../../../store/catalog/catalog_selector.js";
import { metricEditorOpen } from "../../../store/metric_editor/metric_editor_actions.js";
import { type AppDispatch, type IAppState } from "../../../store/types.js";
import {
    type IOrganizedCatalogItem,
    type IOrganizedCatalogTooltipDetailsAttribute,
    type IOrganizedCatalogTooltipDetailsFact,
    type IOrganizedCatalogTooltipDetailsMeasure,
} from "../../../typings/catalog.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";
import { getMetricsEditorUrl } from "../../../utils/api.js";
import { getCatalogItemTitle } from "../../../utils/translations.js";
import { getWorkspaceRef } from "../../../utils/uri.js";
import { AttributeBubbleContent } from "../../shared/AttributeBubbleContent.js";
import { ComputedAttributeBubbleContent } from "../../shared/ComputedAttributeBubbleContent.js";
import { FactBubbleContent } from "../../shared/FactBubbleContent.js";
import { MeasureBubbleContent } from "../../shared/MeasureBubbleContent.js";

import { AttributeHierarchySection } from "./AttributeHierarchySection.js";

const bucketItemTypeMessages = defineMessages({
    attribute: { id: "bucket_item_types.attribute" },
    geo_attribute: { id: "bucket_item_types.geo_attribute" },
    date: { id: "bucket_item_types.date" },
    fact: { id: "bucket_item_types.fact" },
    metric: { id: "bucket_item_types.metric" },
    measure: { id: "bucket_item_types.metric" }, // measure uses same translation as metric
    computedAttribute: { id: "bucket_item_types.computed_attribute" },
});

const DETAILS_LOADING_TIMEOUT_MS = 500;
const ARROW_OFFSETS = { "tr br": [3, -6] };
const ALIGN_POINTS = [{ align: "tr br" }];

export interface ICatalogDetailsBubbleProps {
    item: ICatalogEntry;
    offsetX?: number;
    offsetY?: number;
}

function stopEventPropagation(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
}

/** The tooltip detail parts merged across the per-type union — the readers probe by key. */
type ITooltipDetailsProbe = Partial<
    IOrganizedCatalogTooltipDetailsMeasure &
        IOrganizedCatalogTooltipDetailsFact &
        IOrganizedCatalogTooltipDetailsAttribute
>;

// Whether every tooltip detail part expected for the given item type has been loaded. Details are
// fetched as independent parts and merged as they resolve, so a non-null `bubbleDetails` may still be
// missing a part that failed or has not arrived yet; in that case the tooltip should re-request.
function hasAllTooltipDetails(type: string, bubbleDetails: ITooltipDetailsProbe | null): boolean {
    if (!bubbleDetails) {
        return false;
    }
    switch (type) {
        case "attribute":
            return bubbleDetails["dataset"] != null && bubbleDetails["attrElements"] != null;
        // organized catalog items use "metric"; "measure" is handled defensively for parity with
        // renderIdentifier, which treats the two the same
        case "metric":
        case "measure":
            return bubbleDetails["metricMaql"] != null;
        // a computed attribute shows its values like an attribute and its definition like a metric
        case "computedAttribute":
            return bubbleDetails["metricMaql"] != null && bubbleDetails["attrElements"] != null;
        case "fact":
            return bubbleDetails["dataset"] != null;
        default:
            return true;
    }
}

const getBubbleDetails = (state: IAppState, item: ICatalogEntry) => {
    const itemId = getCatalogBubbleItemCacheKey(item as IOrganizedCatalogItem);
    return getItemTooltipDetails(state, itemId);
};

export const CatalogDetailsBubble = memo(function CatalogDetailsBubble({ item }: ICatalogDetailsBubbleProps) {
    const theme = useTheme();

    const projectId = useSelector(getProjectId);
    const isEmbeddedMode = useSelector(getIsEmbedded);
    const isEmbeddedModeFromKD = useSelector(isEmbeddedFromKD);
    const canUserManageMetric = useSelector(canManageMetric);
    const canBackendManageMetadata = useSelector(canManageMetadata);
    const bubbleDetails = useSelector((state: IAppState) => getBubbleDetails(state, item)) ?? null;
    // memoised per item: getAttributeHierarchiesWithCatalogItem builds a filtering selector, so a
    // fresh one on every render would hand useSelector a new array each time it is called
    const attributeHierarchiesSelector = useMemo(
        () => getAttributeHierarchiesWithCatalogItem(item.identifier),
        [item],
    );
    const attributeHierarchies = useSelector(attributeHierarchiesSelector);
    // ICatalogEntry carries no permissions, so the rule reads them off the real catalog item
    const canEditThisMetric = useSelector((state: IAppState) => canEditCatalogMetric(state, item.identifier));
    const separators = useSelector(getSeparators);

    const dispatch = useDispatch<AppDispatch>();
    const requestCatalogItemTooltipDetails = useCallback(
        (organizedItem: IOrganizedCatalogItem) =>
            dispatch(CatalogUiActions.requestCatalogItemTooltipDetails(organizedItem)),
        [dispatch],
    );
    const openMetricEditorDialog = useCallback(
        (metricRef: ObjRef) => dispatch(metricEditorOpen(metricRef)),
        [dispatch],
    );
    const showToastMessage = useCallback(
        (payload: IShowAddMessagePayload) => dispatch(addMessage(payload)),
        [dispatch],
    );

    const intl = useIntl();

    const workspacesRef = getWorkspaceRef(true);

    const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Keep the latest details in a ref so the delayed (attribute) request can re-check them at the
    // moment it fires, rather than the stale value captured when the timeout was scheduled.
    const bubbleDetailsRef = useRef(bubbleDetails);
    useEffect(() => {
        bubbleDetailsRef.current = bubbleDetails;
    }, [bubbleDetails]);

    const removeBubbleTimeout = () => {
        if (bubbleTimeoutRef.current) {
            clearTimeout(bubbleTimeoutRef.current);
            bubbleTimeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            removeBubbleTimeout();
        };
    }, []);

    const onShowBubble = (hoveredItem: typeof item) => {
        const itemJS = hoveredItem;
        if (itemJS.type === "date") {
            return;
        }
        // Details are now loaded as independent parts (e.g. an attribute's dataset and its value
        // samples). Re-request whenever a required part is still missing — not just when nothing has
        // loaded — so that if one part failed to load, a later hover retries it instead of leaving
        // that section stuck on "Loading…".
        if (hasAllTooltipDetails(itemJS.type, bubbleDetails)) {
            return;
        }
        if (itemJS.type === "attribute" || itemJS.type === "computedAttribute") {
            // delay the details request for (computed) attributes only - their details include a
            // value-elements query, so sweeping the mouse down the list must not fire one per item
            bubbleTimeoutRef.current = setTimeout(() => {
                // an in-flight fetch may have completed during the delay — avoid a redundant reload
                if (!hasAllTooltipDetails(itemJS.type, bubbleDetailsRef.current)) {
                    // a hovered entry in the organized catalog carries the organized-item fields
                    requestCatalogItemTooltipDetails(itemJS as IOrganizedCatalogItem);
                }
            }, DETAILS_LOADING_TIMEOUT_MS);
        } else {
            requestCatalogItemTooltipDetails(itemJS as IOrganizedCatalogItem);
        }
    };

    const openMetricEditorDialogHandler = () => {
        const ref = item.ref;
        if (ref) {
            openMetricEditorDialog(ref);
        }
    };

    const getItemDetails = <K extends keyof ITooltipDetailsProbe>(prop: K) => {
        const itemDetails: ITooltipDetailsProbe | null = bubbleDetails;
        return itemDetails ? itemDetails[prop] : null;
    };

    const getClasses = () => {
        const details = bubbleDetails;

        return classNames(
            "bubble-light",
            "adi-catalog-item-details",
            "s-catalogue-bubble",
            `s-catalogue-bubble-${item.identifier.replace(".", "_")}`,
            {
                "s-catalogue-bubble-loaded": !!details,
                "s-catalogue-bubble-loading": !details,
            },
        );
    };

    const openMetricsEditor = () => {
        const itemUri = item.uri;
        const url = getMetricsEditorUrl(projectId, itemUri, workspacesRef);
        window.open(`${window.location.origin}${url}`, "_blank");
    };

    const isRedirectAllowed = () => {
        const itemUri = item.uri;

        return (
            // The redirect opens the metric editor, which loads a measure. A computed attribute
            // borrows the metric bubble but is not one, so the editor would 404 on its uri.
            item.type !== COMPUTED_ATTRIBUTE &&
            (!isEmbeddedMode || isEmbeddedModeFromKD) &&
            canBackendManageMetadata &&
            canUserManageMetric &&
            !!itemUri
        );
    };

    const renderTitle = () => {
        const title = getCatalogItemTitle(item, intl);

        if (isRedirectAllowed()) {
            return (
                <a
                    className="gd-button-link s-adi-catalog-tooltip-title-redirect"
                    href={getMetricsEditorUrl(projectId, item.uri, workspacesRef)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <h3 className="s-adi-catalog-tooltip-heading">
                        <span className="gd-button-text">{title}</span>
                    </h3>
                </a>
            );
        }

        return <h3 className="s-adi-catalog-tooltip-heading">{title}</h3>;
    };

    const renderDetails = () => {
        const type = item.type;

        switch (type) {
            case "metric":
            case "measure":
                return (
                    <MeasureBubbleContent
                        metricMaql={getItemDetails("metricMaql")}
                        projectId={projectId}
                        isRedirectAllowed={isRedirectAllowed()}
                    />
                );
            // A computed attribute is an attribute with values AND a MAQL definition: the values
            // are shown first like an attribute's, then the definition the same way a metric's is
            // - with the referenced objects resolved to their titles.
            case "computedAttribute":
                return (
                    <ComputedAttributeBubbleContent
                        attrElements={getItemDetails("attrElements")}
                        attrElementsTotalCount={getItemDetails("attrElementsTotalCount")}
                        attrElementsNumberFormat={getItemDetails("attrElementsNumberFormat")}
                        separators={separators}
                        metricMaql={getItemDetails("metricMaql")}
                        projectId={projectId}
                        isRedirectAllowed={isRedirectAllowed()}
                    />
                );
            case "attribute":
                return (
                    <AttributeBubbleContent
                        attrElements={getItemDetails("attrElements")}
                        attrElementsTotalCount={getItemDetails("attrElementsTotalCount")}
                        attrElementsNumberFormat={getItemDetails("attrElementsNumberFormat")}
                        separators={separators}
                        dataset={getItemDetails("dataset")}
                    />
                );
            case "fact":
                return <FactBubbleContent dataset={getItemDetails("dataset")} />;
            case "date":
                return false;
            default:
                throw new Error(`Invalid attribute item type: ${type}`);
        }
    };

    const renderHierarchies = () => {
        if (item.type === "attribute") {
            return <AttributeHierarchySection attributeHierarchies={attributeHierarchies} />;
        }
        return null;
    };

    const renderIdentifier = () => {
        const identifier = item.identifier;

        const handleCopy = () =>
            navigator.clipboard.writeText(identifier).then(() =>
                showToastMessage({
                    translationKey: defineMessage({ id: "catalog.clipboard.copy.id.message" }).id,
                    type: "success",
                    durationInMs: 3000,
                }),
            );

        return (
            <>
                <h4>
                    <FormattedMessage id="catalog.clipboard.copy.id" />
                </h4>
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <span className="adi-catalog-identifier" onClick={handleCopy}>
                        <p className="adi-catalog-identifier-text">{identifier}</p>
                        <IconCopy className="adi-catalog-identifier-icon" />
                    </span>
                    <Bubble arrowOffsets={ARROW_OFFSETS} alignPoints={ALIGN_POINTS}>
                        <FormattedMessage id="catalog.clipboard.copy.id.tooltip" />
                    </Bubble>
                </BubbleHoverTrigger>
            </>
        );
    };

    const type = item.type;
    const summary = item.summary;

    const handleOnMouseEnter = () => {
        onShowBubble(item);
    };

    const handleOnMouseLeave = () => {
        removeBubbleTimeout();
    };

    const metricActionButtonValue = canEditThisMetric
        ? defineMessage({ id: "dashboard.catalog_item.edit_metric" }).id
        : defineMessage({ id: "dashboard.catalog_item.view_metric" }).id;
    const buttonActionClassnames = classNames(
        "gd-button-secondary gd-button-small s-adi-catalog-tooltip-metric-editor-edit",
        {
            "gd-icon-pencil": canEditThisMetric,
        },
    );

    return (
        <span className="gd-bubble-trigger-wrap s-gd-bubble-trigger-wrap" onMouseLeave={handleOnMouseLeave}>
            <BubbleHoverTrigger showDelay={0} hideDelay={100} eventsOnBubble>
                <span className="inlineBubbleHelp" onMouseEnter={handleOnMouseEnter} />
                <Bubble
                    className={getClasses()}
                    alignPoints={[
                        { align: "cr cl", offset: { x: -15, y: 0 } },
                        { align: "cr bl", offset: { x: -15, y: 0 } },
                        { align: "cr tl", offset: { x: -15, y: 0 } },
                    ]}
                    arrowStyle={{ display: "none" }}
                >
                    <div className="adi-catalog-tooltip-header">{renderTitle()}</div>
                    <ScrollGradient
                        size={13}
                        backgroundColor={theme?.palette?.complementary?.c0}
                        className="adi-catalog-tooltip-scroll"
                        contentClassName="adi-catalog-tooltip-scroll-content"
                        onScroll={stopEventPropagation}
                    >
                        {summary ? (
                            // Must be a <div>, not a <p>: RichText renders block-level elements (e.g. the
                            // loading <div> and rendered markdown blocks). A <div> inside a <p> is invalid
                            // HTML - the browser auto-closes the <p>, desyncing React's DOM tree from the
                            // real DOM, which wedges the renderer (removeChild/insertBefore throws) and
                            // freezes the whole UI.
                            <div className="adi-item-description s-adi-catalog-tooltip-description">
                                <RichText
                                    referencesEnabled
                                    className="adi-item-rich-text-description"
                                    value={summary}
                                    renderMode="view"
                                    separators={separators}
                                />
                            </div>
                        ) : null}
                        <h4>
                            <FormattedMessage id="dashboard.catalog_item.type" />
                        </h4>
                        <p className="adi-item-type s-adi-catalog-tooltip-type">
                            {intl.formatMessage(
                                bucketItemTypeMessages[type as keyof typeof bucketItemTypeMessages] ?? {
                                    id: `bucket_item_types.${type}`,
                                },
                            )}
                        </p>
                        {renderDetails()}
                        {renderIdentifier()}
                        {renderHierarchies()}
                    </ScrollGradient>
                    <div className="adi-catalog-tooltip-footer">
                        {!!isRedirectAllowed() && (
                            <Button
                                className="gd-button-secondary gd-button-small s-adi-catalog-tooltip-button-redirect"
                                value={intl.formatMessage({
                                    id: "dashboard.catalog_item.view_details",
                                })}
                                onClick={openMetricsEditor}
                            />
                        )}
                        {(type === "measure" || type === "metric") && (
                            <div className="adi-catalog-tooltip-metric-editor-edit">
                                <Button
                                    className={buttonActionClassnames}
                                    value={intl.formatMessage({
                                        id: metricActionButtonValue,
                                    })}
                                    onClick={openMetricEditorDialogHandler}
                                />
                            </div>
                        )}
                    </div>
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
});
