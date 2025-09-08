// (C) 2007-2025 GoodData Corporation
import React from "react";

import { FormattedMessage } from "react-intl";

import { DateFilterGranularity } from "@gooddata/sdk-model";

import { messages } from "../../locales.js";
import { granularityIntlCodes } from "../constants/i18n.js";

interface IExcludeCurrentPeriodToggleLabelProps {
    disabled?: boolean;
    granularity?: DateFilterGranularity;
}

export function ExcludeCurrentPeriodToggleLabel({
    disabled,
    granularity,
}: IExcludeCurrentPeriodToggleLabelProps) {
    const granularityIntlCode = granularityIntlCodes[granularity];
    const id =
        !disabled && granularity !== undefined && granularityIntlCode !== undefined
            ? messages[`${granularityIntlCode}Excluded`].id
            : messages["allTimeExcluded"].id;
    return (
        <FormattedMessage id={id}>
            {(...children) => <span className="input-label-text">{children}</span>}
        </FormattedMessage>
    );
}
