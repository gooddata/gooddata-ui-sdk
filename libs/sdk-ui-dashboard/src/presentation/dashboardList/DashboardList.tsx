// (C) 2020-2025 GoodData Corporation

import { useMemo, useState } from "react";

import { sortBy } from "lodash-es";
import { useIntl } from "react-intl";

import { Dropdown, DropdownList } from "@gooddata/sdk-ui-kit";

import { DashboardListButton } from "./DashboardListButton.js";
import { DashboardListItem } from "./DashboardListItem.js";
import { type IDashboardListProps } from "./types.js";
import { dashboardMatch } from "../drill/utils/dashboardPredicate.js";

const alignPoints = [
    {
        align: "bl tl",
    },
    {
        align: "tl bl",
    },
];

const ITEM_HEIGHT = 25;
const DROPDOWN_BODY_WIDTH = 240;
const DROPDOWN_BODY_HEIGHT = 319;

export function DashboardList({ selected, dashboards, onSelect }: IDashboardListProps) {
    const selectedDashboard = useMemo(() => {
        return selected && dashboards.find((d) => dashboardMatch(d.identifier, d.ref, selected));
    }, [selected, dashboards]);
    const intl = useIntl();
    const dropdownLabel = selectedDashboard
        ? selectedDashboard.title
        : intl.formatMessage({
              id: "configurationPanel.drillConfig.selectDashboard",
          });
    const [searchString, setSearchString] = useState("");

    const items = useMemo(() => {
        let items = dashboards.filter(({ title }) =>
            title.toLowerCase().includes(searchString.toLowerCase()),
        );

        if (selectedDashboard) {
            items = items.map((item) =>
                item.identifier === selectedDashboard.identifier ? { ...item, selected: true } : item,
            );
        }

        return sortBy(items, (dashboard) => dashboard.title.toLowerCase());
    }, [dashboards, searchString, selectedDashboard]);

    const searchPlaceholder = intl.formatMessage({
        id: "configurationPanel.drillConfig.drillIntoDashboard.searchPlaceholder",
    });

    return (
        <Dropdown
            className="s-dashboards-dropdown"
            closeOnParentScroll
            closeOnMouseDrag={false}
            closeOnOutsideClick
            alignPoints={alignPoints}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="dashboards-dropdown-body s-dashboards-dropdown-body"
                    width={DROPDOWN_BODY_WIDTH}
                    height={DROPDOWN_BODY_HEIGHT}
                    searchString={searchString}
                    searchPlaceholder={searchPlaceholder}
                    itemHeight={ITEM_HEIGHT}
                    showSearch
                    items={items}
                    scrollToItem={selectedDashboard}
                    scrollToItemKeyExtractor={(item) => item.identifier}
                    onSearch={setSearchString}
                    renderItem={({ item }) => {
                        const isSelected = selectedDashboard && item.selected;
                        return (
                            <DashboardListItem
                                isSelected={isSelected}
                                title={item.title}
                                onClick={() => {
                                    onSelect(item);
                                    closeDropdown();
                                }}
                                accessibilityLimitation={item.accessibilityLimitation}
                            />
                        );
                    }}
                />
            )}
            onOpenStateChanged={() => {
                setSearchString("");
            }}
            renderButton={({ isOpen, toggleDropdown }) => (
                <DashboardListButton
                    accessibilityLimitation={selectedDashboard?.accessibilityLimitation}
                    label={dropdownLabel}
                    isOpen={isOpen}
                    toggleDropdown={toggleDropdown}
                />
            )}
        />
    );
}
