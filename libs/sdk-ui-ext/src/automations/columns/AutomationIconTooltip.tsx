// (C) 2025 GoodData Corporation

import { Bubble, BubbleHoverTrigger, UiIconButton } from "@gooddata/sdk-ui-kit";

import { bem } from "../../notificationsPanel/bem.js";
import { type IAutomationIconTooltipProps } from "../types.js";

const { b, e } = bem("gd-ui-ext-automation-icon-tooltip");

function AutomationIconTooltipCore({
    header,
    content,
    sections,
}: Omit<IAutomationIconTooltipProps, "children">) {
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
                        section.icon ? (
                            <div className={e("content")}>
                                <div className={e("content-inner-truncated")}>{section.content}</div>
                                <div className={e("icon-button")}>
                                    <UiIconButton
                                        icon={section.icon}
                                        size="xsmall"
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
    align,
}: IAutomationIconTooltipProps) {
    const alignPoints = align ? [{ align }] : undefined;
    return (
        <BubbleHoverTrigger hideDelay={300} eventsOnBubble>
            {children}
            <Bubble className="bubble-light" alignPoints={alignPoints} arrowStyle={{ display: "none" }}>
                <AutomationIconTooltipCore header={header} content={content} sections={sections} />
            </Bubble>
        </BubbleHoverTrigger>
    );
}
