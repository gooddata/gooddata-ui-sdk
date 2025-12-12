// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { type IAutomationMetadataObject, type ISeparators } from "@gooddata/sdk-model";
import { Input, type InputPureProps } from "@gooddata/sdk-ui-kit";

import { getDescription } from "../../../../alerting/DefaultAlertingDialog/utils/getters.js";
import { type AlertMetric } from "../../../../alerting/types.js";

export interface AlertTitleProps {
    id?: string;
    measures: AlertMetric[];
    alert: IAutomationMetadataObject | undefined;
    separators?: ISeparators;
    onChange: InputPureProps["onChange"];
}

export function AlertTitle({ id, alert, measures, separators, onChange }: AlertTitleProps) {
    const intl = useIntl();
    const description = getDescription(intl, measures, alert, separators);

    return (
        <Input
            id={id}
            isSmall
            type="string"
            className="gd-edit-alert__title-input title-input"
            value={alert?.title}
            placeholder={description}
            onChange={onChange}
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "insightAlert.config.accessibility.title" }),
            }}
        />
    );
}
