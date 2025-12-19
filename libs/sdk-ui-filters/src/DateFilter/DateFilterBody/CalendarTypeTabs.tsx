// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { UiTabs } from "@gooddata/sdk-ui-kit";

import { type CalendarTabType } from "../utils/presetFilterUtils.js";

interface ICalendarTypeTabsProps {
    selectedTab: CalendarTabType;
    onTabSelect: (tab: CalendarTabType) => void;
}

/**
 * Tabs component for switching between Standard and Fiscal calendar presets.
 * @internal
 */
export function CalendarTypeTabs({ selectedTab, onTabSelect }: ICalendarTypeTabsProps) {
    const intl = useIntl();

    return (
        <div className="gd-date-preset-tabs s-date-preset-tabs">
            <UiTabs
                size="small"
                tabs={[
                    {
                        id: "standard" as const,
                        label: intl.formatMessage({ id: "dateFilter.tab.standard" }),
                    },
                    {
                        id: "fiscal" as const,
                        label: intl.formatMessage({ id: "dateFilter.tab.fiscal" }),
                    },
                ]}
                selectedTabId={selectedTab}
                onTabSelect={(tab) => onTabSelect(tab.id)}
            />
        </div>
    );
}
