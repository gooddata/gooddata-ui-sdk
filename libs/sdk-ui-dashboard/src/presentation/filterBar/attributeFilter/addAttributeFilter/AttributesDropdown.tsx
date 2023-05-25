// (C) 2007-2023 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useState } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import { Dropdown, DropdownList } from "@gooddata/sdk-ui-kit";
import debounce from "lodash/debounce.js";

import { AddAttributeFilterButton } from "./AddAttributeFilterButton.js";
import {
    useDashboardSelector,
    selectCatalogAttributes,
    selectAllInsightWidgets,
    selectInsightsMap,
} from "../../../../model/index.js";
import { IDashboardAttributeFilterPlaceholderProps } from "../types.js";
import AttributeListItem from "./AttributeListItem.js";
import { isLocationIconEnabled } from "./addAttributeFilterUtils.js";

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

/**
 * @internal
 */
export function AttributesDropdown({
    className,
    bodyClassName,
    onClose,
    onSelect,
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

    const attributes = useDashboardSelector(selectCatalogAttributes);
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

    const filteredMeasures = searchQuery
        ? attributes.filter((a) => a.attribute.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : attributes;

    return (
        <Dropdown
            className={dropdownClassName}
            onOpenStateChanged={onDropdownStateChange}
            closeOnParentScroll={closeOnParentScroll}
            closeOnMouseDrag
            closeOnOutsideClick
            alignPoints={dropdownAlignPoints}
            openOnInit={true}
            renderButton={({ isOpen }) => (
                <AddAttributeFilterButton
                    className="attribute-filter-button mobile-dropdown-button"
                    isOpen={isOpen}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <div className={cx(bodyClassName, "attributes-list")}>
                    <DropdownList
                        items={filteredMeasures}
                        searchFieldSize="small"
                        showSearch
                        onSearch={onSearch}
                        searchString={searchQuery}
                        searchPlaceholder={intl.formatMessage({
                            id: "attributesDropdown.placeholder",
                        })}
                        renderItem={({ item }) => {
                            return (
                                <AttributeListItem
                                    item={item}
                                    isLocationIconEnabled={shouldDisplayLocationIcon}
                                    onClick={() => {
                                        onSelect(item.defaultDisplayForm.ref);
                                        closeDropdown();
                                    }}
                                />
                            );
                        }}
                    />
                </div>
            )}
        />
    );
}
