// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IDialogBaseProps } from "./typings.js";
import { DialogCloseButton } from "./DialogCloseButton.js";
import { UiFocusTrap } from "../@ui/UiFocusTrap/UiFocusTrap.js";

const checkKeyHandler = (event: React.KeyboardEvent, key: string, handler: () => void): void => {
    if (event.key !== key) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    handler();
};

const isTargetTextInput = ({ target }: React.KeyboardEvent): boolean => {
    const { tagName, type } = target as HTMLInputElement;

    const tagNameInLowercase = tagName.toLowerCase();
    const typeInLowercase = type ? type.toLowerCase() : "";

    return (
        tagNameInLowercase === "textarea" ||
        (tagNameInLowercase === "input" && (typeInLowercase === "text" || typeInLowercase === "number"))
    );
};

/**
 * @internal
 */
export const DialogBase = React.memo<IDialogBaseProps>(function DialogBase({
    submitOnEnterKey,
    onCancel,
    onSubmit,
    displayCloseButton,
    onClose,
    accessibilityConfig,
    className,
    autofocusOnOpen = true,
    children,
    CloseButton = DialogCloseButton,
    initialFocus,
}) {
    const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
        (event) => {
            // don't call onSubmit when pressing enter key on input fields
            const isEnterKeyDownOnInputField = event.key === "Enter" && isTargetTextInput(event);
            if (submitOnEnterKey === false && isEnterKeyDownOnInputField) {
                return;
            }

            checkKeyHandler(event, "Enter", onSubmit);
            checkKeyHandler(event, "Escape", onCancel);
        },
        [onCancel, onSubmit, submitOnEnterKey],
    );

    const dialogClasses = cx("overlay", "gd-dialog", className);

    return (
        <UiFocusTrap initialFocus={initialFocus} autofocusOnOpen={autofocusOnOpen}>
            <div
                onKeyDown={handleKeyDown}
                role={"dialog"}
                aria-labelledby={accessibilityConfig?.titleElementId}
                aria-describedby={accessibilityConfig?.descriptionElementId}
            >
                <div className={dialogClasses}>
                    {displayCloseButton ? (
                        <CloseButton
                            onClose={onClose ?? onCancel}
                            accessibilityConfig={accessibilityConfig}
                        />
                    ) : null}

                    {children}
                </div>
            </div>
        </UiFocusTrap>
    );
});
