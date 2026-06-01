// (C) 2025-2026 GoodData Corporation

import {
    type AriaAttributes,
    type MutableRefObject,
    type ReactElement,
    type ReactNode,
    type Ref,
    type RefCallback,
    type RefObject,
    cloneElement,
    useMemo,
    useRef,
} from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { useIdPrefixed } from "../../utils/useId.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiFocusManager } from "../UiFocusManager/UiFocusManager.js";
import { defaultFocusCheckFn } from "../UiFocusManager/utils.js";
import { type IUiTooltipProps } from "../UiTooltip/types.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-popover");

const defaultAccessibilityConfig: IAccessibilityConfigBase = {};

function buildAnchorAriaAttrs(
    cfg: IUiPopoverProps["anchorAccessibilityConfig"],
): Record<string, AriaAttributes["aria-haspopup"] | AriaAttributes["aria-controls"]> {
    const ariaHaspopup = cfg?.ariaHaspopup ?? "dialog";
    const out: Record<string, AriaAttributes["aria-haspopup"] | AriaAttributes["aria-controls"]> = {};
    if (ariaHaspopup !== false) {
        out["aria-haspopup"] = ariaHaspopup;
    }
    if (cfg?.ariaControls) {
        out["aria-controls"] = cfg.ariaControls;
    }
    return out;
}

/**
 * @internal
 */
export interface IUiPopoverProps {
    id?: string;
    anchor: ReactElement<any>;
    /**
     * Accessibility attributes forwarded to the anchor element (the trigger).
     * `ariaHaspopup` defaults to `"dialog"` — pass
     * `"menu"` for menu-style popovers, `"listbox"` for
     * single-select pickers, etc. Set `ariaHaspopup: false` to
     * suppress. (Separate from `accessibilityConfig`, which targets
     * the popover content surface.)
     */
    anchorAccessibilityConfig?: {
        ariaHaspopup?: "dialog" | "menu" | "listbox" | "tree" | "grid" | false;
        ariaControls?: AriaAttributes["aria-controls"];
    };
    width?: "default" | number;
    disabled?: boolean;
    tabIndex?: number;
    accessibilityConfig?: IAccessibilityConfigBase;
    title?: string | ReactNode;
    content?: ReactNode | ((args: { onClose: () => void }) => ReactNode);
    footer?: ReactNode | ((args: { onClose: () => void }) => ReactNode);
    triggerBy?: IUiTooltipProps["triggerBy"];
    closeText?: string;
    closeVisible?: boolean;
    initialFocus?: RefObject<HTMLElement> | string;
    returnFocusTo?: RefObject<HTMLElement> | string;
    returnFocusAfterClose?: boolean;
    /**
     * customize if you know that dialog content has some custom focusIn logic which modifies focused element, eg. table which shifts its focus from table wrapper to first table cell
     * default is check if active element is exactly focused element.
     */
    focusCheckFn?: (element: HTMLElement) => boolean;
    /**
     * Enable focus trap to prevent tabbing out of the popover
     * When true, uses UiFocusManager's focus trap instead of tabOutHandler
     */
    enableFocusTrap?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

/**
 * @internal
 */
export function UiPopover({
    id,
    accessibilityConfig = defaultAccessibilityConfig,
    anchor,
    anchorAccessibilityConfig,
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
    enableFocusTrap = false,
    onOpen,
    onClose,
}: IUiPopoverProps) {
    const ref = useRef<HTMLElement | null>(null);
    const returnFocus = useMemo(() => {
        return returnFocusTo ?? ref;
    }, [returnFocusTo]);
    const currentId = useIdPrefixed("popover");
    const titleId = useIdPrefixed("popover-title");

    // Only point aria-labelledby at the title element when one will actually
    // render — i.e. the caller supplied a title. Without this guard, titleless
    // popovers (e.g. UiPermissionMenu) emit a dangling reference. Caller-supplied
    // ariaLabel / ariaLabelledBy in accessibilityConfig still takes precedence.
    const titleLabelledBy = title ? titleId : undefined;

    return (
        <UiTooltip
            onOpen={onOpen}
            onClose={onClose}
            accessibilityConfig={{
                ariaLabelledBy: titleLabelledBy,
                ...accessibilityConfig,
                role: "dialog",
            }}
            anchor={cloneElement(anchor, {
                ...(tabIndex === undefined ? {} : { tabIndex }),
                ...buildAnchorAriaAttrs(anchorAccessibilityConfig),
                ref: mergeRefs(ref, (anchor as any).props?.ref),
            })}
            offset={0}
            content={({ onClose, type }) => {
                //NOTE: Do not make screen reader tooltip visible, live content is enough
                // because we expect that poper content is accessible only when open on click
                // and contains own logic for screen readers
                if (type === "screen-reader") {
                    return null;
                }
                return (
                    <UiFocusManager
                        enableFocusTrap={enableFocusTrap}
                        enableAutofocus={initialFocus ? { initialFocus } : true}
                        enableReturnFocusOnUnmount={
                            returnFocusAfterClose ? { returnFocusTo: returnFocus } : false
                        }
                        focusCheckFn={focusCheckFn}
                        tabOutHandler={
                            enableFocusTrap
                                ? undefined
                                : () => {
                                      onClose();
                                  }
                        }
                    >
                        <div
                            id={id ?? currentId}
                            tabIndex={0}
                            className={b()}
                            style={{ width: width === "default" ? undefined : width }}
                        >
                            {title || closeVisible ? (
                                <div className={e("header")}>
                                    {title ? (
                                        typeof title === "string" ? (
                                            <div id={titleId} className={e("header-title")}>
                                                {title}
                                            </div>
                                        ) : (
                                            <div id={titleId}>{title}</div>
                                        )
                                    ) : null}
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
                            ) : null}
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
            behaviour="popover"
            triggerBy={triggerBy}
            showArrow={false}
            optimalPlacement
            arrowPlacement="top-start"
            disabled={disabled}
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
