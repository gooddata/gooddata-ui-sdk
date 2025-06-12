// (C) 2024 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { getGranularPermissionTitle, granularTooltipMessages } from "./locales.js";
import { QuestionMarkIcon } from "./QuestionMarkIcon.js";
import { IPermissionsItem, WorkspacePermission } from "../../types.js";

interface IWorkspaceAccessPermissionItemProps {
    item: WorkspacePermission;
    checked: boolean;
    onChange: () => void;
}

export const WorkspaceAccessPermissionItem: React.FC<IWorkspaceAccessPermissionItemProps> = (props) => {
    const { item, checked, onChange } = props;

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
};

interface IAdditionalAccessPermissionItemProps {
    item: IPermissionsItem;
    checked: boolean;
    indefinite: boolean;
    disabled: boolean;
    onChange: () => void;
}

export const AdditionalAccessPermissionItem: React.FC<IAdditionalAccessPermissionItemProps> = (props) => {
    const { item, checked, indefinite, disabled, onChange } = props;

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
                <QuestionMarkIcon bubbleTextId={granularTooltipMessages[item.id].id} width={14} height={14} />
            </div>
        </div>
    );
};
