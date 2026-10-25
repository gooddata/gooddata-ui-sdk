// (C) 2020-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAppState } from "../types.js";

import { type IDragAndDropState } from "./dnd_types.js";

const getDndState = (state: IAppState): IDragAndDropState => state.data.dragAndDrop;

export const getDraggedCatalogItem = createSelector(getDndState, (dndState) => dndState.draggedCatalogItem);

export const getDraggedBucketItem = createSelector(getDndState, (dndState) => dndState.draggedBucketItem);

export const getDraggedFilterItem = createSelector(getDndState, (dndState) => dndState.draggedFilterItem);
