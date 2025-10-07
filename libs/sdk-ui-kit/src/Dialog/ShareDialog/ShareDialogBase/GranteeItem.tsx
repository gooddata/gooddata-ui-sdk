// (C) 2021-2025 GoodData Corporation

import { ReactElement, useCallback, useMemo } from "react";

import cx from "classnames";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { invariant } from "ts-invariant";

import {
    GranteeGroupIcon,
    GranteeOwnerRemoveIcon,
    GranteeRemoveIcon,
    GranteeUserIcon,
    GranteeUserInactiveIcon,
} from "./GranteeIcons.js";
import { GranularGranteeGroupItem } from "./GranularPermissions/GranularGranteeGroupItem.js";
import { GranularGranteeUserItem } from "./GranularPermissions/GranularGranteeUserItem.js";
import {
    DialogModeType,
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeInactiveOwner,
    IGranteeItemProps,
    IGranteeUser,
    isGranteeGroup,
    isGranteeGroupAll,
    isGranteeRules,
    isGranteeUser,
    isGranularGranteeGroup,
    isGranularGranteeUser,
} from "./types.js";
import { getGranteeItemTestId, getGranteeLabel } from "./utils.js";
import { Button } from "../../../Button/index.js";
import { useIdPrefixed } from "../../../utils/useId.js";

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

const granteeUserTitleRenderer = (grantee: IGranteeUser, intl: IntlShape): ReactElement => {
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

function GranteeUserItem({ grantee, mode, onDelete }: IGranteeUserItemProps) {
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
}

function GranteeUserInactiveItem({ grantee }: IGranteeInactiveItemProps) {
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
}

function GranteeGroupItem({ grantee, onDelete, mode }: IGranteeGroupItemProps) {
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
        return undefined;
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
}

/**
 * @internal
 */
export function GranteeItemComponent({
    grantee,
    mode,
    currentUserPermissions,
    isSharedObjectLocked,
    isGranteeShareLoading,
    onDelete,
    onChange,
}: IGranteeItemProps) {
    const granularGranteeItemId = useIdPrefixed("grantee-item");

    if (isGranularGranteeUser(grantee)) {
        return (
            <GranularGranteeUserItem
                currentUserPermissions={currentUserPermissions}
                isSharedObjectLocked={isSharedObjectLocked}
                grantee={grantee}
                onChange={onChange}
                onDelete={onDelete}
                mode={mode}
                id={granularGranteeItemId}
                isGranteeShareLoading={isGranteeShareLoading}
            />
        );
    } else if (isGranularGranteeGroup(grantee) || isGranteeRules(grantee)) {
        return (
            <GranularGranteeGroupItem
                currentUserPermissions={currentUserPermissions}
                isSharedObjectLocked={isSharedObjectLocked}
                grantee={grantee}
                onChange={onChange}
                onDelete={onDelete}
                mode={mode}
                id={granularGranteeItemId}
                isGranteeShareLoading={isGranteeShareLoading}
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

    return null;
}
