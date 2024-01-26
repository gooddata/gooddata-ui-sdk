// (C) 2024 GoodData Corporation

import React from "react";
import { Typography, Button } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

export interface IPopupHeaderProps {
    title: string;
    onGoBack?: () => void;
    onClose: () => void;
}

export const PopupHeader: React.FC<IPopupHeaderProps> = ({ title, onGoBack, onClose }) => {
    const headerClassNames = cx("configuration-panel-header-title", {
        clickable: !!onGoBack,
    });
    return (
        <div className="configuration-panel-header">
            <Typography tagName="h3" className={headerClassNames} onClick={onGoBack ? onGoBack : undefined}>
                {onGoBack ? <i className="gd-icon-navigateleft" /> : null}
                {title}
            </Typography>
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                onClick={onClose}
            />
        </div>
    );
};
