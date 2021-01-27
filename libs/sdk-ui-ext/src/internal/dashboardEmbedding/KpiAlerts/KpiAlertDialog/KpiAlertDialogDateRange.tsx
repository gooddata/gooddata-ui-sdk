// (C) 2019-2021 GoodData Corporation
import React from "react";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { IDateFilter } from "@gooddata/sdk-model";
import { IDashboardDateFilter } from "@gooddata/sdk-backend-spi";

import { getKpiAlertTranslationData } from "./utils/translationUtils";

interface IKpiAlertDialogDateRangeProps {
    filter: IDateFilter | IDashboardDateFilter;
    dateFormat: string;
}

const KpiAlertDialogDateRangeComponent: React.FC<IKpiAlertDialogDateRangeProps & WrappedComponentProps> = ({
    filter,
    intl,
    dateFormat,
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
                calendarIcon: <span className="icon-calendar-kpi icon-calendar-kpi-no-margin" />,
                range: <strong>{rangeText}</strong>,
            }}
        />
    );
};

export const KpiAlertDialogDateRange = injectIntl(KpiAlertDialogDateRangeComponent);
