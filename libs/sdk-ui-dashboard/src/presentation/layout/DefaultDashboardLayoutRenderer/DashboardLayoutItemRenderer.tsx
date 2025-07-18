// (C) 2007-2025 GoodData Corporation
import cx from "classnames";
import { ILayoutCoordinates } from "../../../types.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/legacyFluidLayout/facade/interfaces.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { IDashboardLayoutItemRenderer, IDashboardLayoutItemRenderProps } from "./interfaces.js";
import { renderModeAware } from "../../componentDefinition/index.js";
import { isCustomWidgetBase } from "../../../model/index.js";
import { WidgetDropZoneColumn } from "../dragAndDrop/draggableWidget/WidgetDropZoneColumn.js";
import { RowEndHotspot } from "../dragAndDrop/draggableWidget/RowEndHotspot.js";
import { useIsDraggingCurrentItem } from "../dragAndDrop/draggableWidget/useIsDraggingCurrentItem.js";

function getLayoutCoordinates(item: IDashboardLayoutItemFacade<unknown>): ILayoutCoordinates {
    return {
        sectionIndex: item.section()?.index(),
        itemIndex: item.index(),
    };
}

function DashboardLayoutItemEditRenderer(props: IDashboardLayoutItemRenderProps<unknown>) {
    const { item, screen, children } = props;

    const { sectionIndex, itemIndex } = getLayoutCoordinates(item);

    const isDraggingCurrentItem = useIsDraggingCurrentItem(sectionIndex, itemIndex);

    const isCustomWidget = isCustomWidgetBase(item.widget());

    return (
        <>
            {isCustomWidget ? null : (
                <WidgetDropZoneColumn screen={screen} sectionIndex={sectionIndex} itemIndex={itemIndex} />
            )}
            <DashboardLayoutItemViewRenderer
                {...props}
                className={cx({
                    "current-dragging-item": isDraggingCurrentItem,
                })}
            >
                {children}
            </DashboardLayoutItemViewRenderer>
            {isCustomWidget ? null : <RowEndHotspot item={item} screen={screen} />}
        </>
    );
}

/**
 * @internal
 */
export const DashboardLayoutItemRenderer = renderModeAware<IDashboardLayoutItemRenderer<unknown>>({
    view: DashboardLayoutItemViewRenderer,
    edit: DashboardLayoutItemEditRenderer,
}) as IDashboardLayoutItemRenderer<unknown>;
