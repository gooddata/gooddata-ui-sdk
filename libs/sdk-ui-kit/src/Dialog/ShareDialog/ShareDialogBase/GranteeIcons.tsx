// (C) 2021-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { useComponentLabelsContext } from "./ComponentLabelsContext.js";
import { type DialogModeType } from "./types.js";
import { Bubble, BubbleHoverTrigger } from "../../../Bubble/index.js";

const alignPoints = [{ align: "cr cl" }];

export interface IGranteeRemoveIconProps {
    mode: DialogModeType;
    onClick: () => void;
}

export function GranteeUserIcon() {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-user gd-grantee-item-icon-left" />
        </div>
    );
}

export function GranteeUserInactiveIcon() {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon-inactive gd-grantee-icon-user gd-grantee-item-icon-left" />
        </div>
    );
}

export function GranteeGroupIcon() {
    return (
        <div className="gd-grantee-item-icon-left-background">
            <span className="gd-grantee-item-icon gd-grantee-icon-group gd-grantee-item-icon-left" />
        </div>
    );
}

export function GranteeRemoveIcon({ onClick, mode }: IGranteeRemoveIconProps) {
    const labels = useComponentLabelsContext();
    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete">
            <span
                className="gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right s-gd-grantee-item-delete"
                onClick={onClick}
                aria-label="Share dialog grantee delete"
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {mode === "ShareGrantee" ? (
                    <> {labels.removeAccessGranteeTooltip} </>
                ) : (
                    <FormattedMessage id={"shareDialog.share.grantee.item.remove.selection"} />
                )}
            </Bubble>
        </BubbleHoverTrigger>
    );
}

export function GranteeOwnerRemoveIcon() {
    const labels = useComponentLabelsContext();

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete-owner">
            <span className="gd-grantee-item-icon gd-grantee-item-icon-owner gd-grantee-item-icon-right">
                <FormattedMessage id={"shareDialog.share.grantee.item.creator"} />
            </span>
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {labels.removeAccessCreatorTooltip}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
