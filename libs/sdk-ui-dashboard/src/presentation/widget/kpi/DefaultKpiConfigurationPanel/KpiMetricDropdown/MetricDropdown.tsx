// (C) 2007-2022 GoodData Corporation
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { areObjRefsEqual, IMeasureMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { Dropdown, DropdownButton, DropdownList, IAlignPoint } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import debounce from "lodash/debounce.js";

import {
    useDashboardSelector,
    selectCatalogMeasures,
    selectEnableRenamingMeasureToMetric,
} from "../../../../../model/index.js";

import { CONFIG_PANEL_INNER_WIDTH } from "../constants.js";
import { MetricDropdownItem } from "./MetricDropdownItem.js";

const alignPoints: IAlignPoint[] = [{ align: "bl tl" }];

const LIST_EXTRAS = 58; // search field + top/bottom borders
const LIST_ITEM_HEIGHT = 28;
const MAX_LIST_HEIGHT = 294;

interface IMetricDropdownProps {
    workspace: string;
    openOnInit?: boolean;
    selectedItems: ObjRef[];
    bodyClassName: string;
    onSelect: (item: IMeasureMetadataObject) => void;
}

export const MetricDropdown: React.FC<IMetricDropdownProps> = (props) => {
    const { onSelect, bodyClassName, selectedItems, openOnInit } = props;
    const intl = useIntl();

    const buttonRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const measures = useDashboardSelector(selectCatalogMeasures);
    const shouldRenameMeasureToMetric = useDashboardSelector(selectEnableRenamingMeasureToMetric);

    const debouncedOnSearch = useRef<(newSearchQuery: string) => void>(
        debounce((newSearchQuery: string) => {
            setSearchQuery(newSearchQuery);
        }, 250),
    );

    const [selectedRef] = selectedItems;
    const selectedItem = selectedRef
        ? measures.find((m) => areObjRefsEqual(m.measure.ref, selectedItems[0]))
        : undefined;

    const buttonValue =
        selectedItem?.measure?.title ??
        intl.formatMessage({ id: "configurationPanel.selectMeasurePlaceholder" });

    const onOpenStateChanged = useCallback(
        (isOpen: boolean): void => {
            if (isOpen && searchQuery) {
                setSearchQuery("");
            }
        },
        [searchQuery],
    );

    const filteredMeasures = useMemo(
        () =>
            searchQuery
                ? measures.filter((m) => m.measure.title.toLowerCase().includes(searchQuery.toLowerCase()))
                : measures,
        [measures, searchQuery],
    );

    const calculateHeight = (itemsCount: number) => {
        const winHeight = window.innerHeight;
        const dropdownButtonBottom = buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom : 0;
        const minHeight = Math.min(
            winHeight - dropdownButtonBottom - LIST_EXTRAS,
            MAX_LIST_HEIGHT,
            LIST_ITEM_HEIGHT * itemsCount,
        );
        return Math.max(LIST_ITEM_HEIGHT, minHeight);
    };

    const height = calculateHeight(filteredMeasures.length) || MAX_LIST_HEIGHT;

    return (
        <Dropdown
            alignPoints={alignPoints}
            className="s-metric_select"
            closeOnMouseDrag
            closeOnParentScroll
            openOnInit={openOnInit}
            ignoreClicksOnByClass={[".dash-content"]}
            onOpenStateChanged={onOpenStateChanged}
            renderButton={({ isOpen, toggleDropdown }) => (
                <div ref={buttonRef}>
                    <DropdownButton
                        className={shouldRenameMeasureToMetric ? "type-metric" : "type-measure"}
                        isSmall
                        value={buttonValue}
                        isOpen={isOpen}
                        onClick={toggleDropdown}
                    />
                </div>
            )}
            renderBody={({ closeDropdown }) => (
                <div className={cx(bodyClassName, "metrics-dropdown")}>
                    <DropdownList
                        items={filteredMeasures}
                        searchFieldSize="small"
                        showSearch
                        onSearch={debouncedOnSearch.current}
                        searchString={searchQuery}
                        height={height}
                        width={CONFIG_PANEL_INNER_WIDTH}
                        // disabling autofocus for now as it causes the page to scroll to top for no reason
                        disableAutofocus
                        renderItem={({ item }) => {
                            return (
                                <MetricDropdownItem
                                    item={item.measure}
                                    isSelected={
                                        !!selectedRef && areObjRefsEqual(selectedRef, item.measure.ref)
                                    }
                                    unlistedTitle={intl.formatMessage({
                                        id: "configurationPanel.unlistedMetric",
                                    })}
                                    unlistedIconTitle={intl.formatMessage({
                                        id: "configurationPanel.unlistedMetricIconTitle",
                                    })}
                                    onClick={() => {
                                        onSelect(item.measure);
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
};
