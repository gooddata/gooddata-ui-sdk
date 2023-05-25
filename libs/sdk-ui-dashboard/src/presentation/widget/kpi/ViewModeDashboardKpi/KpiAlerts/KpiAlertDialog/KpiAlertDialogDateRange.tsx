// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { IDateFilter, IDashboardDateFilter } from "@gooddata/sdk-model";
import { Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { getKpiAlertTranslationData } from "../utils/translationUtils.js";

interface IKpiAlertDialogDateRangeProps {
    filter: IDateFilter | IDashboardDateFilter | undefined;
    dateFormat: string;
}

export const KpiAlertDialogDateRange: React.FC<IKpiAlertDialogDateRangeProps> = ({ filter, dateFormat }) => {
    const intl = useIntl();
    const theme = useTheme();
    const translationData = getKpiAlertTranslationData(filter, intl, dateFormat);
    if (!translationData) {
        return null;
    }
    const { intlIdRoot, rangeText } = translationData;

    return (
        <FormattedMessage
            id={intlIdRoot}
            values={{
                calendarIcon: (
                    <Icon.Date className="gd-icon-calendar-kpi" color={theme?.palette?.complementary?.c6} />
                ),
                range: <strong>{rangeText}</strong>,
            }}
        />
    );
};
