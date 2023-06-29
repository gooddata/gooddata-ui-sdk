// (C) 2021 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { BubbleHoverTrigger, Bubble } from "../../../Bubble/index.js";
import { IAddUserOrGroupButton } from "./types.js";

/**
 * @internal
 */
export const AddUserOrGroupButton: React.FC<IAddUserOrGroupButton> = (props) => {
    const { isDisabled, onClick } = props;

    const buttonClassNames = cx(
        {
            disabled: isDisabled,
        },
        "gd-button",
        "gd-button-link",
        "gd-icon-plus",
        "s-add-users-or-groups",
    );

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            if (isDisabled) {
                return;
            }
            onClick();
        },
        [isDisabled, onClick],
    );

    return (
        <div>
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <a
                    className={buttonClassNames}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClick}
                >
                    <FormattedMessage id="shareDialog.share.grantee.add" />
                </a>
                <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                    <FormattedMessage id={"shareDialog.share.grantee.add.info"} />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
