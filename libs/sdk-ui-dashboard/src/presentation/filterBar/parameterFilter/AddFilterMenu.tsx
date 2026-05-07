// (C) 2026 GoodData Corporation

import { type ReactElement, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { Dropdown, UiIcon, UiIconButton, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { DashboardParameterPicker } from "./DashboardParameterPicker.js";

type ActiveView = "menu" | "parameters";

const messages = defineMessages({
    addFilter: { id: "dashboard_add_filter.button.aria_label" },
    addFilterTitle: { id: "dashboard_add_filter.menu.title" },
    parameter: { id: "dashboard_add_filter.menu.parameter" },
});

/**
 * KD-local "+" filter menu.
 *
 * @internal
 */
export function AddFilterMenu(): ReactElement {
    const intl = useIntl();

    return (
        <Dropdown
            className="gd-add-filter-menu"
            alignPoints={[{ align: "bl tl", offset: { x: 0, y: 5 } }]}
            renderButton={({ isOpen, toggleDropdown }) => (
                <UiIconButton
                    icon="plus"
                    variant="secondary"
                    size="medium"
                    isActive={isOpen}
                    onClick={toggleDropdown}
                    accessibilityConfig={{
                        ariaLabel: intl.formatMessage(messages.addFilter),
                        isExpanded: isOpen,
                        ariaExpanded: isOpen,
                        ariaHaspopup: true,
                    }}
                />
            )}
            renderBody={({ closeDropdown }) => <AddFilterMenuBody onClose={closeDropdown} />}
        />
    );
}

function AddFilterMenuBody({ onClose }: { onClose: () => void }): ReactElement {
    const intl = useIntl();
    const [activeView, setActiveView] = useState<ActiveView>("menu");

    if (activeView === "menu") {
        return (
            <div className="gd-add-filter-menu-body">
                <UiSubmenuHeader title={intl.formatMessage(messages.addFilterTitle)} onClose={onClose} />
                <div className="gd-add-filter-menu-content">
                    <button
                        type="button"
                        className="gd-add-filter-menu-item"
                        onClick={() => setActiveView("parameters")}
                    >
                        <UiIcon type="parameter" size={18} color="currentColor" />
                        <span>{intl.formatMessage(messages.parameter)}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="gd-add-filter-menu-body">
            <UiSubmenuHeader
                title={intl.formatMessage(messages.parameter)}
                onBack={() => setActiveView("menu")}
                onClose={onClose}
            />
            <DashboardParameterPicker onAdd={onClose} onCancel={() => setActiveView("menu")} />
        </div>
    );
}
