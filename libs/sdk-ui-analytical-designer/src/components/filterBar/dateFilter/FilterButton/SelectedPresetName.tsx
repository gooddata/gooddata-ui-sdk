// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { isAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import { FilterLabel } from "@gooddata/sdk-ui-kit";

import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";
import { type IDateFilterOption } from "../dateFilterOptionFactory.js";

export interface ISelectedPresetNameProps {
    filter: IDateFilterOption;
    dateFormat: string;
    isInDefaultState: boolean;
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
}

function PresetName({
    filter: { filterOption, excludeCurrentPeriod },
    dateFormat,
    isInDefaultState,
    emptyDateValuesFilterMode,
    emptyValuesLabel,
    exceptLabel,
}: ISelectedPresetNameProps & { emptyValuesLabel: string; exceptLabel: string }) {
    const sdkIntl = useIntl();
    const actualFilter = DateFilterHelpers.applyExcludeCurrentPeriod(filterOption, excludeCurrentPeriod);
    const selectionTitle = DateFilterHelpers.getDateFilterTitleUsingTranslator(
        actualFilter,
        sdkIntl,
        "full",
        dateFormat,
    );
    const isAllTime = isAllTimeDateFilterOption(filterOption);

    if (emptyDateValuesFilterMode === "only") {
        return <FilterLabel title={emptyValuesLabel} noData={false} isDate />;
    }

    if (emptyDateValuesFilterMode === "exclude" && isAllTime) {
        const selectionTitleWithEmptyValues = `${selectionTitle} ${exceptLabel} ${emptyValuesLabel}`;
        return <FilterLabel title={selectionTitleWithEmptyValues} noData={false} isDate />;
    }

    if (isInDefaultState) {
        return <>{selectionTitle}</>;
    }

    return <FilterLabel title={selectionTitle} noData={false} isDate />;
}

export function SelectedPresetName(props: ISelectedPresetNameProps) {
    const adIntl = useIntl();

    // These need to be passed down, since PresetName uses a different intl context
    const emptyValuesLabel = adIntl.formatMessage({ id: "filter.date.additional_filter.empty_values" });
    const exceptLabel = adIntl.formatMessage({ id: "gs.list.except" });

    return (
        <IntlWrapper locale={adIntl.locale}>
            <PresetName {...props} emptyValuesLabel={emptyValuesLabel} exceptLabel={exceptLabel} />
        </IntlWrapper>
    );
}
