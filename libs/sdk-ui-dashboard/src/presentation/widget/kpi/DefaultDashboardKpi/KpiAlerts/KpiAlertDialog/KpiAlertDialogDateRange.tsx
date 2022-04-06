// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { IDateFilter, IDashboardDateFilter, ITheme } from "@gooddata/sdk-model";
import { Icon } from "@gooddata/sdk-ui-kit";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { getKpiAlertTranslationData } from "../utils/translationUtils";

interface IKpiAlertDialogDateRangeProps {
    filter: IDateFilter | IDashboardDateFilter | undefined;
    dateFormat: string;
    theme?: ITheme;
}

const KpiAlertDialogDateRangeComponent: React.FC<IKpiAlertDialogDateRangeProps & WrappedComponentProps> = ({
    filter,
    intl,
    dateFormat,
    theme,
}) => {
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

export const KpiAlertDialogDateRange = injectIntl(withTheme(KpiAlertDialogDateRangeComponent));
