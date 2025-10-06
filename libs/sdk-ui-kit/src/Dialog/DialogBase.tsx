// (C) 2020-2025 GoodData Corporation

import { KeyboardEvent, KeyboardEventHandler, memo, useCallback } from "react";

import cx from "classnames";

import { DialogCloseButton } from "./DialogCloseButton.js";
import { IDialogBaseProps } from "./typings.js";
import { UiFocusManager } from "../@ui/UiFocusManager/UiFocusManager.js";
import { defaultFocusCheckFn } from "../@ui/UiFocusManager/utils.js";
import { ScreenReaderToast } from "../Messages/index.js";
import { isElementSubmitButton, isElementTextInput } from "../utils/domUtilities.js";

const checkKeyHandler = (event: KeyboardEvent, key: string, handler?: () => void): void => {
    if (event.key !== key || !handler) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    handler();
};

/**
 * @internal
 */
export const DialogBase = memo<IDialogBaseProps>(function DialogBase({
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
    returnFocusTo,
    shouldCloseOnEscape = false,
    returnFocusAfterClose = false,
    isModal = true,
    focusCheckFn = defaultFocusCheckFn,
}) {
    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
        (event) => {
            // don't call onSubmit when pressing enter key on input fields
            const isEnterKeyDownOnInputField = event.key === "Enter" && isElementTextInput(event.target);
            if (submitOnEnterKey === false && isEnterKeyDownOnInputField) {
                return;
            }

            if (event.key === "Enter" && !isElementSubmitButton(event) && !isElementTextInput(event.target)) {
                return;
            }

            checkKeyHandler(event, "Enter", onSubmit);
            checkKeyHandler(event, "Escape", shouldCloseOnEscape ? onClose : onCancel);
        },
        [onCancel, onSubmit, onClose, submitOnEnterKey, shouldCloseOnEscape],
    );

    const dialogClasses = cx("overlay", "gd-dialog", className);

    return (
        <UiFocusManager
            enableFocusTrap={isModal}
            enableAutofocus={!!isModal && autofocusOnOpen ? { initialFocus } : false}
            enableReturnFocusOnUnmount={returnFocusAfterClose ? { returnFocusTo } : false}
            focusCheckFn={focusCheckFn}
        >
            <div
                id={accessibilityConfig?.dialogId}
                onKeyDown={handleKeyDown}
                role={"dialog"}
                aria-modal={accessibilityConfig?.isModal}
                aria-label={accessibilityConfig?.title}
                aria-labelledby={accessibilityConfig?.titleElementId}
                aria-describedby={accessibilityConfig?.descriptionElementId}
            >
                <ScreenReaderToast />
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
        </UiFocusManager>
    );
});
