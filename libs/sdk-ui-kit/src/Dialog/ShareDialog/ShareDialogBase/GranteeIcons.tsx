// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { BubbleHoverTrigger } from "../../../Bubble";
import { Bubble } from "../../../Bubble";
import { DialogModeType } from "./types";

const alignPoints = [{ align: "cr cl" }];

export interface IGranteeRemoveIconProps {
    mode: DialogModeType;
    onClick: () => void;
}

export const GranteeUserIcon: React.FC = () => {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-user gd-grantee-item-icon-left" />
        </div>
    );
};

export const GranteeUserInactiveIcon: React.FC = () => {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon-inactive gd-grantee-icon-user gd-grantee-item-icon-left" />
        </div>
    );
};

export const GranteeGroupIcon: React.FC = () => {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-group gd-grantee-item-icon-left" />
        </div>
    );
};

export const GranteeRemoveIcon: React.FC<IGranteeRemoveIconProps> = (props) => {
    const { onClick, mode } = props;

    return (
        <BubbleHoverTrigger
            showDelay={0}
            hideDelay={0}
            className="gd-grantee-item-delete s-gd-grantee-item-delete"
        >
            <span
                className="gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right"
                onClick={onClick}
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {mode === "ShareGrantee" ? (
                    <FormattedMessage id={"shareDialog.share.grantee.item.remove.access"} />
                ) : (
                    <FormattedMessage id={"shareDialog.share.grantee.item.remove.selection"} />
                )}
            </Bubble>
        </BubbleHoverTrigger>
    );
};

export const GranteeOwnerRemoveIcon: React.FC = () => {
    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete-owner">
            <span className="gd-grantee-item-icon gd-grantee-item-icon-owner gd-grantee-item-icon-right">
                <FormattedMessage id={"shareDialog.share.grantee.item.creator"} />
            </span>
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                <FormattedMessage id={"shareDialog.share.grantee.item.owner.remove.access"} />
            </Bubble>
        </BubbleHoverTrigger>
    );
};
