// (C) 2026 GoodData Corporation

import { type ReactNode, useLayoutEffect } from "react";

import { bem } from "../@utils/bem.js";

import { useUiDialogContext } from "./UiModalDialog.js";

const { b } = bem("gd-ui-kit-dialog-body");

/**
 * @internal
 */
export interface IUiDialogBodyProps {
    /** Description content — typically a sentence or two of body text. */
    children: ReactNode;
}

/**
 * Dialog description body — slot for cards whose meaning lives in a single
 * block of text (confirm dialogs). Carries the dialog's `descriptionId` so
 * the modal landmark's `aria-describedby` resolves to this element.
 *
 * @internal
 */
export function UiDialogBody({ children }: IUiDialogBodyProps) {
    const dialogContext = useUiDialogContext();
    // useLayoutEffect commits synchronously before paint, so the modal's
    // `aria-describedby` is wired up before the focus manager moves focus
    // and the screen reader announces the dialog. Cleanup restores the
    // counter when the body unmounts (modal stays open, content switched).
    useLayoutEffect(() => {
        return dialogContext?.registerBody();
    }, [dialogContext]);
    return (
        <div className={b()} id={dialogContext?.descriptionId}>
            {children}
        </div>
    );
}
