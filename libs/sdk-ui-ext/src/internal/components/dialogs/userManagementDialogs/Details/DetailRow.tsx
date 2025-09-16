// (C) 2023-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { Input } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { messages } from "../locales.js";
import { ListMode } from "../types.js";

export interface IDetailRowProps {
    mode: ListMode;
    labelText: string;
    value?: string;
    disabled?: boolean;
    onChange: (value: string | number) => void;
}

export function DetailRow({ labelText, value, mode, disabled, onChange }: IDetailRowProps) {
    const intl = useIntl();
    const viewClassNames = cx("gd-user-management-dialog-detail-value", {
        "gd-user-management-dialog-detail-value-empty": !value,
    });
    const inputClassNames = cx(
        "gd-user-management-dialog-detail-input",
        `s-user-management-input-${stringUtils.simplifyText(labelText)}`,
    );
    return (
        <div className="gd-user-management-dialog-detail-row">
            <div className="gd-user-management-dialog-detail-label">{labelText}</div>
            {mode === "VIEW" && (
                <div className={viewClassNames}>{value || intl.formatMessage(messages.emptyDetailValue)}</div>
            )}
            {mode === "EDIT" && (
                <div>
                    <Input
                        value={value}
                        disabled={disabled}
                        onChange={onChange}
                        className={inputClassNames}
                    />
                </div>
            )}
        </div>
    );
}
