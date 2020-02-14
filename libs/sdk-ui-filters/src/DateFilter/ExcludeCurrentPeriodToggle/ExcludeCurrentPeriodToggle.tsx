// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";

import { ExcludeCurrentPeriodToggleLabel } from "./ExcludeCurrentPeriodToggleLabel";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

interface IExcludeCurrentPeriodToggleProps {
    value: boolean;
    onChange: (excludeCurrentPeriod: boolean) => void;
    disabled?: boolean;
    granularity?: ExtendedDateFilters.DateFilterGranularity;
}

const alignPoints = [{ align: "tc bc" }];

export const ExcludeCurrentPeriodToggle: React.FC<IExcludeCurrentPeriodToggleProps> = ({
    value,
    onChange,
    disabled,
    granularity,
}) => (
    <div className="gd-extended-date-filter-exclude-current">
        <BubbleHoverTrigger>
            <label className={cx("s-exclude-current-period", "input-checkbox-label")}>
                <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={value}
                    onChange={e => onChange(e.target.checked)} // tslint:disable-line:jsx-no-lambda
                    disabled={disabled}
                />
                &ensp;
                <ExcludeCurrentPeriodToggleLabel granularity={granularity} disabled={disabled} />
            </label>
            {disabled && (
                <Bubble alignPoints={alignPoints}>
                    <FormattedMessage id="filters.excludeCurrentPeriod.unavailable" />
                </Bubble>
            )}
        </BubbleHoverTrigger>
    </div>
);
