// (C) 2007-2026 GoodData Corporation

import { type MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";

import cx from "classnames";
import { debounce } from "lodash-es";
import { useIntl } from "react-intl";

import {
    type ICatalogAttribute,
    type ICatalogDateDataset,
    type IdentifierRef,
    isCatalogAttribute,
    isCatalogMeasure,
} from "@gooddata/sdk-model";
import {
    Dropdown,
    DropdownList,
    type ITab,
    SingleSelectListItem,
    UiIcon,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectSupportsMultipleDateFilters } from "../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectEnableMeasureValueFilterKD } from "../../../../model/store/config/configSelectors.js";
import { selectInsightsMap } from "../../../../model/store/insights/insightsSelectors.js";
import { selectAllInsightWidgets } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import { type IDashboardAttributeFilterPlaceholderProps } from "../types.js";

import { AddAttributeFilterButton } from "./AddAttributeFilterButton.js";
import { isLocationIconEnabled } from "./addAttributeFilterUtils.js";
import { AttributeListItem, getAttributeListItemTitle } from "./AttributeListItem.js";
import { DateAttributeListItem, getDateAttributeListItemTitle } from "./DateAttributeListItem.js";
import { MetricListItem, getMetricListItemTitle } from "./MetricListItem.js";
import {
    type IMetricDropdownListItem,
    isMetricHeaderListItem,
    isMetricSeparatorListItem,
    useMetricDropdownItems,
} from "./useMetricDropdownItems.js";

const dropdownAlignPoints = [
    {
        align: "bl tl",
    },
    {
        align: "tr tl",
    },
    {
        align: "tr tl",
        offset: {
            x: 0,
            y: -100,
        },
    },
    {
        align: "tr tl",
        offset: {
            x: 0,
            y: -50,
        },
    },
    {
        align: "br tr",
        offset: {
            x: -10,
            y: 0,
        },
    },
    {
        align: "tl tr",
        offset: {
            x: 0,
            y: -100,
        },
    },
    {
        align: "tl tr",
        offset: {
            x: 0,
            y: -50,
        },
    },
];

const WIDTH = 253;

type AttributesDropdownTabId = "attributes" | "dateDatasets" | "metrics" | "parameters";

/**
 * Addable workspace parameter offered in the dropdown's "parameters" tab (automation dialogs only).
 *
 * @internal
 */
export interface IParameterDropdownListItem {
    type: "parameter";
    ref: IdentifierRef;
    title: string;
}

function isParameterDropdownListItem(item: unknown): item is IParameterDropdownListItem {
    return typeof item === "object" && item !== null && "type" in item && item.type === "parameter";
}

type AddFilterListItem =
    | ICatalogAttribute
    | ICatalogDateDataset
    | IMetricDropdownListItem
    | IParameterDropdownListItem;

/**
 * @internal
 */
export interface IAttributesDropdownProps extends IDashboardAttributeFilterPlaceholderProps {
    /** Addable workspace parameters (automation dialogs only). Renders a "parameters" tab. */
    parameters?: IParameterDropdownListItem[];
    onParameterSelect?: (ref: IdentifierRef) => void;
}

function createDefaultSelectedTabId({
    hasAttributes,
    hasDateFilters,
    hasMeasures,
    hasParameters,
}: {
    hasAttributes: boolean;
    hasDateFilters: boolean;
    hasMeasures: boolean;
    hasParameters: boolean;
}): AttributesDropdownTabId {
    if (hasAttributes) {
        return "attributes";
    }
    if (hasDateFilters) {
        return "dateDatasets";
    }
    if (hasMeasures) {
        return "metrics";
    }
    if (hasParameters) {
        return "parameters";
    }

    return "attributes";
}

/**
 * @internal
 */
export function AttributesDropdown({
    id,
    className,
    bodyClassName,
    onClose,
    onOpen,
    onSelect,
    attributes,
    dateDatasets,
    measures = [],
    openOnInit = true,
    DropdownButtonComponent = AddAttributeFilterButton,
    DropdownTitleComponent,
    renderNoData,
    overlayPositionType,
    getCustomItemTitle,
    accessibilityConfig,
    returnFocusTo,
    parameters = [],
    onParameterSelect,
}: IAttributesDropdownProps) {
    const buttonId = useIdPrefixed(`add-attribute-filter-button-${id ?? ""}-`);
    const intl = useIntl();
    const [searchQuery, setSearchQuery] = useState("");

    const [closeOnParentScroll, setCloseOnParentScroll] = useState(false);

    // 1) Dragging this component into FilterBar could change height of FilterBar (FilterBar is sticky)
    // 2) When size of sticky element changed, then scroll position of dashboard is changed
    // 3) Then onScroll event is fired (By default window scroll event)
    // 4) KD or external app onScroll could fire GOODSTRAP_SCROLLED_EVENT custom event to close all opened overlays that have closeOnParentScroll = true
    // 5) Result is when this component change height of FilterBar it will be immediately closed after user drop it into FilterBar
    // 6) To prevent this behavior we initialize this component with closeOnParentScroll = false
    // 7) And in timeout 0.5 we set closeOnParentScroll = true to keep behavior that dropdown is closed when user scroll

    useEffect(() => {
        const timer = window.setTimeout(() => setCloseOnParentScroll(true), 500);

        return () => {
            if (timer !== null) {
                window.clearTimeout(timer);
            }
        };
    }, []);

    const supportsMultipleDateFilters = useDashboardSelector(selectSupportsMultipleDateFilters);
    const enableMeasureValueFilterKD = useDashboardSelector(selectEnableMeasureValueFilterKD);

    const insightsMap = useDashboardSelector(selectInsightsMap);
    const insightWidgets = useDashboardSelector(selectAllInsightWidgets);

    const shouldDisplayLocationIcon = useMemo(
        () => isLocationIconEnabled(insightWidgets, insightsMap),
        [insightWidgets, insightsMap],
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSearch = useCallback(
        debounce((query: string) => {
            setSearchQuery(query);
        }, 250),
        [],
    );

    const onDropdownStateChange = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                onOpen?.();
            } else {
                onClose?.();
            }
        },
        [onClose, onOpen],
    );

    const dropdownClassName = cx(
        className,
        "s-attribute_select",
        "attribute-filter-dropdown",
        "add-attribute-filter-dropdown",
    );

    const filteredAttributes = useMemo(() => {
        return searchQuery
            ? attributes.filter((a) => a.attribute.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : attributes;
    }, [attributes, searchQuery]);

    const filteredDateDatasets = useMemo(() => {
        return searchQuery
            ? dateDatasets.filter((ds) => ds.dataSet.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : dateDatasets;
    }, [dateDatasets, searchQuery]);

    const { metricMeasures, metricDropdownItems } = useMetricDropdownItems({
        measures,
        searchQuery,
        enableMeasureValueFilterKD,
        insightWidgets,
        insightsMap,
    });

    const filteredParameters = useMemo(() => {
        return searchQuery
            ? parameters.filter((parameter) =>
                  parameter.title.toLowerCase().includes(searchQuery.toLowerCase()),
              )
            : parameters;
    }, [parameters, searchQuery]);

    const hasAttributes = useMemo(() => attributes.length > 0, [attributes]);
    const hasDateFilters = useMemo(
        () => supportsMultipleDateFilters && dateDatasets.length > 0,
        [dateDatasets, supportsMultipleDateFilters],
    );
    const hasMeasures = useMemo(() => metricMeasures.length > 0, [metricMeasures]);
    const hasParameters = useMemo(() => parameters.length > 0, [parameters]);

    const defaultSelectedTabId = createDefaultSelectedTabId({
        hasAttributes,
        hasDateFilters,
        hasMeasures,
        hasParameters,
    });

    const [selectedTabId, setSelectedTabId] = useState<string>(defaultSelectedTabId);

    useEffect(() => {
        setSelectedTabId(defaultSelectedTabId);
    }, [defaultSelectedTabId]);

    const onTabSelect = useCallback((selectedTab: ITab) => {
        setSelectedTabId(selectedTab.id);
    }, []);

    const tabs = useMemo(() => {
        const newTabs: ITab[] = [];
        if (attributes.length) {
            newTabs.push({ id: "attributes", iconOnly: true, icon: "gd-icon-attribute" });
        }
        if (enableMeasureValueFilterKD && metricMeasures.length) {
            newTabs.push({ id: "metrics", iconOnly: true, icon: "gd-icon-metric" });
        }
        if (supportsMultipleDateFilters && dateDatasets.length) {
            newTabs.push({ id: "dateDatasets", iconOnly: true, icon: "gd-icon-date" });
        }
        if (parameters.length) {
            newTabs.push({
                id: "parameters",
                iconOnly: true,
                iconNode: <UiIcon type="parameter" size={16} layout="block" color="currentColor" />,
            });
        }

        return newTabs;
    }, [
        attributes,
        dateDatasets,
        enableMeasureValueFilterKD,
        metricMeasures,
        supportsMultipleDateFilters,
        parameters,
    ]);

    const buttonTitle = intl.formatMessage({ id: "addPanel.filter" });

    const items: AddFilterListItem[] = useMemo(() => {
        if (selectedTabId === "attributes") {
            return filteredAttributes;
        }
        if (selectedTabId === "dateDatasets") {
            return filteredDateDatasets;
        }

        if (selectedTabId === "metrics") {
            return metricDropdownItems;
        }

        if (selectedTabId === "parameters") {
            return filteredParameters;
        }

        return [];
    }, [selectedTabId, filteredAttributes, filteredDateDatasets, metricDropdownItems, filteredParameters]);

    const showTabs = useMemo(() => {
        return tabs.length > 1;
    }, [tabs.length]);

    function selectItem(item: AddFilterListItem, closeDropdown: () => void) {
        if (isMetricHeaderListItem(item) || isMetricSeparatorListItem(item)) {
            return;
        }
        if (isParameterDropdownListItem(item)) {
            onParameterSelect?.(item.ref);
        } else if (isCatalogAttribute(item)) {
            onSelect(item.defaultDisplayForm.ref, "attribute");
        } else if (isCatalogMeasure(item)) {
            onSelect(item.measure.ref, "measure");
        } else {
            onSelect(item.dataSet.ref, "dateDataset");
        }
        closeDropdown();
    }

    return (
        <Dropdown
            className={dropdownClassName}
            onOpenStateChanged={onDropdownStateChange}
            closeOnParentScroll={closeOnParentScroll}
            closeOnMouseDrag
            closeOnOutsideClick
            closeOnEscape
            returnFocusTo={returnFocusTo ?? buttonId}
            alignPoints={dropdownAlignPoints}
            openOnInit={openOnInit}
            overlayPositionType={overlayPositionType}
            renderButton={({ isOpen, openDropdown, buttonRef }) => (
                <DropdownButtonComponent
                    id={buttonId}
                    className="attribute-filter-button mobile-dropdown-button"
                    isOpen={isOpen}
                    title={buttonTitle}
                    onClick={openDropdown}
                    buttonRef={buttonRef as MutableRefObject<HTMLButtonElement>}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <div id={id} role="dialog" aria-labelledby={accessibilityConfig?.ariaLabelledBy}>
                    {DropdownTitleComponent ? <DropdownTitleComponent /> : null}
                    <div
                        className={cx(bodyClassName, "attributes-list", {
                            "attributes-list-mvf": enableMeasureValueFilterKD,
                        })}
                        style={enableMeasureValueFilterKD ? { width: WIDTH } : undefined}
                    >
                        <DropdownList
                            width={WIDTH}
                            showTabs={showTabs}
                            tabs={tabs}
                            tabsClassName="date-attribute-dropdown-tabs s-filter-attribute-dropdown-tabs"
                            selectedTabId={selectedTabId}
                            onTabSelect={onTabSelect}
                            items={items}
                            searchFieldSize="small"
                            showSearch
                            onSearch={onSearch}
                            searchString={searchQuery}
                            searchPlaceholder={intl.formatMessage({
                                id: "attributesDropdown.placeholder",
                            })}
                            searchLabel={accessibilityConfig?.searchAriaLabel}
                            onKeyDownSelect={(item) => selectItem(item, closeDropdown)}
                            closeDropdown={closeDropdown}
                            itemTitleGetter={(item) => {
                                if (isMetricHeaderListItem(item)) {
                                    return item.title;
                                }
                                if (isMetricSeparatorListItem(item)) {
                                    return "";
                                }
                                if (isParameterDropdownListItem(item)) {
                                    return item.title;
                                }
                                if (isCatalogAttribute(item)) {
                                    return getAttributeListItemTitle(item, getCustomItemTitle?.(item));
                                }
                                if (isCatalogMeasure(item)) {
                                    return getMetricListItemTitle(item, getCustomItemTitle?.(item));
                                }
                                return getDateAttributeListItemTitle(item, getCustomItemTitle?.(item));
                            }}
                            renderNoData={renderNoData}
                            renderItem={({ item }) => {
                                if (isMetricHeaderListItem(item)) {
                                    return <SingleSelectListItem type={item.type} title={item.title} />;
                                }
                                if (isMetricSeparatorListItem(item)) {
                                    return <SingleSelectListItem type={item.type} />;
                                }
                                if (isParameterDropdownListItem(item)) {
                                    return (
                                        <SingleSelectListItem
                                            title={item.title}
                                            icon={
                                                <UiIcon
                                                    type="parameter"
                                                    size={16}
                                                    layout="block"
                                                    color="currentColor"
                                                />
                                            }
                                            onClick={() => selectItem(item, closeDropdown)}
                                        />
                                    );
                                }
                                if (isCatalogAttribute(item)) {
                                    const title = getCustomItemTitle?.(item);
                                    return (
                                        <AttributeListItem
                                            item={item}
                                            title={title}
                                            isLocationIconEnabled={shouldDisplayLocationIcon}
                                            onClick={() => selectItem(item, closeDropdown)}
                                        />
                                    );
                                }
                                if (isCatalogMeasure(item)) {
                                    const title = getCustomItemTitle?.(item);

                                    return (
                                        <MetricListItem
                                            title={title}
                                            item={item}
                                            onClick={() => selectItem(item, closeDropdown)}
                                        />
                                    );
                                }
                                const title = getCustomItemTitle?.(item);
                                return (
                                    <DateAttributeListItem
                                        title={title}
                                        item={item}
                                        onClick={() => selectItem(item, closeDropdown)}
                                    />
                                );
                            }}
                        />
                    </div>
                </div>
            )}
        />
    );
}
