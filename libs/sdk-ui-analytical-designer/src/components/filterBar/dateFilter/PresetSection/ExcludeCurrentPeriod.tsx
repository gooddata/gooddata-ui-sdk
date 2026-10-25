// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { isRelativeDateFilterPreset } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { ExcludeCurrentPeriodToggle } from "@gooddata/sdk-ui-filters/internal";

import { type IDateFilterOption } from "../dateFilterOptionFactory.js";

export interface IExcludeCurrentPeriodProps {
    selectedFilter: IDateFilterOption;
    onChange: (value: boolean) => void;
}

export function ExcludeCurrentPeriod({
    selectedFilter: { filterOption, excludeCurrentPeriod },
    onChange,
}: IExcludeCurrentPeriodProps) {
    const intl = useIntl();
    const filterOptionGranularity = isRelativeDateFilterPreset(filterOption)
        ? filterOption.granularity
        : undefined;
    return (
        <div className="subsection-wrap exclude-period-subsection">
            <IntlWrapper locale={intl.locale}>
                <ExcludeCurrentPeriodToggle
                    value={excludeCurrentPeriod}
                    onChange={onChange}
                    disabled={false}
                    granularity={filterOptionGranularity}
                />
            </IntlWrapper>
        </div>
    );
}
