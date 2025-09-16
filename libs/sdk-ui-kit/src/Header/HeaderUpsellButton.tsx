// (C) 2021-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { IHeaderUpsellButtonProps } from "./typings.js";

export function HeaderUpsellButton({ onUpsellButtonClick }: IHeaderUpsellButtonProps) {
    const intl = useIntl();
    return (
        <button className="gd-button-small gd-button-primary gd-upsell-button" onClick={onUpsellButtonClick}>
            <i className="gd-icon-star" />
            <span className="gd-upgrade-button-text">
                {intl.formatMessage({ id: "gs.header.upsellButtonText" })}
            </span>
        </button>
    );
}
