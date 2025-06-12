// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IDialogBaseProps } from "./typings.js";
import { DialogCloseButton } from "./DialogCloseButton.js";
import { UiFocusTrap } from "../@ui/UiFocusTrap/UiFocusTrap.js";
import { isElementSubmitButton, isElementTextInput } from "../utils/domUtilities.js";

const checkKeyHandler = (event: React.KeyboardEvent, key: string, handler?: () => void): void => {
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
    returnFocusTo,
    shouldCloseOnEscape = false,
    returnFocusAfterClose = false,
    isModal = true,
}) {
    const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
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
        <FocusTrapOrNull
            initialFocus={initialFocus}
            returnFocusTo={returnFocusTo}
            autofocusOnOpen={autofocusOnOpen}
            returnFocusAfterClose={returnFocusAfterClose}
            isModal={isModal}
        >
            <div
                onKeyDown={handleKeyDown}
                role={"dialog"}
                aria-modal={accessibilityConfig?.isModal}
                aria-label={accessibilityConfig?.title}
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
        </FocusTrapOrNull>
    );
});

const FocusTrapOrNull = (
    props: { children: React.ReactElement } & Pick<
        IDialogBaseProps,
        "initialFocus" | "returnFocusTo" | "autofocusOnOpen" | "returnFocusAfterClose" | "isModal"
    >,
) => {
    if (!props.isModal) {
        return <>{props.children}</>;
    }
    return (
        <UiFocusTrap
            initialFocus={props.initialFocus}
            returnFocusTo={props.returnFocusTo}
            autofocusOnOpen={props.autofocusOnOpen}
            returnFocusOnUnmount={props.returnFocusAfterClose}
        >
            {props.children}
        </UiFocusTrap>
    );
};
