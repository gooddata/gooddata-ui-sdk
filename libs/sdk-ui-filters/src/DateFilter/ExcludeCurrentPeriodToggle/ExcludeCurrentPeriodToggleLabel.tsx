// (C) 2007-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

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
    const granularityIntlCode = granularity ? granularityIntlCodes[granularity] : undefined;
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
