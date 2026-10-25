// (C) 2007-2026 GoodData Corporation

import { type ReactNode, type Ref } from "react";

import { type DropTargetMonitor, useDrop } from "@evil-internetmann/react-dnd";
import classNames from "classnames";

import { CATALOG_LIST_ITEM } from "../../constants/drag_item_types.js";
import {
    type IDraggableCatalogListItem,
    type IInjectedDropTargetProps,
} from "../../typings/drag_and_drop.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";

interface IShortcutDropTargetOwnProps {
    isDisabled?: boolean;
    onDrop: (catalogItem: ICatalogEntry) => void;
    children?: ReactNode;
}

type IShortcutDropTargetProps = IShortcutDropTargetOwnProps & IInjectedDropTargetProps;

export function ShortcutDropTarget({
    isOver: isOverProp = false,
    isDisabled = false,
    onDrop,
    children,
}: IShortcutDropTargetProps) {
    const [{ isOver }, dropRef] = useDrop(
        () => ({
            accept: [CATALOG_LIST_ITEM],
            drop: (_item: unknown, monitor: DropTargetMonitor) => {
                const item = (monitor.getItem() as IDraggableCatalogListItem).item;
                if (monitor.getItemType() === CATALOG_LIST_ITEM && !isDisabled) {
                    onDrop(item);
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }),
        [isDisabled, onDrop],
    );

    const effectiveIsOver = isOverProp ?? isOver;
    const classes = classNames("adi-shortcut-drop-target", {
        "adi-droppable-hover": effectiveIsOver && !isDisabled,
        "adi-drop-disabled": isDisabled,
    });

    const shortcut = (
        <div className={classes} ref={isDisabled ? undefined : (dropRef as unknown as Ref<HTMLDivElement>)}>
            {children}
        </div>
    );

    if (isDisabled) {
        return shortcut;
    }

    return shortcut;
}
