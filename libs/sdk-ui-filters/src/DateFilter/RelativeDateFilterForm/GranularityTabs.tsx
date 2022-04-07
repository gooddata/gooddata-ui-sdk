// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DateFilterGranularity } from "@gooddata/sdk-model";
import sortBy from "lodash/sortBy";

import { TabsWrapper, Tab } from "../Tabs/Tabs";
import { granularityIntlCodes } from "../constants/i18n";

const granularityOrders: { [G in DateFilterGranularity]: number } = {
    "GDC.time.date": 0,
    "GDC.time.week_us": 1,
    "GDC.time.month": 2,
    "GDC.time.quarter": 3,
    "GDC.time.year": 4,
};

const sortGranularities = (granularities: DateFilterGranularity[]): DateFilterGranularity[] =>
    sortBy(granularities, (granularity) => granularityOrders[granularity]);

export interface IGranularityTabsProps {
    availableGranularities: DateFilterGranularity[];
    selectedGranularity: DateFilterGranularity;
    onSelectedGranularityChange: (granularity: DateFilterGranularity) => void;
}

export const GranularityTabs: React.FC<IGranularityTabsProps> = ({
    availableGranularities,
    onSelectedGranularityChange,
    selectedGranularity,
}) => (
    <TabsWrapper className="gd-relative-filter-form-granularity-tabs s-relative-filter-form-granularity-tabs">
        {sortGranularities(availableGranularities).map((granularity) => {
            const intlGranularity = granularityIntlCodes[granularity];
            return (
                <Tab
                    key={granularity}
                    selected={granularity === selectedGranularity}
                    onClick={() => onSelectedGranularityChange(granularity)}
                    className={`s-granularity-${intlGranularity}`}
                >
                    <FormattedMessage id={`filters.granularity.${intlGranularity}s`} />
                </Tab>
            );
        })}
    </TabsWrapper>
);
