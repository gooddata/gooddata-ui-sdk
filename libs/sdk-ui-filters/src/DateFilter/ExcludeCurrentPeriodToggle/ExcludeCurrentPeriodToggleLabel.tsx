// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import { messages } from "../../locales.js";
import { granularityIntlCodes } from "../constants/i18n.js";

interface IExcludeCurrentPeriodToggleLabelProps {
    disabled?: boolean;
    granularity?: DateFilterGranularity;
    id?: string;
}

export function ExcludeCurrentPeriodToggleLabel({
    disabled,
    granularity,
    id: labelId,
}: IExcludeCurrentPeriodToggleLabelProps) {
    const granularityIntlCode = granularity ? granularityIntlCodes[granularity] : undefined;
    const id =
        !disabled && granularity !== undefined && granularityIntlCode !== undefined
            ? messages[`${granularityIntlCode}Excluded`].id
            : messages["allTimeExcluded"].id;
    return (
        <FormattedMessage id={id}>
            {(...children) => (
                <span className="input-label-text" id={labelId}>
                    {children}
                </span>
            )}
        </FormattedMessage>
    );
}
