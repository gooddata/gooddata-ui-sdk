// (C) 2025 GoodData Corporation

import React, { MutableRefObject, Ref, RefCallback, useMemo } from "react";

import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { useIdPrefixed } from "../../utils/useId.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiFocusManager } from "../UiFocusManager/UiFocusManager.js";
import { defaultFocusCheckFn } from "../UiFocusManager/utils.js";
import { UiTooltipProps } from "../UiTooltip/types.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-popover");

const defaultAccessibilityConfig: IAccessibilityConfigBase = {};

/**
 * @internal
 */
export interface UiPopoverProps {
    anchor: React.ReactElement;
    width?: "default" | number;
    disabled?: boolean;
    tabIndex?: number;
    accessibilityConfig?: IAccessibilityConfigBase;
    title?: string | React.ReactNode;
    content?: React.ReactNode | ((args: { onClose: () => void }) => React.ReactNode);
    footer?: React.ReactNode | ((args: { onClose: () => void }) => React.ReactNode);
    triggerBy?: UiTooltipProps["triggerBy"];
    closeText?: string;
    closeVisible?: boolean;
    initialFocus?: React.RefObject<HTMLElement> | string;
    returnFocusTo?: React.RefObject<HTMLElement> | string;
    returnFocusAfterClose?: boolean;
    /**
     * customize if you know that dialog content has some custom focusIn logic which modifies focused element, eg. table which shifts its focus from table wrapper to first table cell
     * default is check if active element is exactly focused element.
     */
    focusCheckFn?: (element: HTMLElement) => boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

/**
 * @internal
 */
export function UiPopover({
    accessibilityConfig = defaultAccessibilityConfig,
    anchor,
    width = "default",
    title,
    tabIndex,
    disabled,
    content,
    footer,
    closeText,
    closeVisible,
    initialFocus,
    returnFocusTo,
    triggerBy = ["click"],
    returnFocusAfterClose = true,
    focusCheckFn = defaultFocusCheckFn,
    onOpen,
    onClose,
}: UiPopoverProps) {
    const ref = React.useRef<HTMLElement | null>(null);
    const returnFocus = useMemo(() => {
        return returnFocusTo ?? ref;
    }, [returnFocusTo]);
    const id = useIdPrefixed("popover");

    return (
        <UiTooltip
            onOpen={onOpen}
            onClose={onClose}
            accessibilityConfig={{
                ...accessibilityConfig,
                role: "dialog",
                ariaLabelledBy: id,
            }}
            anchor={React.cloneElement(anchor, {
                ...(tabIndex === undefined ? {} : { tabIndex }),
                ref: mergeRefs(ref, (anchor as any).ref),
            })}
            content={({ onClose, type }) => {
                //NOTE: Do not make screen reader tooltip visible, live content is enough
                // because we expect that poper content is accessible only when open on click
                // and contains own logic for screen readers
                if (type === "screen-reader") {
                    return null;
                }
                return (
                    <UiFocusManager
                        enableFocusTrap={false}
                        enableAutofocus={initialFocus ? { initialFocus } : true}
                        enableReturnFocusOnUnmount={
                            returnFocusAfterClose ? { returnFocusTo: returnFocus } : false
                        }
                        focusCheckFn={focusCheckFn}
                        tabOutHandler={() => {
                            onClose();
                        }}
                    >
                        <div
                            id={id}
                            tabIndex={0}
                            className={b()}
                            style={{ width: width === "default" ? undefined : width }}
                        >
                            <div className={e("header")}>
                                {typeof title === "string" ? (
                                    <div className={e("header-title")}>{title}</div>
                                ) : (
                                    <>{title}</>
                                )}
                                {closeVisible ? (
                                    <div className={e("header-close")}>
                                        <UiButton
                                            label=""
                                            size="small"
                                            variant="tertiary"
                                            iconBefore="close"
                                            accessibilityConfig={{
                                                ariaLabel: closeText,
                                            }}
                                            onClick={onClose}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            {content ? (
                                <div className={e("content")}>
                                    {typeof content === "function" ? content({ onClose }) : content}
                                </div>
                            ) : null}
                            {footer ? (
                                <div className={e("footer")}>
                                    {typeof footer === "function" ? footer({ onClose }) : footer}
                                </div>
                            ) : null}
                        </div>
                    </UiFocusManager>
                );
            }}
            variant="none"
            triggerBy={triggerBy}
            showArrow={false}
            arrowPlacement="top"
            disabled={disabled}
            width="auto"
        />
    );
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
    return (value: T) => {
        refs.forEach((ref) => {
            if (!ref) return;
            if (typeof ref === "function") {
                ref(value);
            } else {
                (ref as MutableRefObject<T | null>).current = value;
            }
        });
    };
}
