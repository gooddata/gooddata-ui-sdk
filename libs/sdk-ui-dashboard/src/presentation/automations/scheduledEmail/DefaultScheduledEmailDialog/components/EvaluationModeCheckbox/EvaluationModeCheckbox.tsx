// (C) 2025-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Checkbox, UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import { type IScheduledEmailDialogEvaluationModeProps } from "../../../types.js";

export function EvaluationModeCheckbox({ isShared, onChange }: IScheduledEmailDialogEvaluationModeProps) {
    const intl = useIntl();

    return (
        <div className="gd-input-component">
            <div className="gd-label"></div>
            <div className="gd-evaluation-mode-checkbox">
                <Checkbox
                    text={intl.formatMessage({ id: "dialogs.schedule.email.evaluation.mode.shared" })}
                    value={isShared}
                    onChange={onChange}
                />
                <UiTooltip
                    content={intl.formatMessage({ id: "dialogs.schedule.email.evaluation.mode.tooltip" })}
                    anchor={<UiIcon type="question" size={14} color="complementary-6" layout="block" />}
                    triggerBy={["hover", "focus", "click"]}
                />
            </div>
        </div>
    );
}
