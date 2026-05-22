// (C) 2026 GoodData Corporation

import { type AriaAttributes, type HTMLAttributes, type ReactNode } from "react";

import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

/**
 * @internal
 */
export interface IUiErrorPageProps {
    title: ReactNode;
    description?: ReactNode;
    dataTestId?: string;
    accessibilityConfig?: {
        role?: HTMLAttributes<HTMLElement>["role"];
        ariaLive?: AriaAttributes["aria-live"];
    };
}

const { b, e } = bem("gd-ui-kit-error-page");

/**
 * Shared error placeholder used for 404 / inaccessible-object states across the app.
 *
 * @internal
 */
export function UiErrorPage({ title, description, dataTestId, accessibilityConfig }: IUiErrorPageProps) {
    return (
        <div
            className={b()}
            data-testid={dataTestId}
            role={accessibilityConfig?.role ?? "status"}
            aria-live={accessibilityConfig?.ariaLive}
        >
            <div className={e("content")}>
                <div className={e("icon")}>
                    <UiIcon
                        type="warning"
                        size={30}
                        color="currentColor"
                        accessibilityConfig={{ ariaHidden: true }}
                    />
                </div>
                <div className={e("text")}>
                    <h2 className={e("title")}>{title}</h2>
                    {description ? <p className={e("description")}>{description}</p> : null}
                </div>
            </div>
        </div>
    );
}
