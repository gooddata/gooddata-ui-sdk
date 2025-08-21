// (C) 2021-2025 GoodData Corporation
import React from "react";

import { IRichTextWidget } from "@gooddata/sdk-model";
import { Button, ItemsWrapper } from "@gooddata/sdk-ui-kit";

import { RenderMode } from "../../../../../types.js";
import { DashboardRichTextMenuTitle } from "../../DashboardRichTextMenuTitle.js";

interface IDashboardRichTextMenuContainerProps {
    children: React.ReactNode;
    widget: IRichTextWidget;
    onClose: () => void;
    renderMode: RenderMode;
}

const itemsWrapperStyle: React.CSSProperties = { width: "100%" };

export function DashboardRichTextMenuContainer(props: IDashboardRichTextMenuContainerProps) {
    return (
        <div className="insight-configuration">
            <div className="insight-configuration-panel-header">
                <DashboardRichTextMenuTitle widget={props.widget} renderMode={props.renderMode} />
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                    onClick={props.onClose}
                    dataId="s-configuration-panel-header-close-button"
                    dataTestId="s-configuration-panel-header-close-button"
                />
            </div>
            <ItemsWrapper
                smallItemsSpacing
                style={itemsWrapperStyle}
                className="gd-rich-text-insight-configuration-menu-item"
            >
                {props.children}
            </ItemsWrapper>
        </div>
    );
}
