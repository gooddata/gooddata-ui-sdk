// (C) 2007-2026 GoodData Corporation

import { type Ref, useState } from "react";

import { useDrag } from "@evil-internetmann/react-dnd";
import classNames from "classnames";
import { type Action, type Dispatch } from "redux";

import { CATALOG } from "../../../constants/bucket.js";
import { CATALOG_LIST_ITEM } from "../../../constants/drag_item_types.js";
import {
    endDragCatalogItem,
    startDragCatalogItem,
} from "../../../sagas/drag_and_drop/drag_and_drop_actions.js";
import { type IDraggableCatalogListItem } from "../../../typings/drag_and_drop.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";

import { CatalogItem } from "./CatalogItem.js";

interface IDragSourceProps {
    isDragging?: boolean;
}

interface IDraggableCatalogListItemDispatchProps {
    dispatch: Dispatch;
}

interface IDraggableCatalogListItemOwnProps {
    className?: string;
    onDragEnd?: () => void;
    item: ICatalogEntry;
}

type DraggableCatalogListItemProps = IDraggableCatalogListItemOwnProps &
    IDraggableCatalogListItemDispatchProps &
    IDragSourceProps;

export function DraggableCatalogListItem(props: DraggableCatalogListItemProps) {
    const { dispatch, item, className = "", onDragEnd = () => {} } = props;
    const [hover, setHover] = useState<boolean>(false);

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: CATALOG_LIST_ITEM,
            item: () => {
                function renderDraggedItemElement() {
                    return (
                        <CatalogItem
                            {...props}
                            bubbleHelp={false}
                            className="adi-dragged-item"
                            style={catalogItemStyle}
                        />
                    );
                }
                dispatch<Action>(startDragCatalogItem(item));
                return {
                    type: CATALOG_LIST_ITEM,
                    item,
                    from: CATALOG,
                    dragged: item?.type,
                    index: null,
                    renderDraggedItemElement,
                } as IDraggableCatalogListItem;
            },
            end: () => {
                dispatch<Action>(endDragCatalogItem());
                onDragEnd();
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [dispatch, item, onDragEnd],
    );

    const classes = classNames(className, {
        "adi-catalog-item-hover": hover && !isDragging,
    });

    return (
        <div
            ref={dragRef as unknown as Ref<HTMLDivElement>}
            className="adi-catalog-item-wrapper s-adi-catalog-item-wrapper"
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            <CatalogItem {...props} className={classes} isDragging={isDragging} />
        </div>
    );
}

const catalogItemStyle = { margin: "0 15px 0 16px" };
