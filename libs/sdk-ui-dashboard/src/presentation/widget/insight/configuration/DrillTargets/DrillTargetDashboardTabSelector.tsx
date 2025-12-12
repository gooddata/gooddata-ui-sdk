// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IDashboardTab } from "@gooddata/sdk-model";
import { Dropdown, DropdownButton, SingleSelectListItem, UiListbox } from "@gooddata/sdk-ui-kit";

const DROPDOWN_WIDTH = 150;

interface IDrillTargetTabSelectorProps {
    tabs: IDashboardTab[];
    selectedTabId?: string;
    onSelect: (tabId: string | undefined) => void;
}

interface ITabItem {
    id: string;
    title: string;
}

const alignPoints = [
    {
        align: "bl tl",
    },
    {
        align: "tl bl",
    },
];

export function DrillTargetDashboardTabSelector({
    tabs,
    selectedTabId,
    onSelect,
}: IDrillTargetTabSelectorProps) {
    const intl = useIntl();
    const items = useMemo<ITabItem[]>(() => {
        return tabs.map((tab) => ({
            id: tab.localIdentifier,
            title: tab.title ? tab.title : intl.formatMessage({ id: "dashboard.tabs.default.label" }),
        }));
    }, [tabs, intl]);

    const selectedItem = useMemo(() => {
        return items.find((item) => item.id === selectedTabId) ?? items[0];
    }, [items, selectedTabId]);

    const handleSelect = useCallback(
        (item: ITabItem) => {
            // Empty id means "Default" (first tab)
            onSelect(item.id || undefined);
        },
        [onSelect],
    );

    // Only render if dashboard has multiple tabs
    if (!tabs || tabs.length <= 1) {
        return null;
    }

    return (
        <div className="gd-drill-target-tab-selector-container">
            <span className="gd-drill-target-tab-selector__label">
                {intl.formatMessage({ id: "configurationPanel.drillConfig.targetTab" })}
            </span>
            <Dropdown
                className="gd-tabs-dropdown s-tabs-dropdown"
                closeOnParentScroll
                closeOnMouseDrag={false}
                closeOnOutsideClick
                alignPoints={alignPoints}
                renderButton={({ isOpen, toggleDropdown }) => (
                    <DropdownButton
                        className="gd-tabs-dropdown-button"
                        value={selectedItem?.title}
                        isOpen={isOpen}
                        onClick={toggleDropdown}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => {
                    const listboxItems = items.map((item) => ({
                        type: "interactive" as const,
                        id: item.id,
                        stringTitle: item.title,
                        data: item,
                    }));

                    return (
                        <UiListbox
                            shouldKeyboardActionStopPropagation
                            shouldKeyboardActionPreventDefault
                            dataTestId="s-tab-select-list"
                            items={listboxItems}
                            width={DROPDOWN_WIDTH}
                            selectedItemId={selectedTabId ?? items[0]?.id}
                            shouldCloseOnSelect
                            onSelect={(item) => {
                                handleSelect(item.data);
                            }}
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes}
                            InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                                return (
                                    <SingleSelectListItem
                                        title={item.data.title}
                                        isSelected={isSelected}
                                        isFocused={isFocused}
                                        onClick={onSelect}
                                        className="gd-tab-select_list-item"
                                    />
                                );
                            }}
                        />
                    );
                }}
            />
        </div>
    );
}
