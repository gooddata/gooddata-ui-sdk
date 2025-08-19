// (C) 2024-2025 GoodData Corporation
// Theme
import { paletteBaseThemeDeprecatedVariables } from "./deprecated/palette-base.js";
import { inconsistentVariables } from "./inconsistent/inconsistent.js";
import { internalButtonThemeVariables } from "./internal/button.js";
import { internalFontThemeVariables } from "./internal/font.js";
import { internalIconThemeVariables } from "./internal/icon.js";
import { internalModelerThemeVariables } from "./internal/modeler.js";
import { internalSpacingThemeVariables } from "./internal/spacing.js";
import { internalTableThemeVariables } from "./internal/table.js";
import { internalTabsThemeVariables } from "./internal/tabs.js";
import { internalTransitionThemeVariables } from "./internal/transition.js";
import { analyticalDesignerThemeVariables } from "./theme/analytical-designer.js";
import { buttonThemeVariables } from "./theme/button.js";
import { chartThemeVariables } from "./theme/chart.js";
import { dashboardThemeVariables } from "./theme/dashboard.js";
import { kpiThemeVariables } from "./theme/kpi.js";
import { messageThemeVariables } from "./theme/message.js";
import { modalThemeVariables } from "./theme/modal.js";
import { paletteBaseThemeVariables } from "./theme/palette-base.js";
import { paletteComplementaryThemeVariables } from "./theme/palette-complementary.js";
import { tableThemeVariables } from "./theme/table.js";
import { toastMessageThemeVariables } from "./theme/toast-message.js";
import { tooltipThemeVariables } from "./theme/tooltip.js";
import { typographyThemeVariables } from "./theme/typography.js";
// Derived
import { derivedPaletteBaseThemeVariables } from "./theme-derived/palette-base-derived.js";
import { derivedPaletteComplementaryThemeVariables } from "./theme-derived/palette-complementary-derived.js";
import { derivedShadowThemeVariables } from "./theme-derived/shadow-derived.js";
// Internal
// Deprecated
// Inconsistent
import {
    ThemeCssVariable,
    ThemeDefinedCssVariable,
    ThemeDeprecatedCssVariable,
    ThemeDerivedCssVariable,
    ThemeInternalCssVariable,
} from "./types.js";

export const themeDefinedCssVariables: ThemeDefinedCssVariable[] = [
    // Palette
    ...paletteBaseThemeVariables,
    ...paletteComplementaryThemeVariables,
    // Shared
    ...typographyThemeVariables,
    // Components
    ...buttonThemeVariables,
    ...tooltipThemeVariables,
    ...messageThemeVariables,
    ...toastMessageThemeVariables,
    ...modalThemeVariables,
    // Charts
    ...chartThemeVariables,
    ...tableThemeVariables,
    ...kpiThemeVariables,
    // Apps
    ...analyticalDesignerThemeVariables,
    ...dashboardThemeVariables,
];

export const themeDerivedCssVariables: ThemeDerivedCssVariable[] = [
    // Palette
    ...derivedPaletteBaseThemeVariables,
    ...derivedPaletteComplementaryThemeVariables,
    // Shadow
    ...derivedShadowThemeVariables,
];

export const themeInternalCssVariables: ThemeInternalCssVariable[] = [
    // Shared
    ...internalFontThemeVariables,
    ...internalSpacingThemeVariables,
    ...internalTransitionThemeVariables,
    // Components
    ...internalButtonThemeVariables,
    ...internalIconThemeVariables,
    ...internalTabsThemeVariables,
    ...internalTableThemeVariables,
    // Modeler
    ...internalModelerThemeVariables,
];

const themeDeprecatedCssVariables: ThemeDeprecatedCssVariable[] = [...paletteBaseThemeDeprecatedVariables];

export const allThemeCssVariables: ThemeCssVariable[] = [
    ...themeDefinedCssVariables,
    ...themeDerivedCssVariables,
    ...themeInternalCssVariables,
    ...themeDeprecatedCssVariables,
    ...inconsistentVariables,
];
