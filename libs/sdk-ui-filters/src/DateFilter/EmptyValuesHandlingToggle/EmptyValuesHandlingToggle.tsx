// (C) 2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

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
    const labelMessageId = LABEL_MESSAGE_ID_BY_MODE[mode];
    const labelId = useIdPrefixed("date-filter-empty-values-handling-label");

    // Space is left to the native checkbox so assistive technologies announce the state change.
    return (
        <div className={cx(className)} data-testid={DATA_TESTID}>
            <label className={"input-checkbox-label"}>
                <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    data-testid={DATA_TESTID_CHECKBOX}
                    aria-labelledby={labelId}
                />
                &ensp;
                <span className="input-label-text" id={labelId}>
                    <FormattedMessage id={labelMessageId} />
                </span>
            </label>
        </div>
    );
}
