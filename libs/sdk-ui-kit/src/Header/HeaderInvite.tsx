// (C) 2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { Icon } from "../Icon/index.js";

import { IHeaderInviteProps } from "./typings.js";

// do not use empty string returned when white-labeling is not enabled, otherwise default color is not applied
const sanitizeColor = (color: string) => (color === "" ? undefined : color);

export const HeaderInvite: React.FC<IHeaderInviteProps> = ({ onInviteItemClick, textColor }) => {
    const intl = useIntl();
    return (
        <div className="gd-header-invite" onClick={onInviteItemClick}>
            <Icon.Invite color={sanitizeColor(textColor)} className="gd-header-invite-icon" />
            <span className="gd-header-invite-text">{intl.formatMessage({ id: "gs.header.invite" })}</span>
        </div>
    );
};
