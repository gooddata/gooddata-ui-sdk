// (C) 2020-2022 GoodData Corporation
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Dropdown, DropdownList } from "@gooddata/sdk-ui-kit";

import { DashboardListItem } from "./DashboardListItem";
import { DashboardListButton } from "./DashboardListButton";
import { dashboardMatch } from "../drill/utils/dashboardPredicate";
import { IDashboardListProps } from "./types";

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

export const DashboardList: React.FC<IDashboardListProps> = ({ selected, dashboards, onSelect }) => {
    const selectedDashboard = useMemo(() => {
        return selected && dashboards.find((d) => dashboardMatch(d.id, d.ref, selected));
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
            title?.toLowerCase().includes(searchString.toLowerCase()),
        );

        if (selectedDashboard) {
            items = items.map((item) =>
                item.id === selectedDashboard.id ? { ...item, selected: true } : item,
            );
        }

        return items;
    }, [dashboards, searchString, selectedDashboard]);

    const searchPlaceholder = intl.formatMessage({
        id: "configurationPanel.drillConfig.drillIntoDashboard.searchPlaceholder",
    });

    return (
        <Dropdown
            className="s-dashboards-dropdown"
            closeOnParentScroll={true}
            closeOnMouseDrag={false}
            closeOnOutsideClick={true}
            alignPoints={alignPoints}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="dashboards-dropdown-body s-dashboards-dropdown-body"
                    width={DROPDOWN_BODY_WIDTH}
                    height={DROPDOWN_BODY_HEIGHT}
                    searchString={searchString}
                    searchPlaceholder={searchPlaceholder}
                    itemHeight={ITEM_HEIGHT}
                    showSearch={true}
                    items={items}
                    scrollToItem={selectedDashboard}
                    onSearch={setSearchString}
                    renderItem={({ item }) => {
                        const isSelected = selectedDashboard && item.selected;
                        return (
                            <DashboardListItem
                                isSelected={isSelected}
                                title={item.title}
                                onClick={() => {
                                    if (selected && !dashboardMatch(item.id, item.ref, selected)) {
                                        onSelect(item);
                                    }
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
};
