// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { redo, undo } from "../../actions/time_travel_actions.js";
import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerUndoRedoProps,
} from "../../embedding/editorHeaderSlotTypes.js";
import {
    isRedoDisabled as isRedoDisabledSelector,
    isUndoDisabled as isUndoDisabledSelector,
} from "../../selectors/editor_header_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

import { useGuardedCallback } from "./editorHeaderContext.js";

const BUBBLE_ALIGN_POINTS = [{ align: "bc tc", offset: { x: 0, y: 12 } }];

const canUndo = (state: IAppState) => !isUndoDisabledSelector(state);
const canRedo = (state: IAppState) => !isRedoDisabledSelector(state);
const runUndo = (dispatch: AppDispatch) => dispatch(undo());
const runRedo = (dispatch: AppDispatch) => dispatch(redo());

export function useUndoRedoProps(
    context: IAnalyticalDesignerHeaderContext,
): IAnalyticalDesignerUndoRedoProps {
    const isUndoDisabled = useSelector(isUndoDisabledSelector);
    const isRedoDisabled = useSelector(isRedoDisabledSelector);
    const onUndo = useGuardedCallback(canUndo, runUndo);
    const onRedo = useGuardedCallback(canRedo, runRedo);

    return useMemo(
        () => ({ ...context, isUndoDisabled, isRedoDisabled, onUndo, onRedo }),
        [context, isUndoDisabled, isRedoDisabled, onUndo, onRedo],
    );
}

interface IHistoryButtonProps {
    className: string;
    label: string;
    isDisabled: boolean;
    onClick: () => void;
}

function HistoryButton({ className, label, isDisabled, onClick }: IHistoryButtonProps) {
    return (
        <span>
            <BubbleHoverTrigger>
                <Button
                    className={`gd-button-secondary gd-button-icon-only ${className}`}
                    value=""
                    disabled={isDisabled}
                    onClick={onClick}
                    accessibilityConfig={{ ariaLabel: label }}
                />
                <Bubble className="bubble-primary" alignPoints={BUBBLE_ALIGN_POINTS}>
                    {label}
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
}

/**
 * Default of the UndoRedo slot: both buttons in one group, with their own tooltips and accessible names.
 */
export function DefaultUndoRedo({
    isUndoDisabled,
    isRedoDisabled,
    onUndo,
    onRedo,
}: IAnalyticalDesignerUndoRedoProps) {
    const intl = useIntl();

    return (
        <div className="gd-button-group editor-header-item">
            <HistoryButton
                className="gd-icon-undo undo s-undo"
                label={intl.formatMessage({ id: "undo" })}
                isDisabled={isUndoDisabled}
                onClick={onUndo}
            />
            <HistoryButton
                className="gd-icon-redo redo s-redo"
                label={intl.formatMessage({ id: "redo" })}
                isDisabled={isRedoDisabled}
                onClick={onRedo}
            />
        </div>
    );
}
