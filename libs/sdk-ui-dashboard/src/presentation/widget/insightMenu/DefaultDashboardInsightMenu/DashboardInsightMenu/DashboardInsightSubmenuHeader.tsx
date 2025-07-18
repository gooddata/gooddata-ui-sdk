// (C) 2022-2025 GoodData Corporation
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

interface IDashboardInsightSubmenuHeaderProps {
    title: string;
    onHeaderClick?: () => void;
    backLabel?: string;
}

export function DashboardInsightSubmenuHeader({
    title,
    onHeaderClick,
    backLabel,
}: IDashboardInsightSubmenuHeaderProps) {
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
}
