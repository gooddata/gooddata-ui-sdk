// (C) 2021-2025 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { IAddUserOrGroupButton } from "./types.js";
import { ADD_GRANTEE_ID } from "./utils.js";
import { UiTooltip } from "../../../@ui/UiTooltip/UiTooltip.js";
import { useIdPrefixed } from "../../../utils/useId.js";

/**
 * @internal
 */
export const AddUserOrGroupButton: React.FC<IAddUserOrGroupButton> = (props) => {
    const { isDisabled, onClick } = props;

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
        (e: React.MouseEvent) => {
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
};
