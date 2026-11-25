// (C) 2026 GoodData Corporation

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import type { IDateRangeParameterPeriod } from "@gooddata/sdk-model";

import { toPeriodGranularity } from "../parameter/dateRangePeriod.js";
import { formatPeriodRange } from "../parameter/periodRangeLabel.js";

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
                content={formatPeriodRange(intl, period)}
            />
        </>
    );
}
