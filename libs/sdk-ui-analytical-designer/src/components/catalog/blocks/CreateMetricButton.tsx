// (C) 2020-2026 GoodData Corporation

import { useCallback } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { metricEditorOpenNew } from "../../../store/metric_editor/metric_editor_actions.js";
import { type AppDispatch } from "../../../store/types.js";

interface ICreateMetricButtonProps {
    disabled?: boolean;
}

export function CreateMetricButton({ disabled }: ICreateMetricButtonProps) {
    const dispatch = useDispatch<AppDispatch>();

    const onOpenMetricEditorDialog = useCallback(() => {
        dispatch(metricEditorOpenNew("CREATE_METRIC_BUTTON"));
    }, [dispatch]);

    const buttonClassNames = classNames("gd-button", "gd-button-link", "gd-icon-plus", {
        disabled,
    });

    const handleClick = () => !disabled && onOpenMetricEditorDialog();

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className={"adi-catalog-create_metric_button"}>
            <a className={buttonClassNames} onClick={handleClick}>
                <FormattedMessage id="dashboard.create_metric_button" />
            </a>
            {disabled ? (
                <Bubble className="bubble-primary" alignPoints={[{ align: "cr bl" }]}>
                    <FormattedMessage id={"catalog.add_calculated_measure_disabled"} />
                </Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
}
