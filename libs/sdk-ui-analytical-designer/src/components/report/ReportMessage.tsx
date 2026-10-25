// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

export function ReportMessage({
    headerMessageId,
    className,
    children,
}: {
    /**
     * Localization message ID of the text to be used in the header.
     */
    headerMessageId: string;
    /**
     * If specified, will be added to the top-level container.
     */
    className?: string;
    /**
     * Body of the description.
     */
    children: ReactNode;
}) {
    return (
        <div className={cx(["adi-canvas-message", "s-canvas-message", className])}>
            <h2 className="s-report-message-title">
                <FormattedMessage id={headerMessageId} />
            </h2>
            {children ? (
                <div className="report-message-description s-report-message-description">{children}</div>
            ) : null}
        </div>
    );
}
