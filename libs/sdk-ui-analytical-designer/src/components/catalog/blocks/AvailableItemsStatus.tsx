// (C) 2019-2026 GoodData Corporation

import { type CSSProperties, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import { CatalogUiActions } from "../../../sagas/catalog/catalog_ui_actions.js";
import { enableUnavailableItemsVisibility as enableUnavailableItemsVisibilitySelector } from "../../../selectors/feature_flag_selector.js";
import {
    isLoadingAvailability,
    isLoadingGroups as isLoadingGroupsSelector,
    isLoadingItems as isLoadingItemsSelector,
    showUnavailableItems as showUnavailableItemsSelector,
} from "../../../store/catalog/catalog_selector.js";
import { type AppDispatch } from "../../../store/types.js";

import { UnavailableItems } from "./UnavailableItems.js";
import { UpdateInProgress } from "./UpdateInProgress.js";

export interface IAvailableItemsStatusProps {
    hiddenItemsCount: number;
}

const loadedIndicatorsStyle: CSSProperties = {
    width: 1,
    height: 1,
    opacity: 0.01,
    backgroundColor: "white",
};

export function AvailableItemsStatusPure({ hiddenItemsCount }: IAvailableItemsStatusProps) {
    const isUpdateInProgress = useSelector(isLoadingAvailability);
    const isLoadingGroups = useSelector(isLoadingGroupsSelector);
    const isLoadingItems = useSelector(isLoadingItemsSelector);
    const showUnavailableItems = useSelector(showUnavailableItemsSelector);
    const enableUnavailableItemsVisibility = useSelector(enableUnavailableItemsVisibilitySelector);

    const dispatch = useDispatch<AppDispatch>();

    const toggleUnavailableItemsVisibility = useCallback(
        (visible: boolean) => {
            dispatch(CatalogUiActions.toggleUnavailableItemsVisibility(visible));
        },
        [dispatch],
    );

    if (isUpdateInProgress) {
        return <UpdateInProgress />;
    }

    return (
        <>
            {/* if no loading is happening, show empty "visible" div with a dedicated selector, this is to maintain compatibility with e2e tests... */}
            {!isLoadingGroups && !isLoadingItems && (
                <div className="s-catalogue-loaded" style={loadedIndicatorsStyle} />
            )}
            {hiddenItemsCount !== 0 && (
                <UnavailableItems
                    hiddenItemsCount={hiddenItemsCount}
                    showUnavailableItems={showUnavailableItems}
                    toggleUnavailableItemsVisibility={toggleUnavailableItemsVisibility}
                    enableUnavailableItemsVisibility={enableUnavailableItemsVisibility}
                />
            )}
        </>
    );
}
