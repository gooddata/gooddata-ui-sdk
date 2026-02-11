// (C) 2024-2026 GoodData Corporation

import { type ReactNode, forwardRef, useRef } from "react";

import { simplifyText } from "@gooddata/util";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { bem } from "../@utils/bem.js";
import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export interface IUiBreadcrumbItem {
    id: string;
    label: string;
    tooltip?: string | ReactNode;
    accessibilityConfig?: Omit<IAccessibilityConfigBase, "role">;
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
    accessibilityConfig?: Omit<IAccessibilityConfigBase, "role">;
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
        const refs = useRef<(HTMLButtonElement | null)[]>([]);
        const testId = dataTestId || getGeneratedTestId(label, accessibilityConfig?.ariaLabel ?? "");

        const onKeyDown = makeKeyboardNavigation({
            onSelect: [{ code: ["Enter", "Space"] }],
        })({
            onSelect: (e) => {
                (e.target as HTMLButtonElement).click();
            },
        });

        return (
            <nav
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
                aria-current="true"
                style={{ maxWidth }}
            >
                <ol>
                    {items.map((item, index) => (
                        <li key={item.id}>
                            <button
                                ref={(item) => {
                                    refs.current[index] = item;
                                }}
                                className={e("item")}
                                aria-label={item.accessibilityConfig?.ariaLabel ?? item.label}
                                aria-labelledby={item.accessibilityConfig?.ariaLabelledBy}
                                aria-describedby={item.accessibilityConfig?.ariaDescribedBy}
                                aria-expanded={item.accessibilityConfig?.ariaExpanded}
                                aria-description={item.accessibilityConfig?.ariaDescription}
                                aria-controls={item.accessibilityConfig?.ariaControls}
                                aria-haspopup={item.accessibilityConfig?.ariaHaspopup}
                                aria-current={index === items.length - 1}
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
                            </button>
                            {index < items.length - 1 ? (
                                <div className={e("separator")}>
                                    <UiIcon type="navigateRight" size={16} color="complementary-5" />
                                </div>
                            ) : null}
                        </li>
                    ))}
                </ol>
            </nav>
        );
    },
);

UiBreadcrumb.displayName = "UiBreadcrumb";
