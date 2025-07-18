// (C) 2022-2025 GoodData Corporation
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

interface IDefaultSubmenuHeaderProps {
    title: string;
    backLabel?: string;
    closeLabel?: string;
    onGoBack?: () => void;
    onClose: () => void;
}

export function DefaultSubmenuHeader({
    title,
    backLabel,
    closeLabel,
    onGoBack,
    onClose,
}: IDefaultSubmenuHeaderProps) {
    const headerClassNames = cx("configuration-panel-header-title", {
        clickable: !!onGoBack,
    });
    return (
        <div className="configuration-panel-header">
            {onGoBack ? (
                <>
                    <button
                        className="configuration-panel-header-back-button"
                        onClick={onGoBack}
                        aria-label={backLabel}
                    >
                        <i className="gd-icon-navigateleft" role="img" aria-hidden="true" />
                    </button>
                    <Typography tagName="h3" className={headerClassNames} onClick={onGoBack}>
                        {title}
                    </Typography>
                </>
            ) : (
                <Typography tagName="h3" className={headerClassNames}>
                    {title}
                </Typography>
            )}
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                onClick={onClose}
                accessibilityConfig={{
                    ariaLabel: closeLabel,
                }}
                dataId="s-configuration-panel-header-close-button"
                dataTestId="s-configuration-panel-header-close-button"
            />
        </div>
    );
}
