// (C) 2025 GoodData Corporation

import { AriaAttributes, AriaRole } from "react";

/**
 * @internal
 */
export interface IDropdownAriaAttributes {
    "aria-labelledby"?: AriaAttributes["aria-labelledby"];
    "aria-label"?: AriaAttributes["aria-label"];
    role: AriaAttributes["aria-haspopup"] & AriaRole;
    id: string;
}

/**
 * @internal
 */
export type UiListboxAriaAttributes = Omit<IDropdownAriaAttributes, "role">;
