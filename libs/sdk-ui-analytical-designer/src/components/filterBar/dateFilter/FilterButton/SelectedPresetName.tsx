// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import { FilterLabel } from "@gooddata/sdk-ui-kit";

import { getPeriodTitleWithEmptyValues } from "../../../../models/empty_date_values_title.js";
import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";
import { type IDateFilterOption, isAllTimeOption } from "../dateFilterOptionFactory.js";

export interface ISelectedPresetNameProps {
    filter: IDateFilterOption;
    dateFormat: string;
    isInDefaultState: boolean;
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
}

function PresetName({
    filter,
    dateFormat,
    isInDefaultState,
    withEmptyValues,
}: Omit<ISelectedPresetNameProps, "emptyDateValuesFilterMode"> & {
    /** adds the empty date values mode to the period title; built outside, it needs the AD translations */
    withEmptyValues: (periodTitle: string, isAllTime: boolean) => string;
}) {
    const sdkIntl = useIntl();
    const { filterOption, excludeCurrentPeriod, period } = filter;
    // a period shows its title, not its range (Figma Specs 05); its empty values mode is worded like any period's
    const selectionTitle = period
        ? period.title
        : DateFilterHelpers.getDateFilterTitleUsingTranslator(
              DateFilterHelpers.applyExcludeCurrentPeriod(filterOption, excludeCurrentPeriod),
              sdkIntl,
              "full",
              dateFormat,
          );
    const title = withEmptyValues(selectionTitle, isAllTimeOption(filter));

    // a worded empty date values mode is never the default state
    if (isInDefaultState && title === selectionTitle) {
        return <>{selectionTitle}</>;
    }

    return <FilterLabel title={title} noData={false} isDate />;
}

export function SelectedPresetName({ emptyDateValuesFilterMode, ...props }: ISelectedPresetNameProps) {
    const adIntl = useIntl();

    // built here, since PresetName renders in the SDK intl context
    const withEmptyValues = (periodTitle: string, isAllTime: boolean) =>
        getPeriodTitleWithEmptyValues(periodTitle, isAllTime, emptyDateValuesFilterMode, adIntl);

    return (
        <IntlWrapper locale={adIntl.locale}>
            <PresetName {...props} withEmptyValues={withEmptyValues} />
        </IntlWrapper>
    );
}
