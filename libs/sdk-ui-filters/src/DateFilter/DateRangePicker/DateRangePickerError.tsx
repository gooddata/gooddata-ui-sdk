// (C) 2019 GoodData Corporation
import * as React from "react";
import { injectIntl, FormattedMessage, WrappedComponentProps } from "react-intl";

import { getLocalizedDateFormat } from "../utils/FormattingUtils";

interface IDateRangePickerErrorProps {
    errorId: string;
}

const DateRangePickerErrorComponent: React.FC<IDateRangePickerErrorProps & WrappedComponentProps> = props => {
    const { errorId, intl } = props;

    return (
        <div className="gd-date-range-picker-error-message s-absolute-range-error">
            <FormattedMessage id={errorId} values={{ format: getLocalizedDateFormat(intl.locale) }} />
        </div>
    );
};

export const DateRangePickerError = injectIntl(DateRangePickerErrorComponent);
