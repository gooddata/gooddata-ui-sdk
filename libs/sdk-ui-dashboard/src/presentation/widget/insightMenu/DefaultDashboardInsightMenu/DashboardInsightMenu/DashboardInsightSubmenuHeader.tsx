// (C) 2022-2025 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

interface IDashboardInsightSubmenuHeaderProps {
    title: string;
    onHeaderClick?: () => void;
    backLabel?: string;
}

export const DashboardInsightSubmenuHeader: React.FC<IDashboardInsightSubmenuHeaderProps> = ({
    title,
    onHeaderClick,
    backLabel,
}) => {
    const headerClassNames = cx("configuration-panel-header-title", {
        clickable: !!onHeaderClick,
    });
    return onHeaderClick ? (
        <>
            <button
                className="configuration-panel-header-back-button "
                onClick={onHeaderClick}
                aria-label={backLabel}
            >
                <i className="gd-icon-navigateleft" role="img" aria-hidden="true" />
            </button>
            <Typography tagName="h3" className={headerClassNames} onClick={onHeaderClick}>
                {title}
            </Typography>
        </>
    ) : (
        <Typography tagName="h3" className={headerClassNames}>
            {title}
        </Typography>
    );
};
