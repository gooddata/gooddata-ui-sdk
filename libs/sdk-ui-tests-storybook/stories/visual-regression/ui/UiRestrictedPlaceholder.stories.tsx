// (C) 2026 GoodData Corporation

import {
    ComponentTable,
    type IUiRestrictedPlaceholderProps,
    UiRestrictedPlaceholder,
    propCombinationsFor,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../themeWrapper.js";

import "./UiRestrictedPlaceholder.scss";

export default {
    title: "15 Ui/UiRestrictedPlaceholder",
};

// The copy is fixed by the design; only the size varies.
const title = "You don't have access";
const description = "Contact your administrator to request access.";

const propCombination = propCombinationsFor<IUiRestrictedPlaceholderProps>({ title, description });

const sizes = propCombination("size", ["default", "compact"]);

function PlaceholderTile(props: IUiRestrictedPlaceholderProps) {
    return (
        <div className="restricted-placeholder-examples__regular">
            <UiRestrictedPlaceholder {...props} />
        </div>
    );
}

function UiRestrictedPlaceholderExamples({ showCode }: { showCode?: boolean }) {
    return (
        <div className="screenshot-target">
            <ComponentTable
                rowsBy={[sizes]}
                Component={PlaceholderTile}
                codeSnippet={showCode ? "UiRestrictedPlaceholder" : undefined}
                cellWidth={420}
                cellHeight={200}
            />
        </div>
    );
}

export function Default() {
    return <UiRestrictedPlaceholderExamples />;
}
Default.parameters = {
    kind: "default",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Themed() {
    return wrapWithTheme(<UiRestrictedPlaceholderExamples />);
}
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <UiRestrictedPlaceholderExamples showCode />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;

export function SmallTiles() {
    return (
        <div className="screenshot-target restricted-placeholder-examples">
            <div>
                <p>160 × 100 — view</p>
                <div className="restricted-placeholder-examples__small">
                    <UiRestrictedPlaceholder title={title} description={description} size="compact" />
                </div>
            </div>
            <div>
                <p>160 × 90 — edit</p>
                <div className="restricted-placeholder-examples__small restricted-placeholder-examples__small--edit">
                    <UiRestrictedPlaceholder title={title} description={description} size="compact" />
                </div>
            </div>
        </div>
    );
}
SmallTiles.parameters = {
    kind: "small tiles",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
