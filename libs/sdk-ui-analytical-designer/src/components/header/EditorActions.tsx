// (C) 2026 GoodData Corporation

import { Fragment, type ReactElement } from "react";

import { useSelector } from "react-redux";

import {
    type IAnalyticalDesignerEditorAction,
    type IAnalyticalDesignerEditorActionsProps,
    type IAnalyticalDesignerHeaderContext,
} from "../../embedding/editorHeaderSlotTypes.js";
import { renderSlot, useAdSlots } from "../../embedding/slots.js";
import {
    AVAILABLE_HIDDEN_ACTIONS,
    hiddenActions as hiddenActionsSelector,
    isCancelVisible as isCancelVisibleSelector,
    isEmbedButtonVisible as isEmbedButtonVisibleSelector,
    isOpenVisible as isOpenVisibleSelector,
    isOptionsMenuEnabled as isOptionsMenuEnabledSelector,
    isSaveAsVisible as isSaveAsVisibleSelector,
    isSaveVisible as isSaveVisibleSelector,
} from "../../selectors/editor_header_selector.js";

import { DefaultCancel, useCancelProps } from "./CancelButton.js";
import { DefaultClear, useClearProps } from "./ClearButton.js";
import { DefaultEmbed, useEmbedProps } from "./Embed/EmbedButton.js";
import { DefaultOpen, useOpenProps } from "./OpenControl.js";
import { DefaultOptions } from "./OptionsMenu/OptionsButton.js";
import { useOptionsProps } from "./OptionsMenu/useOptionsProps.js";
import { DefaultSaveAs, useSaveAsProps } from "./SaveAsNewReportButton.js";
import { DefaultSave, useSaveProps } from "./SaveReportButton.js";
import { DefaultUndoRedo, useUndoRedoProps } from "./UndoRedoButtons.js";

/**
 * The EditorActions region with the slots of the controls AD shows resolved. A control AD does not show for its
 * permissions, configuration or mode is not in the items, so its slot does not render.
 *
 * @param onChangeTimezone - opens the time zone dialog owned by the header
 */
export function useEditorActions(
    context: IAnalyticalDesignerHeaderContext,
    onChangeTimezone: () => void,
): ReactElement {
    const slots = useAdSlots();

    const hiddenActions = useSelector(hiddenActionsSelector);
    const isOpenVisible = useSelector(isOpenVisibleSelector);
    const isCancelVisible = useSelector(isCancelVisibleSelector);
    const isSaveAsVisible = useSelector(isSaveAsVisibleSelector);
    const isSaveVisible = useSelector(isSaveVisibleSelector);
    const isEmbedVisible = useSelector(isEmbedButtonVisibleSelector);
    const isOptionsVisible = useSelector(isOptionsMenuEnabledSelector);

    const undoRedoProps = useUndoRedoProps(context);
    const clearProps = useClearProps(context);
    const openProps = useOpenProps(context);
    const cancelProps = useCancelProps(context);
    const saveAsProps = useSaveAsProps(context);
    const saveProps = useSaveProps(context);
    const embedProps = useEmbedProps(context);
    const optionsProps = useOptionsProps(context, onChangeTimezone);

    const items: IAnalyticalDesignerEditorAction[] = [];
    if (!hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.UNDO_REDO)) {
        items.push({ id: "undoRedo", content: renderSlot(slots.UndoRedo, DefaultUndoRedo, undoRedoProps) });
    }
    if (!hiddenActions.includes(AVAILABLE_HIDDEN_ACTIONS.CLEAR)) {
        items.push({ id: "clear", content: renderSlot(slots.Clear, DefaultClear, clearProps) });
    }
    if (isOpenVisible) {
        items.push({ id: "open", content: renderSlot(slots.Open, DefaultOpen, openProps) });
    }
    if (isCancelVisible) {
        items.push({ id: "cancel", content: renderSlot(slots.Cancel, DefaultCancel, cancelProps) });
    }
    if (isSaveAsVisible) {
        items.push({ id: "saveAs", content: renderSlot(slots.SaveAs, DefaultSaveAs, saveAsProps) });
    }
    if (isSaveVisible) {
        items.push({ id: "save", content: renderSlot(slots.Save, DefaultSave, saveProps) });
    }
    if (isEmbedVisible) {
        items.push({ id: "embed", content: renderSlot(slots.Embed, DefaultEmbed, embedProps) });
    }
    if (isOptionsVisible) {
        items.push({ id: "options", content: renderSlot(slots.Options, DefaultOptions, optionsProps) });
    }

    return renderSlot(slots.EditorActions, DefaultEditorActions, { ...context, items });
}

/**
 * Default of the EditorActions slot: the items in their order.
 */
export function DefaultEditorActions({ items }: IAnalyticalDesignerEditorActionsProps) {
    return (
        <>
            {items.map((item) => (
                <Fragment key={item.id}>{item.content}</Fragment>
            ))}
        </>
    );
}
