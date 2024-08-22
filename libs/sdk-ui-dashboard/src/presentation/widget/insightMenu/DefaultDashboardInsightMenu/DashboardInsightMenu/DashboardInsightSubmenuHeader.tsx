// (C) 2022-2024 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

interface IDashboardInsightSubmenuHeaderProps {
    title: string;
    onHeaderClick?: () => void;
}

export const DashboardInsightSubmenuHeader: React.FC<IDashboardInsightSubmenuHeaderProps> = ({
    title,
    onHeaderClick,
}) => {
    return (
        <Typography
            tagName="h3"
            className={cx("configuration-panel-header-title", { clickable: onHeaderClick })}
            onClick={onHeaderClick}
        >
            {onHeaderClick ? <i className="gd-icon-navigateleft" /> : null}
            {title}
        </Typography>
    );
};
