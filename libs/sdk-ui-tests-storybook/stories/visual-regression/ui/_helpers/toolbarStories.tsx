// (C) 2026 GoodData Corporation

import { type CSSProperties, type ReactNode, type RefObject, useEffect, useState } from "react";

import { IntlProvider } from "react-intl";

import {
    type IUiListboxInteractiveItem,
    type IUiMenuItem,
    UiDropdown,
    UiListbox,
    UiMenu,
    UiToolbar,
    UiToolbarButton,
    UiToolbarColorSwatch,
    UiToolbarDivider,
    UiToolbarIconButton,
    UiToolbarIconSelect,
    UiToolbarMoreButton,
    UiToolbarSegmentedControl,
    UiToolbarSelect,
    UiToolbarStepper,
} from "@gooddata/sdk-ui-kit";

const MENU_MESSAGES = {
    "menu.back": "Back to the parent menu",
    "menu.close": "Close menu",
};

export function ToolbarStoryFrame({ children, style }: { children: ReactNode; style?: CSSProperties }) {
    return (
        <IntlProvider locale="en-US" messages={MENU_MESSAGES}>
            <div
                className="screenshot-target"
                style={{ padding: 20, display: "grid", gap: 20, alignContent: "start", ...style }}
            >
                {children}
            </div>
        </IntlProvider>
    );
}

/**
 * Focuses the first element matching the selector after mount, so a story can show the focus ring.
 */
export function FocusOnMount({ selector, children }: { selector: string; children: ReactNode }) {
    useEffect(() => {
        document.querySelector<HTMLElement>(selector)?.focus();
    }, [selector]);

    return <>{children}</>;
}

const ZOOM_PRESETS = ["Zoom to fit", "50%", "75%", "100%", "150%", "200%"];
const ZOOM_ITEMS: IUiListboxInteractiveItem<string>[] = ZOOM_PRESETS.map((preset) => ({
    type: "interactive",
    id: preset,
    stringTitle: preset,
    data: preset,
}));

function stepZoom(value: string, direction: 1 | -1): string {
    const current = Number.parseInt(value, 10);
    if (Number.isNaN(current)) {
        return "100%";
    }
    return `${Math.min(400, Math.max(25, current + direction * 25))}%`;
}

export function ZoomStepper({ openOnInit = false }: { openOnInit?: boolean }) {
    const [zoom, setZoom] = useState("100%");

    return (
        <UiDropdown
            accessibilityConfig={{ triggerRole: "combobox", popupRole: "listbox" }}
            openOnInit={openOnInit}
            closeOnEscape
            enableFocusTrap={false}
            width="auto"
            renderButton={({ ref, isOpen, ariaAttributes, openDropdown, closeDropdown }) => (
                <UiToolbarStepper
                    variant="value"
                    value={zoom}
                    onStep={(direction) => setZoom((current) => stepZoom(current, direction))}
                    onCommit={(next) => {
                        setZoom(next);
                        closeDropdown();
                    }}
                    isOpen={isOpen}
                    ariaAttributes={ariaAttributes}
                    inputRef={ref as RefObject<HTMLInputElement>}
                    onClick={openDropdown}
                    accessibilityConfig={{
                        ariaLabel: "Zoom",
                        incrementLabel: "Zoom in",
                        decrementLabel: "Zoom out",
                    }}
                    dataTestId="s-zoom-stepper"
                />
            )}
            renderBody={({ ariaAttributes, closeDropdown }) => (
                <UiListbox
                    items={ZOOM_ITEMS}
                    selectedItemId={zoom}
                    ariaAttributes={{ ...ariaAttributes, "aria-label": "Zoom presets" }}
                    width={160}
                    isCompact
                    onSelect={(item) => {
                        setZoom(item.data);
                        closeDropdown();
                    }}
                    onClose={closeDropdown}
                />
            )}
        />
    );
}

const MORE_ITEMS: IUiMenuItem[] = [
    { type: "interactive", id: "duplicate", stringTitle: "Duplicate", data: "duplicate" },
    { type: "interactive", id: "rename", stringTitle: "Rename", data: "rename" },
    { type: "interactive", id: "delete", stringTitle: "Delete", data: "delete" },
];

export function MoreMenu({ openOnInit = false }: { openOnInit?: boolean }) {
    return (
        <UiDropdown
            accessibilityConfig={{ triggerRole: "button", popupRole: "menu" }}
            openOnInit={openOnInit}
            closeOnEscape
            autofocusOnOpen
            width="auto"
            renderButton={({ ref, isOpen, ariaAttributes, toggleDropdown }) => (
                <UiToolbarMoreButton
                    ref={ref as RefObject<HTMLButtonElement>}
                    label="More actions"
                    isOpen={isOpen}
                    ariaAttributes={ariaAttributes}
                    onClick={toggleDropdown}
                    dataTestId="s-more-button"
                />
            )}
            renderBody={({ ariaAttributes, closeDropdown }) => (
                <UiMenu
                    items={MORE_ITEMS}
                    ariaAttributes={ariaAttributes}
                    onSelect={closeDropdown}
                    onClose={closeDropdown}
                />
            )}
        />
    );
}

const FONTS = ["Inter", "Roboto", "Source Sans", "A very long user generated font family name"];
const FONT_ITEMS: IUiListboxInteractiveItem<string>[] = FONTS.map((font) => ({
    type: "interactive",
    id: font,
    stringTitle: font,
    data: font,
}));

export function FontSelect({
    width = "hug" as const,
    openOnInit = false,
}: {
    width?: "hug" | "fixed";
    openOnInit?: boolean;
}) {
    const [font, setFont] = useState<string | undefined>(undefined);

    return (
        <UiDropdown
            accessibilityConfig={{ triggerRole: "button", popupRole: "listbox" }}
            openOnInit={openOnInit}
            closeOnEscape
            autofocusOnOpen
            width="auto"
            renderButton={({ ref, isOpen, ariaAttributes, toggleDropdown }) => (
                <UiToolbarSelect
                    ref={ref as RefObject<HTMLButtonElement>}
                    label={font ?? "Choose a font"}
                    isPlaceholder={font === undefined}
                    width={width}
                    isOpen={isOpen}
                    ariaAttributes={ariaAttributes}
                    onClick={toggleDropdown}
                    dataTestId="s-font-select"
                />
            )}
            renderBody={({ ariaAttributes, closeDropdown }) => (
                <UiListbox
                    items={FONT_ITEMS}
                    selectedItemId={font}
                    ariaAttributes={{ ...ariaAttributes, "aria-label": "Fonts" }}
                    width={220}
                    isCompact
                    onSelect={(item) => {
                        setFont(item.data);
                        closeDropdown();
                    }}
                    onClose={closeDropdown}
                />
            )}
        />
    );
}

export function ScopeControl() {
    const [scope, setScope] = useState<string | undefined>("cell");

    return (
        <UiToolbarSegmentedControl
            value={scope}
            onChange={setScope}
            accessibilityConfig={{ ariaLabel: "Scope" }}
        >
            <UiToolbarButton value="cell" label="Cell" dataTestId="s-scope-cell" />
            <UiToolbarButton value="row" label="Row" dataTestId="s-scope-row" />
        </UiToolbarSegmentedControl>
    );
}

export function ReferenceToolbar({
    tooltipPlacement = "below" as const,
}: {
    tooltipPlacement?: "below" | "above";
}) {
    return (
        <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }} tooltipPlacement={tooltipPlacement}>
            <UiToolbarIconSelect
                icon={<UiToolbarColorSwatch variant="text" color="#14b2e2" />}
                label="Text colour"
                dataTestId="s-text-colour"
            />
            <UiToolbarIconSelect
                icon={<UiToolbarColorSwatch variant="fill" color="#ffffff" hasBorder />}
                label="Fill colour"
                dataTestId="s-fill-colour"
            />
            <UiToolbarDivider />
            <ZoomStepper />
            <UiToolbarDivider />
            <ScopeControl />
            <UiToolbarIconButton icon="bold" label="Bold" isSelected dataTestId="s-bold" />
            <MoreMenu />
        </UiToolbar>
    );
}

export function InsightFormattingToolbar() {
    return (
        <UiToolbar accessibilityConfig={{ ariaLabel: "Insight formatting" }}>
            <UiToolbarIconSelect
                icon={<UiToolbarColorSwatch variant="text" color="#14b2e2" />}
                label="Text colour"
            />
            <UiToolbarIconSelect
                icon={<UiToolbarColorSwatch variant="fill" color="#ffffff" hasBorder />}
                label="Fill colour"
            />
            <UiToolbarDivider />
            <ZoomStepper />
        </UiToolbar>
    );
}
