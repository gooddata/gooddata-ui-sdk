// (C) 2021 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import {
    DialogModeType,
    GranteeItem,
    IGranteeGroup,
    IGranteeGroupAll,
    IGranteeItemProps,
    IGranteeUser,
} from "./types";
import { getGranteeLabel, getGranteeItemTestId } from "./utils";
import { GranteeGroupIcon, GranteeOwnerRemoveIcon, GranteeRemoveIcon, GranteeUserIcon } from "./GranteeIcons";
import { Button } from "../../../Button";

interface IGranteeUserItemProps {
    grantee: IGranteeUser;
    mode: DialogModeType;
    onDelete: (grantee: GranteeItem) => void;
}

interface IGranteeGroupItemProps {
    grantee: IGranteeGroup | IGranteeGroupAll;
    mode: DialogModeType;
    onDelete: (grantee: GranteeItem) => void;
}

const GranteeUserItem: React.FC<IGranteeUserItemProps> = (props) => {
    const { grantee, mode, onDelete } = props;
    const intl = useIntl();

    const granteeLabel = useMemo(() => {
        const userName = getGranteeLabel(grantee, intl);
        return grantee.isCurrentUser
            ? intl.formatMessage({ id: "shareDialog.share.grantee.item.you" }, { userName })
            : userName;
    }, [grantee, intl]);

    const onClick = useCallback(() => {
        onDelete(grantee);
    }, [grantee, onDelete]);

    const itemClassName = cx("gd-share-dialog-grantee-item", getGranteeItemTestId(grantee));

    return (
        <div className={itemClassName}>
            {grantee.isOwner ? (
                <GranteeOwnerRemoveIcon />
            ) : (
                <GranteeRemoveIcon mode={mode} onClick={onClick} />
            )}
            <div className="gd-grantee-content">
                <div className="gd-grantee-content-label">{granteeLabel}</div>
                <div className="gd-grantee-content-label gd-grantee-content-email">{grantee.email}</div>
            </div>
            <GranteeUserIcon />
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
                {numOfUsers && (
                    <div className="gd-grantee-count-button">
                        <Button
                            className="gd-button-link-dimmed gd-button gd-grantee-content-user-count s-grantee-content-user-count"
                            value={numOfUsers}
                        />
                    </div>
                )}
            </div>
            <GranteeGroupIcon />
        </div>
    );
};

/**
 * @internal
 */
export const GranteeItemComponent: React.FC<IGranteeItemProps> = (props) => {
    const { grantee, mode, onDelete } = props;

    if (grantee.type === "user") {
        return <GranteeUserItem grantee={grantee} mode={mode} onDelete={onDelete} />;
    } else {
        return <GranteeGroupItem grantee={grantee} mode={mode} onDelete={onDelete} />;
    }
};
