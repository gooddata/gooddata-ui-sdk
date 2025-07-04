// (C) 2020-2025 GoodData Corporation

import { IAccessibilityConfigBase } from "./accessibility.js";
import { HTMLAttributes } from "react";

/**
 * @deprecated use `event.key` or `event.code`. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 * @internal
 */
export enum ENUM_KEY_CODE {
    KEY_CODE_ENTER = 13,
    KEY_CODE_ESCAPE = 27,
}

/**
 * @internal
 */
export function accessibilityConfigToAttributes(
    accessibilityConfig?: IAccessibilityConfigBase,
): HTMLAttributes<HTMLElement> {
    if (!accessibilityConfig) {
        return {};
    }

    return {
        "aria-label": accessibilityConfig.ariaLabel,
        "aria-labelledby": accessibilityConfig.ariaLabelledBy,
        "aria-describedby": accessibilityConfig.ariaDescribedBy,
        role: accessibilityConfig.role,
        "aria-expanded": accessibilityConfig.ariaExpanded,
        "aria-controls": accessibilityConfig.ariaControls,
    };
}
