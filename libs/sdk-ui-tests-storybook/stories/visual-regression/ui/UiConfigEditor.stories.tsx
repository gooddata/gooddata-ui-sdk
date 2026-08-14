// (C) 2026 GoodData Corporation

import { useState } from "react";

import { action } from "storybook/actions";

import { IntlWrapper } from "@gooddata/sdk-ui";
import {
    ComponentTable,
    type ConfigEditorLanguage,
    type IUiConfigEditorProps,
    type IUiMenuItem,
    UiConfigEditor,
    UiMenu,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import {
    type INeobackstopScenarioConfig,
    type IStoryParameters,
    State,
} from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

const SAMPLE_CONFIG = JSON.stringify(
    {
        title: "Quarterly revenue",
        palette: { primary: "#14b2e2", complementary: ["#fff", "#464e56"] },
        slides: [
            { type: "cover", showLogo: true },
            { type: "widget", widgetId: "revenue-by-region" },
        ],
    },
    null,
    4,
);

// Missing the closing brace, so neither language can parse it: the lint gutter marks the error and
// Auto-format has nothing it could do.
const BROKEN_CONFIG = '{\n    "title": "Quarterly revenue",\n    "slides": [\n';

/**
 * Stands in for the export-template menu: two groups reached by drilling in from the root, which is
 * what the editor's context-menu slot is for.
 */
type ExampleMenuData = { interactive: { onSelect?: () => void } };

const MENU_ITEMS: IUiMenuItem<ExampleMenuData>[] = [
    {
        type: "interactive",
        id: "examples",
        stringTitle: "Examples",
        data: {},
        subItems: ["Basic", "With cover slide", "With logo"].map((title) => ({
            type: "interactive" as const,
            id: `example-${title}`,
            stringTitle: title,
            data: { onSelect: action(`apply example: ${title}`) },
        })),
    },
    {
        type: "interactive",
        id: "variables",
        stringTitle: "Variables",
        data: {},
        subItems: ["{{workspaceName}}", "{{dashboardTitle}}", "{{logo}}"].map((token) => ({
            type: "interactive" as const,
            id: token,
            stringTitle: token,
            data: { onSelect: action(`insert variable: ${token}`) },
        })),
    },
];

// UiMenu localizes its submenu header from sdk-ui's bundle, so it needs that provider to render.
const renderExampleContextMenu: IUiConfigEditorProps["renderContextMenu"] = ({ onClose, ariaAttributes }) => (
    <IntlWrapper locale="en-US">
        <UiMenu<ExampleMenuData>
            items={MENU_ITEMS}
            size="small"
            minWidth={120}
            ariaAttributes={ariaAttributes}
            onClose={onClose}
            onSelect={(item) => item.data.onSelect?.()}
        />
    </IntlWrapper>
);

/**
 * The editor is controlled, so every story needs a host holding both the value and the language —
 * the same shape the consuming dialogs have.
 */
function ConfigEditorExample({
    initialValue = SAMPLE_CONFIG,
    initialLanguage = "json",
    ...props
}: {
    initialValue?: string;
    initialLanguage?: ConfigEditorLanguage;
} & Partial<IUiConfigEditorProps>) {
    const [value, setValue] = useState(initialValue);
    const [language, setLanguage] = useState<ConfigEditorLanguage>(initialLanguage);

    return (
        <UiConfigEditor
            label="Definition"
            rows={10}
            {...props}
            labels={{ languageSwitcher: "Editor language", syntaxError: "Syntax error", ...props.labels }}
            value={value}
            onChange={(next) => {
                action("change")(next);
                setValue(next);
            }}
            language={language}
            onLanguageChange={(next) => {
                action("language change")(next);
                setLanguage(next);
            }}
        />
    );
}

function ConfigEditorTest({
    initialLanguage = "json",
    initialValue,
    ...props
}: {
    initialLanguage?: ConfigEditorLanguage;
    initialValue?: string;
} & Partial<IUiConfigEditorProps>) {
    return (
        <div className="screenshot-target" style={{ width: 640, padding: 16 }}>
            <ConfigEditorExample initialLanguage={initialLanguage} initialValue={initialValue} {...props} />
        </div>
    );
}

const propCombination = propCombinationsFor({
    value: SAMPLE_CONFIG,
    onChange: () => {},
    language: "json",
    onLanguageChange: () => {},
    label: "Definition",
    rows: 6,
} as IUiConfigEditorProps);

const languages = propCombination("language", ["json", "yaml"]);
const states = propCombination("readOnly", [true], { rows: 6 });
const disabled = propCombination("disabled", [true], { rows: 6 });

function ConfigEditorInterface() {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[languages, states, disabled]}
                Component={UiConfigEditor}
                codeSnippet="UiConfigEditor"
                align="flex-start"
                cellWidth={560}
            />
        </div>
    );
}

export default {
    title: "15 Ui/UiConfigEditor",
};

// CodeMirror mounts in an effect, so wait for a rendered line rather than the wrapper: the wrapper
// exists before there is any text to capture. Text rendering is also the least stable thing to
// screenshot, hence the tolerance.
const screenshotConfig: INeobackstopScenarioConfig = {
    readySelector: { selector: ".cm-line", state: State.Attached },
    misMatchThreshold: 0.01,
};

export function Json() {
    return <ConfigEditorTest />;
}
Json.parameters = { kind: "json", screenshot: screenshotConfig } satisfies IStoryParameters;

/**
 * The toolbar with the context-menu slot filled: the button only appears when a caller supplies the
 * menu, so this is the one scenario that captures it.
 */
export function WithContextMenu() {
    return (
        <ConfigEditorTest
            labels={{ contextMenu: "More actions" }}
            renderContextMenu={renderExampleContextMenu}
        />
    );
}
WithContextMenu.parameters = {
    kind: "with-context-menu",
    screenshot: screenshotConfig,
} satisfies IStoryParameters;

/**
 * Not screenshotted: the menu is a floating panel, and clicking to open it moves focus, which makes
 * the capture turn on focus-ring timing. It stays here so the drill-in and its back header can be
 * exercised by hand in Storybook.
 */
export function ContextMenuOpen() {
    // Same rendering as WithContextMenu — this story exists only to be exercised by hand.
    return WithContextMenu();
}
ContextMenuOpen.parameters = { kind: "context-menu-open" } satisfies IStoryParameters;

export function Yaml() {
    return <ConfigEditorTest initialLanguage="yaml" />;
}
Yaml.parameters = { kind: "yaml", screenshot: screenshotConfig } satisfies IStoryParameters;

// A hand-annotated YAML document: the single-language editor must keep the comments — Auto-format
// included — since there is no conversion step that could strip them.
const ANNOTATED_YAML = [
    "# Visualization definition",
    "id: revenue-by-region",
    "",
    "# Presentation",
    "title: Revenue by region",
    "type: table",
    "",
].join("\n");

/**
 * The catalog's as-code shape: YAML is the primary and only language, so no switcher renders and the
 * toolbar holds just Auto-format.
 */
export function YamlOnly() {
    return (
        <ConfigEditorTest
            initialValue={ANNOTATED_YAML}
            initialLanguage="yaml"
            primaryLanguage="yaml"
            languages={["yaml"]}
        />
    );
}
YamlOnly.parameters = { kind: "yaml-only", screenshot: screenshotConfig } satisfies IStoryParameters;

export function Invalid() {
    return <ConfigEditorTest initialValue={BROKEN_CONFIG} />;
}
Invalid.parameters = {
    kind: "invalid",
    screenshot: {
        ...screenshotConfig,
        // The error marker this scenario exists to capture comes from CodeMirror's linter, which
        // runs on a delay after the document settles. Waiting only for a rendered line would race
        // it and intermittently capture a gutter with no marker.
        delay: { postReady: 1500 },
    },
} satisfies IStoryParameters;

export function ReadOnly() {
    return <ConfigEditorTest readOnly />;
}
ReadOnly.parameters = { kind: "read-only", screenshot: screenshotConfig } satisfies IStoryParameters;

export function Disabled() {
    return <ConfigEditorTest disabled />;
}
Disabled.parameters = { kind: "disabled", screenshot: screenshotConfig } satisfies IStoryParameters;

export function Themed() {
    return wrapWithTheme(<ConfigEditorTest />);
}
Themed.parameters = { kind: "themed", screenshot: screenshotConfig } satisfies IStoryParameters;

export function ThemedYaml() {
    return wrapWithTheme(<ConfigEditorTest initialLanguage="yaml" />);
}
ThemedYaml.parameters = { kind: "themed-yaml", screenshot: screenshotConfig } satisfies IStoryParameters;

/**
 * Starts from compact JSON so the toolbar can be exercised by hand: switching to YAML and back
 * re-formats the value, and Auto-format re-formats the current language.
 *
 * Deliberately not screenshotted. Clicking a language radio both moves focus — with its own focus
 * styling — and remounts CodeMirror to swap grammars, so a capture taken straight after the click
 * races the rebuild and drifts by around 1% between runs. The behaviour is covered by unit tests
 * against a real editor instead, and the resulting states are already captured by the `json` and
 * `yaml` scenarios.
 */
export function LanguageToggle() {
    return <ConfigEditorTest initialValue='{"title":"Quarterly revenue","slides":[{"type":"cover"}]}' />;
}
LanguageToggle.parameters = { kind: "language-toggle" } satisfies IStoryParameters;

// No screenshot: the rendered code snippet is not screenshot-stable.
export function Interface() {
    return <ConfigEditorInterface />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
