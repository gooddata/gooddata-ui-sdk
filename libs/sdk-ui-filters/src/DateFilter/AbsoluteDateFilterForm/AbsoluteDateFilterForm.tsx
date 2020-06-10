// (C) 2007-2019 GoodData Corporation
import * as React from "react";

import { dateFilterValueToDateRange, dateRangeToDateFilterValue } from "./conversions";
import { DateRangePicker, IDateRange } from "../DateRangePicker/DateRangePicker";
import { IExtendedDateFilterErrors, DateFilterOption } from "../interfaces";
import { IAbsoluteDateFilterForm } from "@gooddata/sdk-backend-spi";

interface IAbsoluteDateFilterFormProps {
    selectedFilterOption: IAbsoluteDateFilterForm;
    isMobile: boolean;
    errors: IExtendedDateFilterErrors["absoluteForm"];
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
}

const dayPickerProps = {
    firstDayOfWeek: 0, // Sunday, regardless of locale
};

export class AbsoluteDateFilterForm extends React.Component<IAbsoluteDateFilterFormProps> {
    public render(): React.ReactNode {
        const { isMobile, selectedFilterOption, errors } = this.props;
        return (
            <DateRangePicker
                onRangeChange={this.handleRangeChange}
                range={dateFilterValueToDateRange(selectedFilterOption)}
                errors={errors}
                isMobile={isMobile}
                dayPickerProps={dayPickerProps}
            />
        );
    }

    private handleRangeChange = (range: IDateRange): void => {
        this.props.onSelectedFilterOptionChange(
            dateRangeToDateFilterValue(range, this.props.selectedFilterOption.localIdentifier),
        );
    };
}
