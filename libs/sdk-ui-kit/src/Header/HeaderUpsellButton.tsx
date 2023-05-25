// (C) 2021 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { IHeaderUpsellButtonProps } from "./typings.js";

export const HeaderUpsellButton: React.FC<IHeaderUpsellButtonProps> = ({ onUpsellButtonClick }) => {
    const intl = useIntl();
    return (
        <button className="gd-button-small gd-button-primary gd-upsell-button" onClick={onUpsellButtonClick}>
            <i className="gd-icon-star" />
            <span className="gd-upgrade-button-text">
                {intl.formatMessage({ id: "gs.header.upsellButtonText" })}
            </span>
        </button>
    );
};
