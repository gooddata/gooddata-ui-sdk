// (C) 2025 GoodData Corporation

import { type KeyboardEvent, type ReactElement, memo } from "react";

import cx from "classnames";

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
 * Renders a pill-shaped toggle switch matching the Figma design.
 * 30x14 pill with sliding 10x10 circle indicator.
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
    const handleChange = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onChange(!checked);
        }
    };

    const toggleClassName = cx("gd-geo-legend-toggle", {
        "gd-geo-legend-toggle--checked": checked,
        "gd-geo-legend-toggle--disabled": disabled,
    });

    return (
        <button
            type="button"
            id={id}
            className={toggleClassName}
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={handleChange}
            onKeyDown={handleKeyDown}
            data-testid={`gd-geo-legend-toggle-${id}`}
        >
            <span className="gd-geo-legend-toggle__track" />
            <span className="gd-geo-legend-toggle__thumb" />
        </button>
    );
});
