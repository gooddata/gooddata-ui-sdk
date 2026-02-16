// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { UiButton, UiDropdown } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

function DropdownBasic() {
    return (
        <div style={{ padding: 40 }}>
            <UiDropdown
                renderButton={({ toggleDropdown, isOpen, ariaAttributes }) => (
                    <UiButton
                        label={isOpen ? "Close Dropdown" : "Open Dropdown"}
                        onClick={toggleDropdown}
                        accessibilityConfig={{
                            ariaExpanded: ariaAttributes["aria-expanded"],
                            ariaHaspopup: true,
                        }}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <div {...ariaAttributes}>
                        <div style={{ marginBottom: 8 }}>
                            <strong>Dropdown Content</strong>
                        </div>
                        <button onClick={closeDropdown}>Close from inside</button>
                    </div>
                )}
                closeOnOutsideClick
                closeOnEscape
            />
        </div>
    );
}

function DropdownControlled() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ padding: 40 }}>
            <div style={{ marginBottom: 16 }}>
                <label>
                    <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />{" "}
                    Controlled open state
                </label>
            </div>

            <UiDropdown
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                renderButton={({ toggleDropdown, isOpen, ariaAttributes }) => (
                    <UiButton
                        label={isOpen ? "Close Dropdown" : "Open Dropdown"}
                        onClick={toggleDropdown}
                        accessibilityConfig={{
                            ariaExpanded: ariaAttributes["aria-expanded"],
                            ariaHaspopup: true,
                        }}
                    />
                )}
                renderBody={({ ariaAttributes }) => (
                    <div {...ariaAttributes}>Controlled dropdown content</div>
                )}
                closeOnOutsideClick
                closeOnEscape
            />
        </div>
    );
}

function DropdownPlacements() {
    const placements = ["bottom-start", "bottom-end", "top-start", "top-end"] as const;

    return (
        <div
            style={{
                display: "flex",
                gap: 20,
                padding: 80,
                justifyContent: "center",
            }}
            className={"screenshot-target"}
        >
            {placements.map((placement) => (
                <UiDropdown
                    key={placement}
                    placement={placement}
                    openOnInit
                    renderButton={({ toggleDropdown, ariaAttributes }) => (
                        <UiButton
                            label={placement}
                            size="small"
                            onClick={toggleDropdown}
                            accessibilityConfig={{
                                ariaExpanded: ariaAttributes["aria-expanded"],
                                ariaHaspopup: true,
                            }}
                        />
                    )}
                    renderBody={({ ariaAttributes }) => <div {...ariaAttributes}>{placement}</div>}
                />
            ))}
        </div>
    );
}

export default {
    title: "15 Ui/UiDropdown",
};

export function Basic() {
    return <DropdownBasic />;
}
Basic.parameters = { kind: "basic" } satisfies IStoryParameters;

export function Controlled() {
    return <DropdownControlled />;
}
Controlled.parameters = { kind: "controlled" } satisfies IStoryParameters;

export function Placements() {
    return <DropdownPlacements />;
}
Placements.parameters = {
    kind: "placements",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<DropdownBasic />);
Themed.parameters = { kind: "themed" } satisfies IStoryParameters;
