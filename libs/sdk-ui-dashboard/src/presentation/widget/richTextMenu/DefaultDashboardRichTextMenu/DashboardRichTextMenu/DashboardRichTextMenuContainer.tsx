// (C) 2021-2025 GoodData Corporation
import { CSSProperties, ReactNode } from "react";
import { IRichTextWidget } from "@gooddata/sdk-model";
import { Button, ItemsWrapper } from "@gooddata/sdk-ui-kit";

import { DashboardRichTextMenuTitle } from "../../DashboardRichTextMenuTitle.js";
import { RenderMode } from "../../../../../types.js";

interface IDashboardRichTextMenuContainerProps {
    children: ReactNode;
    widget: IRichTextWidget;
    onClose: () => void;
    renderMode: RenderMode;
}

const itemsWrapperStyle: CSSProperties = { width: "100%" };

export function DashboardRichTextMenuContainer({
    children,
    widget,
    onClose,
    renderMode,
}: IDashboardRichTextMenuContainerProps) {
    return (
        <div className="insight-configuration">
            <div className="insight-configuration-panel-header">
                <DashboardRichTextMenuTitle widget={widget} renderMode={renderMode} />
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                    onClick={onClose}
                    dataId="s-configuration-panel-header-close-button"
                    dataTestId="s-configuration-panel-header-close-button"
                />
            </div>
            <ItemsWrapper
                smallItemsSpacing
                style={itemsWrapperStyle}
                className="gd-rich-text-insight-configuration-menu-item"
            >
                {children}
            </ItemsWrapper>
        </div>
    );
}
