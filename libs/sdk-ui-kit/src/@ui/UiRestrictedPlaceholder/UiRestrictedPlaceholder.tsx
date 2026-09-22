// (C) 2026 GoodData Corporation

import { type AriaAttributes, type HTMLAttributes, type ReactNode } from "react";

import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

/**
 * How much of the placeholder there is room for. `compact` keeps the reason alone, which is what a
 * tile too small for the rest can show.
 *
 * @internal
 */
export type UiRestrictedPlaceholderSize = "default" | "compact";

/**
 * @internal
 */
export interface IUiRestrictedPlaceholderProps {
    /** Why the content is not shown. Never names the object, which the reader may not know of. */
    title: ReactNode;
    /** Recovery guidance; visually hidden in compact mode but available to assistive technology. */
    description?: ReactNode;
    /** @defaultValue "default" */
    size?: UiRestrictedPlaceholderSize;
    dataTestId?: string;
    accessibilityConfig?: {
        role?: HTMLAttributes<HTMLElement>["role"];
        ariaLive?: AriaAttributes["aria-live"];
    };
}

const { b, e } = bem("gd-ui-kit-restricted-placeholder");

/**
 * Stands in for content the viewer is not permitted to see. It takes over whatever it replaces
 * whole, title bar included: a title would name the object, and naming it tells the viewer of
 * something they may not know exists.
 *
 * @internal
 */
export function UiRestrictedPlaceholder({
    title,
    description,
    size = "default",
    dataTestId,
    accessibilityConfig,
}: IUiRestrictedPlaceholderProps) {
    const isCompact = size === "compact";

    return (
        <div
            className={b({ size })}
            data-testid={dataTestId}
            role={accessibilityConfig?.role ?? "status"}
            aria-live={accessibilityConfig?.ariaLive}
        >
            <UiTooltip
                triggerBy={["hover", "focus"]}
                accessibilityHidden
                disabled={!description || !isCompact}
                content={
                    <>
                        {title}
                        <br />
                        {description}
                    </>
                }
                anchor={
                    <div className={e("content")} tabIndex={description && isCompact ? 0 : undefined}>
                        <UiIcon
                            type="lock"
                            size={30}
                            color="currentColor"
                            accessibilityConfig={{ ariaHidden: true }}
                        />
                        <div className={e("text")}>
                            <p className={e("title")}>{title}</p>
                            {description ? (
                                <p className={isCompact ? "sr-only" : e("description")}>{description}</p>
                            ) : null}
                        </div>
                    </div>
                }
            />
        </div>
    );
}
