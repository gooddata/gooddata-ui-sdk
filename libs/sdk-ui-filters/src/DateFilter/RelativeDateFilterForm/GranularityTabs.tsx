// (C) 2019-2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DateFilterGranularity } from "@gooddata/sdk-model";
import sortBy from "lodash/sortBy.js";

import { TabsWrapper, Tab } from "../Tabs/Tabs.js";
import { granularityIntlCodes } from "../constants/i18n.js";
import { messages } from "../../locales.js";
import { IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

const granularityOrders: { [G in DateFilterGranularity]: number } = {
    "GDC.time.year": 0,
    "GDC.time.quarter": 1,
    "GDC.time.month": 2,
    "GDC.time.week_us": 3,
    "GDC.time.date": 4,
    "GDC.time.hour": 5,
    "GDC.time.minute": 6,
};

const sortGranularities = (granularities: DateFilterGranularity[]): DateFilterGranularity[] =>
    sortBy(granularities, (granularity) => granularityOrders[granularity]);

export interface IGranularityTabsProps {
    availableGranularities: DateFilterGranularity[];
    selectedGranularity: DateFilterGranularity;
    accessibilityConfig?: IAccessibilityConfigBase;
    onSelectedGranularityChange: (granularity: DateFilterGranularity) => void;
}

export const GranularityTabs: React.FC<IGranularityTabsProps> = ({
    availableGranularities,
    selectedGranularity,
    accessibilityConfig,
    onSelectedGranularityChange,
}) => (
    <TabsWrapper className="gd-relative-filter-form-granularity-tabs s-relative-filter-form-granularity-tabs">
        {sortGranularities(availableGranularities)
            .map((granularity) => {
                const intlGranularity = granularityIntlCodes[granularity];
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
