// (C) 2020-2026 GoodData Corporation

import classNames from "classnames";
import { useIntl } from "react-intl";

import { RefreshIcon } from "./RefreshIcon.js";

export interface IRefreshButtonOwnProps {
    onClick: () => void;
    isVisible: boolean;
}

export function RefreshButton({ onClick, isVisible }: IRefreshButtonOwnProps) {
    const intl = useIntl();

    return (
        <div className="adi-catalog-info-panel-wrapper">
            <div
                className={classNames(
                    "adi-catalog-info-panel adi-catalog-refresh-button s-catalog-refresh-button",
                    {
                        "is-visible": isVisible,
                    },
                )}
                onClick={onClick}
            >
                <div className="adi-catalog-info-panel-inner">
                    <RefreshIcon />
                    <span className="gd-button-link adi-catalog-info-panel-text adi-catalog-refresh-link">
                        {intl.formatMessage({
                            id: "catalog.refresh",
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}
