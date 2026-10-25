// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    applyAttributeShortcut,
    applyMetricShortcut,
    dropCatalogItem,
    loadShortcutDateDatasets,
} from "../actions/shortcuts_actions.js";
import { FACT, METRIC } from "../constants/bucket.js";
import { shortcutsSelector } from "../selectors/shortcuts_selector.js";
import { type AppDispatch } from "../store/types.js";
import { type ICatalogEntry } from "../typings/state_objects.js";

import { ShortcutDropTarget } from "./shortcuts/ShortcutDropTarget.js";
import { ShortcutMetricOverTime } from "./shortcuts/ShortcutMetricOverTime.js";
import { ShortcutPanel } from "./shortcuts/ShortcutPanel.js";
import { ShortcutSingleAttribute } from "./shortcuts/ShortcutSingleAttribute.js";
import { ShortcutSingleMetric } from "./shortcuts/ShortcutSingleMetric.js";

export function Shortcuts() {
    const {
        activeDragItem,
        displayBlock,
        displayAttribute,
        displayMetric,
        displayMetricOverTime,
        isMetricOverTimeDisabled,
    } = useSelector(shortcutsSelector);

    const dispatch = useDispatch<AppDispatch>();

    const onApplyAttributeShortcut = useCallback(
        (item: ICatalogEntry) => {
            dispatch(applyAttributeShortcut(item));
        },
        [dispatch],
    );

    const onApplyMetricShortcut = useCallback(
        (item: ICatalogEntry) => {
            dispatch(applyMetricShortcut(item));
        },
        [dispatch],
    );

    const onDropCatalogItem = useCallback(
        (catalogItem: ICatalogEntry) => {
            dispatch(dropCatalogItem(catalogItem));
        },
        [dispatch],
    );

    const onLoadShortcutDateDatasets = useCallback(() => {
        dispatch(loadShortcutDateDatasets());
    }, [dispatch]);

    const isDraggedMeasure = (dragItem: ICatalogEntry) => {
        if (!dragItem) {
            return false;
        }

        const type = dragItem.type;

        return type === METRIC || type === FACT;
    };

    useEffect(() => {
        if (isDraggedMeasure(activeDragItem)) {
            onLoadShortcutDateDatasets();
        }
    }, [activeDragItem, onLoadShortcutDateDatasets]);

    const getAttributeShortcut = (displayAttribute: boolean, activeDragItem: ICatalogEntry) => {
        const title = activeDragItem?.title;

        return (
            displayAttribute && (
                <ShortcutPanel>
                    <ShortcutDropTarget onDrop={onApplyAttributeShortcut}>
                        <ShortcutSingleAttribute title={title} />
                    </ShortcutDropTarget>
                </ShortcutPanel>
            )
        );
    };

    const getSingleMetricShortcut = (displayMetric: boolean, title: string, itemType: string) => {
        return (
            displayMetric && (
                <ShortcutDropTarget onDrop={onApplyMetricShortcut}>
                    <ShortcutSingleMetric title={title} itemType={itemType} />
                </ShortcutDropTarget>
            )
        );
    };

    const getMetricOverTimeShortcut = (displayMetricOverTime: boolean, title: string, itemType: string) => {
        return (
            displayMetricOverTime && (
                <ShortcutDropTarget isDisabled={isMetricOverTimeDisabled} onDrop={onDropCatalogItem}>
                    <ShortcutMetricOverTime title={title} itemType={itemType} />
                </ShortcutDropTarget>
            )
        );
    };

    const getMetricShortcuts = (
        displayMetric: boolean,
        displayMetricOverTime: boolean,
        activeDragItem: ICatalogEntry,
    ) => {
        const title = activeDragItem?.title;
        const itemType = activeDragItem?.type;

        const shouldDisplay = displayMetric || displayMetricOverTime;

        return (
            shouldDisplay && (
                <ShortcutPanel>
                    {getSingleMetricShortcut(displayMetric, title, itemType)}
                    {getMetricOverTimeShortcut(displayMetricOverTime, title, itemType)}
                </ShortcutPanel>
            )
        );
    };

    return (
        displayBlock && (
            <div className="adi-shortcuts-area">
                {getAttributeShortcut(displayAttribute, activeDragItem)}
                {getMetricShortcuts(displayMetric, displayMetricOverTime, activeDragItem)}
            </div>
        )
    );
}
