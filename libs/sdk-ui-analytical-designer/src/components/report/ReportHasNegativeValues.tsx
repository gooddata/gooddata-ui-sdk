// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";
import { useSelector } from "react-redux";

import { COLUMN } from "../../constants/visualization_types.js";
import { reportMessageSelector } from "../../selectors/report_message_selector.js";
import { type IAppState } from "../../store/types.js";
import { findVisualizationClass, isVisualizationClassDeprecated } from "../../utils/visualization_class.js";

import { ReportMessage } from "./ReportMessage.js";

export function ReportHasNegativeValues() {
    const visualizationClasses = useSelector(
        (state: IAppState) => reportMessageSelector(state).visualizationClasses,
    );
    const visualizationClass = findVisualizationClass(visualizationClasses, COLUMN);
    const isDeprecated = isVisualizationClassDeprecated(visualizationClass);

    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.negative_values.header" }).id}
            className="adi-canvas-message-invalid-conf s-error-negative-value s-report-message-type-negative_values"
        >
            {isDeprecated ? (
                <span className="s-error-negative-value-without-switch">
                    <FormattedMessage id="dashboard.message.negative_values.description.without_switch" />
                </span>
            ) : (
                <FormattedMessage
                    id="dashboard.message.negative_values.description"
                    values={{
                        br: <br />,
                    }}
                />
            )}
        </ReportMessage>
    );
}
