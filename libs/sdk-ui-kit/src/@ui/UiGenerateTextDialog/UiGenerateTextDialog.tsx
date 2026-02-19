// (C) 2026 GoodData Corporation

import { type ChangeEvent, useCallback, useId, useRef, useState } from "react";

import cx from "classnames";

import { Dialog } from "../../Dialog/Dialog.js";
import { Spinner } from "../../Spinner/Spinner.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiIconButton, type UiIconButtonProps } from "../UiIconButton/UiIconButton.js";

const { b, e } = bem("gd-ui-kit-generate-text-dialog");

/**
 * @internal
 */
export interface IUiGenerateTextDialogResult {
    text?: string;
    note?: string;
}

/**
 * @internal
 */
export interface IUiGenerateTextDialogProps {
    buttonLabel: string;
    buttonDataTestId?: string;
    buttonIcon?: IconType;
    buttonSize?: UiIconButtonProps["size"];
    buttonVariant?: UiIconButtonProps["variant"];
    dialogTitle: string;
    dialogDisclaimer: string;
    acceptLabel: string;
    declineLabel: string;
    noteLabel: string;
    textAreaAriaLabel: string;
    initialText: string;
    textAreaRows?: number;
    onGenerate: () => Promise<IUiGenerateTextDialogResult>;
    onAccept: (text: string) => void;
}

/**
 * Generic AI-generated text action with icon button + editable dialog.
 *
 * @internal
 */
export function UiGenerateTextDialog({
    buttonLabel,
    buttonDataTestId,
    buttonIcon = "ai",
    buttonSize = "small",
    buttonVariant = "tertiary",
    dialogTitle,
    dialogDisclaimer,
    acceptLabel,
    declineLabel,
    noteLabel,
    textAreaAriaLabel,
    initialText,
    textAreaRows = 7,
    onGenerate,
    onAccept,
}: IUiGenerateTextDialogProps) {
    const dialogTitleId = useId();
    const dialogDescriptionId = useId();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [generatedText, setGeneratedText] = useState("");
    const [generatedNote, setGeneratedNote] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const latestRequestIdRef = useRef(0);

    const closeDialog = useCallback(() => {
        latestRequestIdRef.current += 1;
        setIsDialogOpen(false);
        setIsGenerating(false);
    }, []);

    const openDialog = useCallback(() => {
        const requestId = latestRequestIdRef.current + 1;
        latestRequestIdRef.current = requestId;

        setIsDialogOpen(true);
        setIsGenerating(true);
        setGeneratedText(initialText ?? "");
        setGeneratedNote("");

        void Promise.resolve()
            .then(onGenerate)
            .then((result) => {
                if (latestRequestIdRef.current !== requestId) {
                    return;
                }

                setGeneratedText(result.text ?? "");
                setGeneratedNote(result.note ?? "");
            })
            .catch(() => {
                // Error handling is delegated to caller.
            })
            .finally(() => {
                if (latestRequestIdRef.current !== requestId) {
                    return;
                }

                setIsGenerating(false);
            });
    }, [initialText, onGenerate]);

    const handleTextChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
        setGeneratedText(event.target.value);
    }, []);

    const accept = useCallback(() => {
        onAccept(generatedText);
        closeDialog();
    }, [closeDialog, generatedText, onAccept]);

    return (
        <>
            <UiIconButton
                icon={buttonIcon}
                size={buttonSize}
                variant={buttonVariant}
                dataTestId={buttonDataTestId}
                label={buttonLabel}
                onClick={openDialog}
            />
            {isDialogOpen ? (
                <Dialog
                    displayCloseButton
                    closeOnEscape
                    onClose={closeDialog}
                    onCancel={closeDialog}
                    accessibilityConfig={{
                        titleElementId: dialogTitleId,
                        descriptionElementId: dialogDescriptionId,
                        isModal: true,
                    }}
                    className={b()}
                >
                    <div className={e("content")}>
                        <h2 id={dialogTitleId} className={e("title")}>
                            {dialogTitle}
                        </h2>
                        <p id={dialogDescriptionId} className={e("disclaimer")}>
                            {dialogDisclaimer}
                        </p>
                        <div className={e("textarea-wrapper", { isLoading: isGenerating })}>
                            <textarea
                                className={cx(
                                    "gd-input-field",
                                    "s-textarea-field",
                                    e("textarea", { isLoading: isGenerating }),
                                )}
                                value={generatedText}
                                onChange={handleTextChange}
                                disabled={isGenerating}
                                rows={textAreaRows}
                                aria-label={textAreaAriaLabel}
                            />
                            {isGenerating ? (
                                <div className={e("textarea-loader")} aria-hidden>
                                    <Spinner />
                                </div>
                            ) : null}
                        </div>
                        {generatedNote ? (
                            <p className={e("note")}>
                                <span className={e("note-label")}>{noteLabel}: </span>
                                {generatedNote}
                            </p>
                        ) : null}
                        <div className={e("actions")}>
                            <UiButton variant="secondary" label={declineLabel} onClick={closeDialog} />
                            <UiButton
                                variant="primary"
                                label={acceptLabel}
                                onClick={accept}
                                isDisabled={isGenerating}
                            />
                        </div>
                    </div>
                </Dialog>
            ) : null}
        </>
    );
}
