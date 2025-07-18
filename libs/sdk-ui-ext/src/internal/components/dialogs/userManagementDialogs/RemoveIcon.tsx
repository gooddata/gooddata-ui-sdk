// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";

const alignPoints = [{ align: "cr cl" }];

interface IRemoveIconProps {
    tooltipMessage: string;
    onClick: () => void;
    isDisabled?: boolean;
}

export function RemoveIcon({ tooltipMessage, onClick, isDisabled = false }: IRemoveIconProps) {
    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} className="gd-grantee-item-delete">
            <span
                className={cx(
                    "gd-grantee-item-icon gd-grantee-icon-trash gd-grantee-item-icon-right s-user-management-delete",
                    { "is-disabled": isDisabled },
                )}
                onClick={isDisabled ? undefined : onClick}
                aria-label="Delete"
            />
            <Bubble className="bubble-primary" alignPoints={alignPoints}>
                {tooltipMessage}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
