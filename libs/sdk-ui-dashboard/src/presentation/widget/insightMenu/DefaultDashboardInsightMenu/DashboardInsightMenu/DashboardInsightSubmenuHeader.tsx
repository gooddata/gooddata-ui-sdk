// (C) 2022-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { Button, Typography } from "@gooddata/sdk-ui-kit";

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
            <Button
                className="configuration-panel-header-back-button gd-icon-navigateleft"
                onClick={onHeaderClick}
                accessibilityConfig={{
                    ariaLabel: backLabel,
                }}
            />
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
