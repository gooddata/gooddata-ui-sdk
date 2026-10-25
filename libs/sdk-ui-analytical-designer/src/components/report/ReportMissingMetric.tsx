// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";
import { useSelector } from "react-redux";

import { TABLE } from "../../constants/visualization_types.js";
import { reportMessageSelector } from "../../selectors/report_message_selector.js";
import { type IAppState } from "../../store/types.js";
import { findVisualizationClass, isVisualizationClassDeprecated } from "../../utils/visualization_class.js";

import { ReportMessage } from "./ReportMessage.js";

export function ReportMissingMetric() {
    const visualizationClasses = useSelector(
        (state: IAppState) => reportMessageSelector(state).visualizationClasses,
    );
    const visualizationClass = findVisualizationClass(visualizationClasses, TABLE);
    const isDeprecated = isVisualizationClassDeprecated(visualizationClass);

    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.missing_metric.header" }).id}
            className="adi-canvas-message-missing-metric s-error-missing-metric s-report-message-type-missing_metric"
        >
            {isDeprecated ? null : (
                <FormattedMessage
                    id="dashboard.message.missing_metric.description"
                    values={{
                        br: <br />,
                    }}
                />
            )}
        </ReportMessage>
    );
}
