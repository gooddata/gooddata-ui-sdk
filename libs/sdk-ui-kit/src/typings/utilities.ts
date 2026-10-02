// (C) 2020-2026 GoodData Corporation

import { type HTMLAttributes } from "react";

import { pickBy } from "lodash-es";

import { type IAccessibilityConfigBase } from "./accessibility.js";

/**
 * @deprecated use `event.key` or `event.code`. See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 * @internal
 */
export enum ENUM_KEY_CODE {
    KEY_CODE_ENTER = 13,
    KEY_CODE_ESCAPE = 27,
}

/**
 * Maps an accessibility config to ARIA attributes. Unset values are omitted, so spreading
 * the result never overrides an attribute the component sets itself (e.g. `aria-label={label}`).
 *
 * @internal
 */
export function accessibilityConfigToAttributes(
    accessibilityConfig?: IAccessibilityConfigBase,
): HTMLAttributes<HTMLElement> {
    if (!accessibilityConfig) {
        return {};
    }

    return pickBy(
        {
            "aria-label": accessibilityConfig.ariaLabel,
            "aria-labelledby": accessibilityConfig.ariaLabelledBy,
            "aria-describedby": accessibilityConfig.ariaDescribedBy,
            role: accessibilityConfig.role,
            "aria-expanded": accessibilityConfig.ariaExpanded,
            "aria-controls": accessibilityConfig.ariaControls,
            "aria-haspopup": accessibilityConfig.ariaHaspopup,
            "aria-pressed": accessibilityConfig.ariaPressed,
            "aria-checked": accessibilityConfig.ariaChecked,
            "aria-autocomplete": accessibilityConfig.ariaAutocomplete,
            "aria-activedescendant": accessibilityConfig.ariaActiveDescendant,
            "aria-current": accessibilityConfig.ariaCurrent,
            "aria-description": accessibilityConfig.ariaDescription,
        },
        (value) => value !== undefined,
    );
}
