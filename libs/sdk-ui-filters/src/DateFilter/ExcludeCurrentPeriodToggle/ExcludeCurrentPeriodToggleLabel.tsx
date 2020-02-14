// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { granularityIntlCodes } from "../constants/i18n";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

interface IExcludeCurrentPeriodToggleLabelProps {
    disabled?: boolean;
    granularity?: ExtendedDateFilters.DateFilterGranularity;
}

export const ExcludeCurrentPeriodToggleLabel: React.FC<IExcludeCurrentPeriodToggleLabelProps> = props => {
    const id =
        !props.disabled && props.granularity
            ? `filters.${granularityIntlCodes[props.granularity]}.excludeCurrentPeriod`
            : "filters.allTime.excludeCurrentPeriod";
    return (
        <FormattedMessage id={id}>
            {(...children) => <span className="input-label-text">{children}</span>}
        </FormattedMessage>
    );
};
