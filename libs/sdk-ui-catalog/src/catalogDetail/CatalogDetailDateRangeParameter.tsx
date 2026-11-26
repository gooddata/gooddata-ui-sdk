// (C) 2026 GoodData Corporation

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type IDateRangeParameterPeriod, resolveWeekStart } from "@gooddata/sdk-model";
import { formatDateRangeParameterPeriod, getLocalizedIcuDateFormatPattern } from "@gooddata/sdk-ui-filters";

import { toPeriodGranularity } from "../parameter/dateRangePeriod.js";
import { useFeatureFlags } from "../permission/PermissionsContext.js";

import { CatalogDetailContentRow } from "./CatalogDetailContentRow.js";

const messages = defineMessages({
    granularityTitle: { id: "analyticsCatalog.parameter.detail.granularity" },
    currentRangeTitle: { id: "analyticsCatalog.parameter.detail.currentRange" },
    granularity: { id: "analyticsCatalog.parameter.period.granularity" },
});

type Props = {
    period: IDateRangeParameterPeriod;
};

/** Detail rows of a date range parameter: the granularity of its period and the range it holds now. */
export function CatalogDetailDateRangeParameter({ period }: Props) {
    const intl = useIntl();
    // days in the user's date format and weeks from the user's week start, as the date filter writes them
    const settings = useFeatureFlags();
    const dateFormat = settings?.formatLocale
        ? getLocalizedIcuDateFormatPattern(settings.formatLocale)
        : settings?.responsiveUiDateFormat;
    return (
        <>
            <CatalogDetailContentRow
                title={<FormattedMessage {...messages.granularityTitle} />}
                content={intl.formatMessage(messages.granularity, {
                    granularity: toPeriodGranularity(period.granularity),
                })}
            />
            <CatalogDetailContentRow
                title={<FormattedMessage {...messages.currentRangeTitle} />}
                content={formatDateRangeParameterPeriod(period, intl, dateFormat, resolveWeekStart(settings))}
            />
        </>
    );
}
