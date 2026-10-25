// (C) 2007-2026 GoodData Corporation

import { useDispatch } from "react-redux";

import { type AppDispatch } from "../../../store/types.js";
import { type ICatalogEntry } from "../../../typings/state_objects.js";

import { DraggableCatalogListItem } from "./DraggableCatalogListItem.js";

export interface ICatalogListItemContainerProps {
    item: ICatalogEntry;
    className?: string;
    onDragEnd?: () => void;
}

export function CatalogListItemContainer(props: ICatalogListItemContainerProps) {
    const dispatch = useDispatch<AppDispatch>();

    return <DraggableCatalogListItem {...props} dispatch={dispatch} />;
}
