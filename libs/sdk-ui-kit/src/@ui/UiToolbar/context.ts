// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type TooltipArrowPlacement } from "../UiTooltip/types.js";

/**
 * An accessible name for a toolbar or a group: a label, or a reference to a labelling element.
 *
 * @internal
 */
export type UiToolbarNamingConfig =
    | {
          ariaLabel: NonNullable<IAccessibilityConfigBase["ariaLabel"]>;
          ariaLabelledBy?: IAccessibilityConfigBase["ariaLabelledBy"];
      }
    | {
          ariaLabel?: IAccessibilityConfigBase["ariaLabel"];
          ariaLabelledBy: NonNullable<IAccessibilityConfigBase["ariaLabelledBy"]>;
      };

/**
 * @internal
 */
export interface IUiToolbarContextValue {
    tooltipArrowPlacement: Extract<TooltipArrowPlacement, "top" | "bottom">;
}

export const UiToolbarContext = createContext<IUiToolbarContextValue | null>(null);

export function useUiToolbarContextOptional(): IUiToolbarContextValue | null {
    return useContext(UiToolbarContext);
}
