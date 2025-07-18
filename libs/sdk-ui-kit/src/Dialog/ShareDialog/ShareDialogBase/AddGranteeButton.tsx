// (C) 2021-2025 GoodData Corporation
import { MouseEvent, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { BubbleHoverTrigger, Bubble } from "../../../Bubble/index.js";
import { IAddUserOrGroupButton } from "./types.js";
import { ADD_GRANTEE_ID } from "./utils.js";

/**
 * @internal
 */
export function AddUserOrGroupButton({ isDisabled, onClick }: IAddUserOrGroupButton) {
    const intl = useIntl();

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
        (e: MouseEvent) => {
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
                <button
                    id={ADD_GRANTEE_ID}
                    className={buttonClassNames}
                    onClick={handleClick}
                    aria-label={intl.formatMessage({ id: "shareDialog.share.grantee.addLabel" })}
                >
                    <FormattedMessage id="shareDialog.share.grantee.add" />
                </button>
                <Bubble className="bubble-primary" alignPoints={[{ align: "cr cl" }]}>
                    <FormattedMessage id={"shareDialog.share.grantee.add.info"} />
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
}
