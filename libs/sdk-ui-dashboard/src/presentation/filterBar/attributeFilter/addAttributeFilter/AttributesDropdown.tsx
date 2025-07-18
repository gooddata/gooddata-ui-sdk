// (C) 2007-2025 GoodData Corporation
import { MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import { Dropdown, DropdownList, isEscapeKey, ITab } from "@gooddata/sdk-ui-kit";
import debounce from "lodash/debounce.js";

import { AddAttributeFilterButton } from "./AddAttributeFilterButton.js";
import {
    useDashboardSelector,
    selectAllInsightWidgets,
    selectInsightsMap,
    selectSupportsMultipleDateFilters,
    selectEnableMultipleDateFilters,
} from "../../../../model/index.js";
import { IDashboardAttributeFilterPlaceholderProps } from "../types.js";
import AttributeListItem from "./AttributeListItem.js";
import { isLocationIconEnabled } from "./addAttributeFilterUtils.js";
import { ICatalogAttribute, ICatalogDateDataset, isCatalogAttribute } from "@gooddata/sdk-model";
import DateAttributeListItem from "./DateAttributeListItem.js";

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
/**
 * @internal
 */
export function AttributesDropdown({
    className,
    bodyClassName,
    onClose,
    onSelect,
    attributes,
    dateDatasets,
    openOnInit = true,
    DropdownButtonComponent = AddAttributeFilterButton,
    DropdownTitleComponent,
    renderNoData,
    overlayPositionType,
    renderVirtualisedList,
    getCustomItemTitle,
}: IDashboardAttributeFilterPlaceholderProps) {
    const intl = useIntl();
    const [searchQuery, setSearchQuery] = useState("");

    const [closeOnParentScroll, setCloseOnParentScroll] = useState(false);

    // 1) Dragging this component into FilterBar could change height of FilterBar (FilterBar is sticky)
    // 2) When size of sticky element changed, then scroll position of dashboard is changed
    // 3) Then onScroll event is fired (By default window scroll event)
    // 4) KD or external app onScroll could fire "goodstrap.scrolled" custom event to close all opened overlays that have closeOnParentScroll = true
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

    const enableMultipleDateFilters = useDashboardSelector(selectEnableMultipleDateFilters);
    const supportsMultipleDateFilters = useDashboardSelector(selectSupportsMultipleDateFilters);

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
            if (!isOpen) {
                onClose();
            }
        },
        [onClose],
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

    const offerDateFilters = enableMultipleDateFilters && supportsMultipleDateFilters;

    const filteredDateDatasets = useMemo(() => {
        return searchQuery
            ? dateDatasets.filter((ds) => ds.dataSet.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : dateDatasets;
    }, [dateDatasets, searchQuery]);

    const hasAttributes = useMemo(() => attributes.length > 0, [attributes]);
    const hasDateFilters = useMemo(
        () => offerDateFilters && dateDatasets.length > 0,
        [dateDatasets, offerDateFilters],
    );

    const [selectedTabId, setSelectedTabId] = useState(
        !hasAttributes && hasDateFilters ? "dateDatasets" : "attributes",
    );

    useEffect(() => {
        setSelectedTabId(!hasAttributes && hasDateFilters ? "dateDatasets" : "attributes");
    }, [hasAttributes, hasDateFilters]);

    const onTabSelect = useCallback((selectedTab: ITab) => {
        setSelectedTabId(selectedTab.id);
    }, []);

    const tabs = useMemo(() => {
        const newTabs: ITab[] = [];
        if (attributes.length) {
            newTabs.push({ id: "attributes", iconOnly: true, icon: "gd-icon-attribute" });
        }
        if (offerDateFilters && dateDatasets.length) {
            newTabs.push({ id: "dateDatasets", iconOnly: true, icon: "gd-icon-date" });
        }
        return newTabs;
    }, [attributes, dateDatasets, offerDateFilters]);

    const buttonTitle = intl.formatMessage({ id: "addPanel.filter" });

    const items: (ICatalogAttribute | ICatalogDateDataset)[] = useMemo(() => {
        return selectedTabId === "attributes" ? filteredAttributes : filteredDateDatasets;
    }, [selectedTabId, filteredAttributes, filteredDateDatasets]);

    const showTabs = useMemo(() => {
        return offerDateFilters && tabs.length > 1;
    }, [offerDateFilters, tabs.length]);

    return (
        <Dropdown
            className={dropdownClassName}
            onOpenStateChanged={onDropdownStateChange}
            closeOnParentScroll={closeOnParentScroll}
            closeOnMouseDrag
            closeOnOutsideClick
            alignPoints={dropdownAlignPoints}
            openOnInit={openOnInit}
            overlayPositionType={overlayPositionType}
            renderButton={({ isOpen, openDropdown, buttonRef }) => (
                <DropdownButtonComponent
                    className="attribute-filter-button mobile-dropdown-button"
                    isOpen={isOpen}
                    title={buttonTitle}
                    onClick={openDropdown}
                    buttonRef={buttonRef as MutableRefObject<HTMLButtonElement>}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <>
                    {DropdownTitleComponent ? <DropdownTitleComponent /> : null}
                    <div
                        className={cx(bodyClassName, "attributes-list")}
                        onKeyDown={(e) => {
                            if (isEscapeKey(e)) {
                                e.stopPropagation();
                                closeDropdown();
                            }
                        }}
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
                            onKeyDownSelect={(item) => {
                                if (isCatalogAttribute(item)) {
                                    onSelect(item.defaultDisplayForm.ref);
                                } else {
                                    onSelect(item.dataSet.ref);
                                }
                            }}
                            closeDropdown={closeDropdown}
                            renderVirtualisedList={renderVirtualisedList}
                            renderNoData={renderNoData}
                            renderItem={({ item }) => {
                                const title = getCustomItemTitle?.(item);
                                if (isCatalogAttribute(item)) {
                                    return (
                                        <AttributeListItem
                                            item={item}
                                            title={title}
                                            isLocationIconEnabled={shouldDisplayLocationIcon}
                                            onClick={() => {
                                                onSelect(item.defaultDisplayForm.ref);
                                                closeDropdown();
                                            }}
                                        />
                                    );
                                }
                                return (
                                    <DateAttributeListItem
                                        title={title}
                                        item={item}
                                        onClick={() => {
                                            onSelect(item.dataSet.ref);
                                            closeDropdown();
                                        }}
                                    />
                                );
                            }}
                        />
                    </div>
                </>
            )}
        />
    );
}
