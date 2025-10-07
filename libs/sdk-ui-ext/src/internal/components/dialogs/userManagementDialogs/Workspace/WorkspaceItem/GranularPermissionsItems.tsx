// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { getGranularPermissionTitle, granularTooltipMessages } from "./locales.js";
import { QuestionMarkIcon } from "./QuestionMarkIcon.js";
import { IPermissionsItem, WorkspacePermission } from "../../types.js";

interface IWorkspaceAccessPermissionItemProps {
    item: WorkspacePermission;
    checked: boolean;
    onChange: () => void;
}

export function WorkspaceAccessPermissionItem({
    item,
    checked,
    onChange,
}: IWorkspaceAccessPermissionItemProps) {
    return (
        <div>
            <label className="input-radio-label">
                <input
                    type="radio"
                    className="input-radio"
                    name="workspace-access-permission"
                    checked={checked}
                    onChange={onChange}
                />
                <span className="input-label-text">
                    <FormattedMessage id={getGranularPermissionTitle(item).id} />
                </span>
            </label>
        </div>
    );
}

interface IAdditionalAccessPermissionItemProps {
    item: IPermissionsItem;
    checked: boolean;
    indefinite: boolean;
    disabled: boolean;
    onChange: () => void;
}

export function AdditionalAccessPermissionItem({
    item,
    checked,
    indefinite,
    disabled,
    onChange,
}: IAdditionalAccessPermissionItemProps) {
    return (
        <div className="gd-granular-permissions__additional-access-item">
            {item.group ? <div className="gd-granular-permissions__additional-access-item-indent" /> : null}
            <label className="input-checkbox-label">
                <input
                    type="checkbox"
                    className={cx("input-checkbox", { "checkbox-indefinite": indefinite })}
                    name="additional-access-permission"
                    checked={checked || indefinite}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="input-label-text">
                    <FormattedMessage id={getGranularPermissionTitle(item.id).id} />
                </span>
            </label>
            <div className="gd-granular-permissions__additional-access-item-info">
                {item.id in granularTooltipMessages && (
                    <QuestionMarkIcon
                        bubbleTextId={
                            granularTooltipMessages[item.id as keyof typeof granularTooltipMessages].id
                        }
                        width={14}
                        height={14}
                    />
                )}
            </div>
        </div>
    );
}
