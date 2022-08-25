// (C) 2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { IHeaderInviteProps } from "./typings";

export const HeaderInvite: React.FC<IHeaderInviteProps> = ({ onInviteItemClick }) => {
    const intl = useIntl();
    return (
        <div className="gd-header-invite" onClick={onInviteItemClick}>
            <i className="gd-header-invite-icon" />
            <span className="gd-header-invite-text">{intl.formatMessage({ id: "gs.header.invite" })}</span>
        </div>
    );
};
