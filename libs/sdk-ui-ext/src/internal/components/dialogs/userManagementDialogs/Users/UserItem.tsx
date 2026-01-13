// (C) 2023-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { type IUserMember, type ListMode } from "../types.js";

function GranteeUserIcon() {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-user gd-grantee-item-icon-left" />
        </div>
    );
}

const alignPoints = [{ align: "cr cl" }];

interface IRemoveIconProps {
    mode: ListMode;
    isDisabled: boolean;
    onClick: () => void;
}

function RemoveIcon({ mode, onClick, isDisabled }: IRemoveIconProps) {
    const intl = useIntl();
    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete">
            <span
                className={cx(
                    "gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right s-user-management-item-delete",
                    { "is-disabled": isDisabled },
                )}
                onClick={isDisabled ? undefined : onClick}
                aria-label="Group dialog user member delete"
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {mode === "VIEW"
                    ? intl.formatMessage(
                          isDisabled
                              ? messages.removeSavedUserDisabledTooltip
                              : messages.removeSavedUserTooltip,
                      )
                    : intl.formatMessage(messages.removeUnsavedUserTooltip)}
            </Bubble>
        </BubbleHoverTrigger>
    );
}

interface IUserItemProps {
    user: IUserMember;
    mode: ListMode;
    onDelete: (user: IUserMember) => void;
    isDeleteDisabled?: boolean;
}

export function UserItem({ mode, onDelete, user, isDeleteDisabled }: IUserItemProps) {
    const itemClassName = cx("s-user-management-item", "gd-share-dialog-grantee-item");

    return (
        <div className={itemClassName}>
            <RemoveIcon mode={mode} onClick={() => onDelete(user)} isDisabled={!!isDeleteDisabled} />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{user.title}</div>
                <div className="gd-grantee-content-label gd-grantee-content-email">{user.email}</div>
            </div>
            <GranteeUserIcon />
        </div>
    );
}
