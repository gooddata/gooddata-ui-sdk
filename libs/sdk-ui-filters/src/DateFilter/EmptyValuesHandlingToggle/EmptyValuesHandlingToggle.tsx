// (C) 2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { isSpaceKey } from "@gooddata/sdk-ui-kit";

export type EmptyValuesHandlingToggleMode = "exclude" | "include";

const DATA_TESTID = "date-filter-empty-values-handling";
const DATA_TESTID_CHECKBOX = "date-filter-empty-values-handling-checkbox";

interface IEmptyValuesHandlingToggleProps {
    mode: EmptyValuesHandlingToggleMode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

const LABEL_MESSAGE_ID_BY_MODE: Record<EmptyValuesHandlingToggleMode, string> = {
    exclude: "filters.emptyValuesHandling.exclude",
    include: "filters.emptyValuesHandling.include",
};

export function EmptyValuesHandlingToggle({
    mode,
    checked,
    onChange,
    className,
}: IEmptyValuesHandlingToggleProps) {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isSpaceKey(e)) {
            e.preventDefault();
            onChange(!checked);
        }
    };

    const labelMessageId = LABEL_MESSAGE_ID_BY_MODE[mode];

    return (
        <div className={cx(className)} data-testid={DATA_TESTID}>
            <label className={"input-checkbox-label"}>
                <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    onKeyDown={handleKeyDown}
                    data-testid={DATA_TESTID_CHECKBOX}
                />
                &ensp;
                <span className="input-label-text">
                    <FormattedMessage id={labelMessageId} />
                </span>
            </label>
        </div>
    );
}
