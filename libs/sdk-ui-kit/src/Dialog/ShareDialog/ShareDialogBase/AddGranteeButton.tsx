// (C) 2021-2025 GoodData Corporation

import { type MouseEvent, useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { type IAddUserOrGroupButton } from "./types.js";
import { ADD_GRANTEE_ID } from "./utils.js";
import { UiTooltip } from "../../../@ui/UiTooltip/UiTooltip.js";
import { useIdPrefixed } from "../../../utils/useId.js";

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

    const addGranteeTooltipId = useIdPrefixed("add-grantee-tooltip");

    return (
        <div>
            <UiTooltip
                id={addGranteeTooltipId}
                arrowPlacement="left"
                triggerBy={["hover", "focus"]}
                content={<FormattedMessage id={"shareDialog.share.grantee.add.info"} />}
                anchor={
                    <button
                        id={ADD_GRANTEE_ID}
                        className={buttonClassNames}
                        onClick={handleClick}
                        aria-label={intl.formatMessage({ id: "shareDialog.share.grantee.addLabel" })}
                        aria-describedby={addGranteeTooltipId}
                    >
                        <FormattedMessage id="shareDialog.share.grantee.add" />
                    </button>
                }
            />
        </div>
    );
}
