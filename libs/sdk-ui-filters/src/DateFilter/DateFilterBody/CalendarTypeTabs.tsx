// (C) 2025-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiTabs } from "@gooddata/sdk-ui-kit";

import { DATE_FILTER_ACTIVE_CALENDAR_TAB_ID } from "../accessibility/elementId.js";
import { type CalendarTabType } from "../utils/presetFilterUtils.js";

interface ICalendarTypeTabsProps {
    selectedTab: CalendarTabType;
    onTabSelect: (tab: CalendarTabType) => void;
    tabIds?: {
        standard: string;
        fiscal: string;
    };
    panelId?: string;
}

/**
 * Tabs component for switching between Standard and Fiscal calendar presets.
 * @internal
 */
export function CalendarTypeTabs({ selectedTab, onTabSelect, tabIds, panelId }: ICalendarTypeTabsProps) {
    const intl = useIntl();

    return (
        <div className="gd-date-preset-tabs s-date-preset-tabs" id={DATE_FILTER_ACTIVE_CALENDAR_TAB_ID}>
            <UiTabs
                size="small"
                tabs={[
                    {
                        id: "standard" as const,
                        label: intl.formatMessage({ id: "dateFilter.tab.standard" }),
                        ariaLabel: intl.formatMessage({ id: "dateFilter.tab.standard.ariaLabel" }),
                        tabId: tabIds?.standard,
                        panelId,
                        autoSelectOnFocus: true,
                    },
                    {
                        id: "fiscal" as const,
                        label: intl.formatMessage({ id: "dateFilter.tab.fiscal" }),
                        ariaLabel: intl.formatMessage({ id: "dateFilter.tab.fiscal.ariaLabel" }),
                        tabId: tabIds?.fiscal,
                        panelId,
                        autoSelectOnFocus: true,
                    },
                ]}
                selectedTabId={selectedTab}
                onTabSelect={(tab) => onTabSelect(tab.id)}
            />
        </div>
    );
}
