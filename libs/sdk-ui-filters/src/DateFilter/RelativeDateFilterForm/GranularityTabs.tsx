// (C) 2019-2025 GoodData Corporation

import { sortBy } from "lodash-es";
import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { type IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

import { messages } from "../../locales.js";
import { granularityIntlCodesFull } from "../constants/i18n.js";
import { Tab, TabsWrapper } from "../Tabs/Tabs.js";

const granularityOrders: { [G in DateFilterGranularity]: number } = {
    "GDC.time.fiscal_year": 0,
    "GDC.time.fiscal_quarter": 1,
    "GDC.time.fiscal_month": 2,
    "GDC.time.year": 3,
    "GDC.time.quarter": 4,
    "GDC.time.month": 5,
    "GDC.time.week_us": 6,
    "GDC.time.date": 7,
    "GDC.time.hour": 8,
    "GDC.time.minute": 9,
};

const sortGranularities = (granularities: DateFilterGranularity[]): DateFilterGranularity[] =>
    sortBy(granularities, (granularity) => granularityOrders[granularity]);

export interface IGranularityTabsProps {
    availableGranularities: DateFilterGranularity[];
    selectedGranularity: DateFilterGranularity;
    accessibilityConfig?: IAccessibilityConfigBase;
    onSelectedGranularityChange: (granularity: DateFilterGranularity) => void;
}

export function GranularityTabs({
    availableGranularities,
    selectedGranularity,
    accessibilityConfig,
    onSelectedGranularityChange,
}: IGranularityTabsProps) {
    return (
        <TabsWrapper className="gd-relative-filter-form-granularity-tabs s-relative-filter-form-granularity-tabs">
            {sortGranularities(availableGranularities)
                .map((granularity) => {
                    const intlGranularity = granularityIntlCodesFull[granularity];
                    if (intlGranularity === undefined) {
                        return null;
                    }
                    return (
                        <Tab
                            key={granularity}
                            selected={granularity === selectedGranularity}
                            onClick={() => onSelectedGranularityChange(granularity)}
                            className={`s-granularity-${intlGranularity}`}
                            accessibilityConfig={accessibilityConfig}
                        >
                            <FormattedMessage id={messages[intlGranularity].id} />
                        </Tab>
                    );
                })
                .filter(Boolean)}
        </TabsWrapper>
    );
}
