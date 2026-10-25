// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type WeekStart } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { type DateFilterOption, type IUiAbsoluteDateFilterForm } from "@gooddata/sdk-ui-filters";
import { AbsoluteDateFilterForm } from "@gooddata/sdk-ui-filters/internal";

export interface IStaticDateRangeProps {
    selectedFilter: DateFilterOption;
    onChange: (filter: DateFilterOption) => void;
    dateFormat: string;
    isTimeEnabled: boolean;
    isSecondsEnabled?: boolean;
    weekStart?: WeekStart;
    submitForm: () => void;
}

export function StaticDateRange({
    dateFormat,
    selectedFilter,
    onChange,
    isTimeEnabled,
    isSecondsEnabled,
    weekStart,
    submitForm,
}: IStaticDateRangeProps) {
    const intl = useIntl();
    return (
        <div className="subsection-wrap">
            <div className="subsection">
                <IntlWrapper locale={intl.locale}>
                    <AbsoluteDateFilterForm
                        selectedFilterOption={selectedFilter as IUiAbsoluteDateFilterForm}
                        onSelectedFilterOptionChange={onChange}
                        dateFormat={dateFormat}
                        isMobile={false}
                        isTimeEnabled={isTimeEnabled}
                        isSecondsEnabled={isSecondsEnabled}
                        weekStart={weekStart}
                        shouldOverlayDatePicker
                        submitForm={submitForm}
                        availableGranularities={[]}
                    />
                </IntlWrapper>
            </div>
        </div>
    );
}
