// (C) 2025-2026 GoodData Corporation

import { useId } from "react";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { bem } from "../../notificationsPanel/bem.js";
import { type IAutomationIconTooltipProps } from "../types.js";

const { b, e } = bem("gd-ui-ext-automation-icon-tooltip");

function AutomationIconTooltipCore({
    header,
    content,
    sections,
    isInteractive,
}: Pick<IAutomationIconTooltipProps, "header" | "content" | "sections"> & { isInteractive: boolean }) {
    return (
        <div className={b()}>
            <div>
                <div className={e("header")}>{header}</div>
                {content ? <div className={e("content-header")}>{content}</div> : null}
            </div>
            {sections.map((section, index) => (
                <div key={index}>
                    <div className={e("sub-header")}>{section.header.toUpperCase()}</div>
                    {section.content ? (
                        section.icon && isInteractive ? (
                            <div className={e("content")}>
                                <div className={e("content-inner-truncated")}>{section.content}</div>
                                <div className={e("icon-button")}>
                                    <UiIconButton
                                        icon={section.icon}
                                        size="xxsmall"
                                        variant="tertiary"
                                        onClick={section.onIconClick}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={e("content")}>{section.content}</div>
                        )
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export function AutomationIconTooltip({
    header,
    content,
    sections,
    children,
    arrowPlacement,
    triggerAriaLabel,
}: IAutomationIconTooltipProps) {
    const tooltipId = useId();
    return (
        <UiTooltip
            id={tooltipId}
            behaviour="popover"
            variant="none"
            showArrow={false}
            arrowPlacement={arrowPlacement}
            optimalPlacement
            triggerBy={["hover", "focus"]}
            hoverCloseDelay={300}
            inlineAnchor
            anchor={
                <button
                    type="button"
                    className={e("trigger")}
                    aria-label={triggerAriaLabel}
                    aria-describedby={tooltipId}
                >
                    {children}
                </button>
            }
            content={({ type }) => (
                <AutomationIconTooltipCore
                    header={header}
                    content={content}
                    sections={sections}
                    isInteractive={type === "live"}
                />
            )}
        />
    );
}
