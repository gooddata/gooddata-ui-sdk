// (C) 2025-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

/**
 * Props for LayerToggleSwitch component.
 *
 * @internal
 */
export interface ILayerToggleSwitchProps {
    /**
     * Unique identifier for the toggle.
     */
    id: string;

    /**
     * Whether the toggle is checked (layer visible).
     */
    checked: boolean;

    /**
     * Callback when toggle state changes.
     */
    onChange: (checked: boolean) => void;

    /**
     * Accessible label for the toggle.
     */
    ariaLabel: string;

    /**
     * Whether the toggle is disabled.
     */
    disabled?: boolean;
}

/**
 * Toggle switch component for layer visibility control.
 *
 * @remarks
 * Reuses the shared checkbox toggle styling used across the repository
 * while keeping geo-specific test ids and accessibility labels.
 *
 * @internal
 */
export const LayerToggleSwitch = memo(function LayerToggleSwitch({
    id,
    checked,
    onChange,
    ariaLabel,
    disabled = false,
}: ILayerToggleSwitchProps): ReactElement {
    return (
        <label className="input-checkbox-toggle gd-geo-multi-layer-legend__toggle-switch">
            <input
                id={id}
                type="checkbox"
                role="switch"
                aria-checked={checked}
                aria-label={ariaLabel}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(!checked)}
                data-testid={`gd-geo-legend-toggle-${id}`}
            />
            <span className="input-label-text" />
        </label>
    );
});
