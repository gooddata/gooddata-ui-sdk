// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

import { selectSupportedEmptyCanvasDragTypes } from "../../selectors/ui_config_selector.js";

export function ReportBlank({ isSmallScreen }: { isSmallScreen?: boolean }) {
    const supportedEmptyCanvasDragTypes = useSelector(selectSupportedEmptyCanvasDragTypes);

    // by default we show the message with all supported types
    let header = (
        <FormattedMessage
            id="dashboard.message.blank.header"
            values={{
                fact: <span className="fact-field-icon" />,
                metric: <span className="metric-field-icon" />,
                measure: <span className="measure-field-icon" />,
                attribute: <span className="attr-field-icon" />,
            }}
        />
    );

    if (supportedEmptyCanvasDragTypes?.length === 1 && supportedEmptyCanvasDragTypes.includes("attribute")) {
        header = (
            <FormattedMessage
                id="dashboard.message.blank.header.attribute"
                values={{
                    attribute: <span className="attr-field-icon" />,
                }}
            />
        );
    }

    return (
        <div
            className={cx(
                [
                    "adi-blank-canvas-message",
                    "s-blank-canvas-message",
                    "s-report-message-type-blank",
                    "s-error-report-blank",
                ],
                {
                    "adi-blank-canvas-message-small": isSmallScreen,
                },
            )}
        >
            <h2 className="s-report-message-title">{header}</h2>
            <p className="s-report-message-description">
                <FormattedMessage
                    id="dashboard.message.blank.description"
                    values={{
                        br: <br />,
                    }}
                />
            </p>
        </div>
    );
}
