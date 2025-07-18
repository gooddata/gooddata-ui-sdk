// (C) 2022-2025 GoodData Corporation
import { CustomCreatePanelItemComponent } from "../componentDefinition/index.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "./types.js";

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
