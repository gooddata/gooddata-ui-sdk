// (C) 2007-2026 GoodData Corporation

import { memo, useCallback } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { stackMeasures, stackToPercent } from "../../actions/properties_actions.js";
import { optionalStackingSelector } from "../../selectors/optional_stacking_selector.js";
import { type AppDispatch } from "../../store/types.js";

import { ConfigurationCheckbox } from "./measure/ConfigurationCheckbox.js";

export const OptionalStacking = memo(function OptionalStacking() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const {
        isStackMeasuresVisible,
        isStackToPercentVisible,
        isStackMeasuresChecked,
        isStackToPercentChecked,
        isOptionalStackingDisabled,
        canStackInPercent,
        isStackToPercentDisabledByNegativeValues,
    } = useSelector(optionalStackingSelector);

    const onStackMeasuresChange = useCallback(
        (value: boolean) => {
            dispatch(stackMeasures(value));
        },
        [dispatch],
    );

    const onStackToPercentChange = useCallback(
        (value: boolean) => {
            dispatch(stackToPercent(value));
        },
        [dispatch],
    );

    const getClasses = () => {
        return classNames("optional-stacking s-optional-stacking", {
            "stack-measures-visible": isStackMeasuresVisible,
        });
    };

    if (!isStackMeasuresVisible && !isStackToPercentVisible) {
        return null;
    }

    return (
        <div className={getClasses()}>
            {isStackMeasuresVisible ? (
                <div className="stack-measures">
                    <ConfigurationCheckbox
                        checked={isStackMeasuresChecked}
                        onChange={onStackMeasuresChange}
                        label={intl.formatMessage({
                            id: "dashboard.bucket_item.stack_measures",
                        })}
                        name="stack-measures"
                        disabled={isOptionalStackingDisabled}
                    />
                </div>
            ) : null}
            {isStackToPercentVisible ? (
                <div className="stack-to-percent">
                    <ConfigurationCheckbox
                        checked={isStackToPercentChecked}
                        onChange={onStackToPercentChange}
                        label={intl.formatMessage({
                            id: "dashboard.bucket_item.stack_to_percent",
                        })}
                        name="stack-to-percent"
                        disabled={
                            !canStackInPercent ||
                            isOptionalStackingDisabled ||
                            isStackToPercentDisabledByNegativeValues
                        }
                    />
                    {isStackToPercentChecked && isStackToPercentDisabledByNegativeValues ? (
                        <div className="adi-stack-warn s-stack-to-percent-negative-values-info">
                            {intl.formatMessage({
                                id: "dashboard.bucket_item.stack_to_percent.negative_values_info",
                            })}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
});
