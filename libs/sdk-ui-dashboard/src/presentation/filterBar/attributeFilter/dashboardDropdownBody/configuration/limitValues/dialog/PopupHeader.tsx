// (C) 2024-2025 GoodData Corporation

import React from "react";

import cx from "classnames";

import { Button, Typography } from "@gooddata/sdk-ui-kit";

export interface IPopupHeaderProps {
    title: string;
    onGoBack?: () => void;
    onClose: () => void;
}

export function PopupHeader({ title, onGoBack, onClose }: IPopupHeaderProps) {
    const headerClassNames = cx("configuration-panel-header-title", {
        clickable: !!onGoBack,
    });
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className={headerClassNames} onClick={onGoBack || undefined}>
                {onGoBack ? <i className="gd-icon-navigateleft" /> : null}
                {title}
            </Typography>
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                onClick={onClose}
                // TODO INE remove dataId once selectors in KD are rewritten to use dataTestId
                dataId="s-configuration-panel-header-close-button"
                dataTestId="s-configuration-panel-header-close-button"
            />
        </div>
    );
}
