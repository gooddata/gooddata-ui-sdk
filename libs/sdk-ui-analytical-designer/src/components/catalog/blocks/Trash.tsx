// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";

import {
    highlightItemsToBeRemovedByTrash,
    resetHighlightedItemsToBeRemoved,
} from "../../../sagas/highlighting/highlighting_ui_actions.js";
import { type AppDispatch } from "../../../store/types.js";
import { useDidComponentMount } from "../../shared/hooks/generic_hooks.js";

export interface ITrashProps {
    isOver: boolean;
}

export function Trash({ isOver }: ITrashProps) {
    const dispatch = useDispatch<AppDispatch>();
    const didComponentMount = useDidComponentMount();

    const onDndItemEnteredDropZone = useCallback(() => {
        dispatch(highlightItemsToBeRemovedByTrash());
    }, [dispatch]);

    const onDndItemLeftDropZone = useCallback(() => {
        dispatch(resetHighlightedItemsToBeRemoved());
    }, [dispatch]);

    const classes = classNames("adi-trash", "s-trash", "adi-shortcut", {
        "adi-droppable-hover": isOver,
        "s-adi-droppable-hover": isOver,
    });

    useEffect(() => {
        if (didComponentMount) {
            if (isOver) {
                onDndItemEnteredDropZone();
            } else {
                onDndItemLeftDropZone();
            }
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [isOver]);

    return (
        <div className={classes}>
            <div className="adi-shortcut-inner">
                <div className="adi-trash-inner">
                    <p>
                        <FormattedMessage id="dashboard.trash.hint" />
                    </p>
                </div>
            </div>
        </div>
    );
}
