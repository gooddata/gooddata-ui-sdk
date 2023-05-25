// (C) 2021-2023 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import cx from "classnames";
import {
    DialogModeType,
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeItemProps,
    IGranteeUser,
    IGranteeInactiveOwner,
    isGranteeUser,
    isGranteeGroup,
    isGranteeGroupAll,
    isGranularGranteeUser,
    isGranularGranteeGroup,
} from "./types.js";
import { getGranteeLabel, getGranteeItemTestId } from "./utils.js";
import {
    GranteeGroupIcon,
    GranteeOwnerRemoveIcon,
    GranteeRemoveIcon,
    GranteeUserIcon,
    GranteeUserInactiveIcon,
} from "./GranteeIcons.js";
import { Button } from "../../../Button/index.js";
import { GranularGranteeUserItem } from "./GranularPermissions/GranularGranteeUserItem.js";
import { GranularGranteeGroupItem } from "./GranularPermissions/GranularGranteeGroupItem.js";
import { invariant } from "ts-invariant";

interface IGranteeUserItemProps {
    grantee: IGranteeUser;
    mode: DialogModeType;
    onDelete: (grantee: GranteeItem) => void;
}

interface IGranteeInactiveItemProps {
    grantee: IGranteeInactiveOwner;
}

interface IGranteeGroupItemProps {
    grantee: IGranteeGroup | IGranteeGroupAll;
    mode: DialogModeType;
    onDelete: (grantee: GranteeItem) => void;
}

const granteeUserTitleRenderer = (grantee: IGranteeUser, intl: IntlShape): JSX.Element => {
    const userName = getGranteeLabel(grantee, intl);

    if (grantee.status === "Inactive") {
        const inactiveLabel = ` (${intl.formatMessage({
            id: "shareDialog.share.grantee.item.user.inactive",
        })})`;

        return (
            <>
                {userName}
                <span className="gd-grantee-content-label-inactive">{inactiveLabel}</span>
            </>
        );
    }

    return <> {userName} </>;
};

const GranteeUserItem: React.FC<IGranteeUserItemProps> = (props) => {
    const { grantee, mode, onDelete } = props;
    const intl = useIntl();

    const onClick = useCallback(() => {
        onDelete(grantee);
    }, [grantee, onDelete]);

    const itemClassName = cx(
        { "s-share-dialog-owner": grantee.isOwner, "s-share-dialog-current-user": grantee.isCurrentUser },
        "gd-share-dialog-grantee-item",
        getGranteeItemTestId(grantee),
    );

    return (
        <div className={itemClassName}>
            {grantee.isOwner ? (
                <GranteeOwnerRemoveIcon />
            ) : (
                <GranteeRemoveIcon mode={mode} onClick={onClick} />
            )}
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{granteeUserTitleRenderer(grantee, intl)}</div>
                <div className="gd-grantee-content-label gd-grantee-content-email">{grantee.email}</div>
            </div>

            {grantee.status === "Active" ? <GranteeUserIcon /> : <GranteeUserInactiveIcon />}
        </div>
    );
};

const GranteeUserInactiveItem: React.FC<IGranteeInactiveItemProps> = (props) => {
    const { grantee } = props;
    const intl = useIntl();

    const granteeLabel = useMemo(() => {
        return getGranteeLabel(grantee, intl);
    }, [grantee, intl]);

    const itemClassName = cx(
        "gd-share-dialog-grantee-item",
        "s-share-dialog-inactive-owner",
        getGranteeItemTestId(grantee),
    );

    return (
        <div className={itemClassName}>
            <GranteeOwnerRemoveIcon />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label-inactive">{granteeLabel}</div>
                <div className="gd-grantee-content-label-inactive gd-grantee-content-inactive">
                    <FormattedMessage id={"shareDialog.share.grantee.item.user.inactive.description"} />
                </div>
            </div>
            <GranteeUserInactiveIcon />
        </div>
    );
};

const GranteeGroupItem: React.FC<IGranteeGroupItemProps> = (props) => {
    const { grantee, onDelete, mode } = props;

    const intl = useIntl();

    const onClick = useCallback(() => {
        onDelete(grantee);
    }, [grantee, onDelete]);

    const groupName = useMemo(() => getGranteeLabel(grantee, intl), [grantee, intl]);

    const numOfUsers = useMemo(() => {
        if (grantee.memberCount) {
            return intl.formatMessage(
                {
                    id: "shareDialog.share.grantee.item.users.count",
                },
                { granteeCount: grantee.memberCount },
            );
        }
    }, [grantee, intl]);

    const itemClassName = cx("gd-share-dialog-grantee-item", getGranteeItemTestId(grantee));

    return (
        <div className={itemClassName}>
            <GranteeRemoveIcon mode={mode} onClick={onClick} />
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{groupName}</div>
                {numOfUsers ? (
                    <div className="gd-grantee-count-button">
                        <Button
                            className="gd-button-link-dimmed gd-button gd-grantee-content-user-count s-grantee-content-user-count"
                            value={numOfUsers}
                        />
                    </div>
                ) : null}
            </div>
            <GranteeGroupIcon />
        </div>
    );
};

/**
 * @internal
 */
export const GranteeItemComponent: React.FC<IGranteeItemProps> = (props) => {
    const { grantee, mode, currentUserPermissions, isSharedObjectLocked, onDelete, onChange } = props;

    if (isGranularGranteeUser(grantee)) {
        return (
            <GranularGranteeUserItem
                currentUserPermissions={currentUserPermissions}
                isSharedObjectLocked={isSharedObjectLocked}
                grantee={grantee}
                onChange={onChange}
                onDelete={onDelete}
                mode={mode}
            />
        );
    } else if (isGranularGranteeGroup(grantee)) {
        return (
            <GranularGranteeGroupItem
                currentUserPermissions={currentUserPermissions}
                isSharedObjectLocked={isSharedObjectLocked}
                grantee={grantee}
                onChange={onChange}
                onDelete={onDelete}
                mode={mode}
            />
        );
    } else if (isGranteeUser(grantee)) {
        return <GranteeUserItem grantee={grantee} mode={mode} onDelete={onDelete} />;
    } else if (grantee.type === "inactive_owner") {
        return <GranteeUserInactiveItem grantee={grantee} />;
    } else if (isGranteeGroup(grantee) || isGranteeGroupAll(grantee)) {
        return <GranteeGroupItem grantee={grantee} mode={mode} onDelete={onDelete} />;
    } else {
        invariant(grantee, "Illegal grantee used.");
    }
};
