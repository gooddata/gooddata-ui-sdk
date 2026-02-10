// (C) 2024-2026 GoodData Corporation

import { Fragment, type ReactNode, forwardRef, useRef, useState } from "react";

import { simplifyText } from "@gooddata/util";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { bem } from "../@utils/bem.js";
import { makeTabsKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export interface IUiBreadcrumbItem {
    id: string;
    label: string;
    tooltip?: string | ReactNode;
    accessibilityConfig?: IAccessibilityConfigBase;
}

/**
 * @internal
 */
export interface IUiBreadcrumbProps {
    id?: string;
    label: string;
    items: IUiBreadcrumbItem[];
    onSelect?: (item: IUiBreadcrumbItem) => void;
    dataId?: string;
    dataTestId?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    maxWidth?: number;
    tabIndex?: number;
}

const { b, e } = bem("gd-ui-kit-breadcrumb");

const getGeneratedTestId = (label: string, ariaLabel: string) => {
    return ariaLabel ? `${simplifyText(ariaLabel)}` : `${simplifyText(label)}`;
};

/**
 * @internal
 */
export const UiBreadcrumb = forwardRef<HTMLDivElement, IUiBreadcrumbProps>(
    (
        { id, label, tabIndex = 0, dataId, dataTestId, accessibilityConfig, maxWidth, items, onSelect },
        ref,
    ) => {
        const [focused, setFocused] = useState(0);
        const refs = useRef<(HTMLDivElement | null)[]>([]);
        const testId = dataTestId || getGeneratedTestId(label, accessibilityConfig?.ariaLabel ?? "");

        const onKeyDown = makeTabsKeyboardNavigation({
            onFocusFirst: () => {
                setFocused(0);
            },
            onFocusLast: () => {
                setFocused(refs.current.length - 1);
            },
            onFocusNext: () => {
                const index = Math.min(focused + 1, refs.current.length - 1);
                setFocused(index);
            },
            onFocusPrevious: () => {
                const index = Math.max(focused - 1, 0);
                setFocused(index);
            },
            onSelect: () => {
                onSelect?.(items[focused]);
            },
        });

        return (
            <div
                id={id}
                ref={ref}
                className={b()}
                onKeyDown={onKeyDown}
                tabIndex={tabIndex}
                data-id={dataId}
                data-testid={testId}
                aria-label={accessibilityConfig?.ariaLabel}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                aria-describedby={accessibilityConfig?.ariaDescribedBy}
                aria-expanded={accessibilityConfig?.ariaExpanded}
                aria-description={accessibilityConfig?.ariaDescription}
                aria-controls={accessibilityConfig?.ariaControls}
                aria-haspopup={accessibilityConfig?.ariaHaspopup}
                role={accessibilityConfig?.role ?? "listbox"}
                style={{ maxWidth }}
            >
                {items.map((item, index) => (
                    <Fragment key={item.id}>
                        <div
                            ref={(item) => {
                                refs.current[index] = item;
                            }}
                            className={e("item", {
                                focused: index === focused,
                            })}
                            aria-label={item.accessibilityConfig?.ariaLabel ?? item.label}
                            aria-labelledby={item.accessibilityConfig?.ariaLabelledBy}
                            aria-describedby={item.accessibilityConfig?.ariaDescribedBy}
                            aria-expanded={item.accessibilityConfig?.ariaExpanded}
                            aria-description={item.accessibilityConfig?.ariaDescription}
                            aria-controls={item.accessibilityConfig?.ariaControls}
                            aria-haspopup={item.accessibilityConfig?.ariaHaspopup}
                            role={item.accessibilityConfig?.role ?? "listitem"}
                            onClick={() => {
                                onSelect?.(item);
                            }}
                        >
                            {item.tooltip ? (
                                <UiTooltip
                                    anchor={item.label}
                                    content={item.tooltip}
                                    triggerBy={["hover", "focus"]}
                                />
                            ) : (
                                item.label
                            )}
                        </div>
                        {index < items.length - 1 ? (
                            <div className={e("separator")}>
                                <UiIconButton
                                    tabIndex={-1}
                                    isDisabled
                                    variant="bare"
                                    size="small"
                                    isDesctructive={false}
                                    icon="navigateRight"
                                />
                            </div>
                        ) : null}
                    </Fragment>
                ))}
            </div>
        );
    },
);

UiBreadcrumb.displayName = "UiBreadcrumb";
