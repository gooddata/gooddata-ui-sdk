// (C) 2022-2026 GoodData Corporation

import { type CustomCreatePanelItemComponent } from "../componentDefinition/types.js";

import { type DraggableItem, type IWrapCreatePanelItemWithDragComponent } from "./types.js";

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
export function DraggableCreatePanelItem(props: IDraggableCreatePanelItemProps) {
    const { Component, disabled } = props;
    const WrapCreatePanelItemWithDragComponent = props.WrapCreatePanelItemWithDragComponent!;

    return (
        <WrapCreatePanelItemWithDragComponent {...props}>
            <Component disabled={disabled} />
        </WrapCreatePanelItemWithDragComponent>
    );
}
