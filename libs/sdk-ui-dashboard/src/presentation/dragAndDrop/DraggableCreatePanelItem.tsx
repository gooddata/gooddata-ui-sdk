// (C) 2022-2025 GoodData Corporation
import React from "react";

import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "./types.js";
import { CustomCreatePanelItemComponent } from "../componentDefinition/index.js";

/**
 * @internal
 */
export type IDraggableCreatePanelItemProps = {
    Component: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
    dragItem: DraggableItem;
    hideDefaultPreview?: boolean;
    disabled?: boolean;
    onDragStart?: (item: DraggableItem) => void;
};

/**
 * @internal
 */
export const DraggableCreatePanelItem: React.FC<IDraggableCreatePanelItemProps> = (props) => {
    const { Component, disabled } = props;
    const WrapCreatePanelItemWithDragComponent = props.WrapCreatePanelItemWithDragComponent!;

    return (
        <WrapCreatePanelItemWithDragComponent {...props}>
            <Component disabled={disabled} />
        </WrapCreatePanelItemWithDragComponent>
    );
};
