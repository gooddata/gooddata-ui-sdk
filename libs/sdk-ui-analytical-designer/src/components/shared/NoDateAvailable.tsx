// (C) 2007-2026 GoodData Corporation

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

interface INoDateAvailableProps {
    message: string;
    className?: string;
}

export function NoDateAvailable({ className = "", message }: INoDateAvailableProps) {
    const classes = classNames(className, [
        "no-date-available",
        "adi-filter-button",
        "adi-date-filter-button",
        "gd-button",
        "s-no-date-available",
    ]);

    return (
        <div className={classes}>
            <span className="gd-button-text s-explanation">
                <FormattedMessage id={message} />
            </span>
        </div>
    );
}
