// (C) 2007-2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

import { granularityIntlCodes } from "../constants/i18n.js";
import { DateFilterGranularity } from "@gooddata/sdk-model";
import { messages } from "../../locales.js";

interface IExcludeCurrentPeriodToggleLabelProps {
    disabled?: boolean;
    granularity?: DateFilterGranularity;
}

export const ExcludeCurrentPeriodToggleLabel: React.FC<IExcludeCurrentPeriodToggleLabelProps> = ({
    disabled,
    granularity,
}) => {
    const granularityIntlCode = granularityIntlCodes[granularity];
    const id =
        !disabled && granularity !== undefined && granularityIntlCode !== undefined
            ? messages[`${granularityIntlCode}Excluded`].id
            : messages.allTimeExcluded.id;
    return (
        <FormattedMessage id={id}>
            {(...children) => <span className="input-label-text">{children}</span>}
        </FormattedMessage>
    );
};
