// (C) 2022 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";

interface IDashboardInsightSubmenuHeaderProps {
    title: string;
    onHeaderClick: () => void;
}

export const DashboardInsightSubmenuHeader: React.FC<IDashboardInsightSubmenuHeaderProps> = ({
    title,
    onHeaderClick,
}) => {
    return (
        <Typography
            tagName="h3"
            className="configuration-panel-header-title clickable"
            onClick={onHeaderClick}
        >
            <i className="gd-icon-navigateleft" />
            {title}
        </Typography>
    );
};
