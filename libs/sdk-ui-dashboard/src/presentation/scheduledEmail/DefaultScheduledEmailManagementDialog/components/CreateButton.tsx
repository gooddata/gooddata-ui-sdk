// (C) 2024 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

interface ICreateButtonProps {
    isDisabled: boolean;
    titleId: string;
    tooltipId?: string;
    onClick?: () => void;
}

// TODO: this can be fully moved to sdk-ui-kit (inspired by add grantee button and generalized a bit)
export const CreateButton: React.FC<ICreateButtonProps> = (props) => {
    const { isDisabled, onClick, titleId, tooltipId } = props;

    const buttonClassNames = cx(
        {
            disabled: isDisabled,
        },
        "gd-button-link",
        "gd-icon-plus",
        "s-create-item",
    );

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (isDisabled) {
                return;
            }
            onClick?.();
        },
        [isDisabled, onClick],
    );

    if (!tooltipId) {
        return (
            <Button className={buttonClassNames} onClick={handleClick}>
                <FormattedMessage id={titleId} />
            </Button>
        );
    }

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
            <Button className={buttonClassNames} onClick={handleClick}>
                <FormattedMessage id={titleId} />
            </Button>
            <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                <FormattedMessage id={tooltipId} />
            </Bubble>
        </BubbleHoverTrigger>
    );
};
