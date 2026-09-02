// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IParameterDefinition } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { ParameterControl, ParameterControlButton } from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const numberDefinitionWithConstraints: IParameterDefinition = {
    type: "NUMBER",
    defaultValue: 25,
    constraints: { min: 0, max: 100 },
};

const numberDefinitionWithoutConstraints: IParameterDefinition = {
    type: "NUMBER",
    defaultValue: 25,
};

const stringDefinitionWithConstraints: IParameterDefinition = {
    type: "STRING",
    defaultValue: "Actual",
    constraints: { minLength: 1, maxLength: 20 },
};

const stringDefinitionWithoutConstraints: IParameterDefinition = {
    type: "STRING",
    defaultValue: "Actual",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: "8px 0" }}>{title}</h4>
            <div>{children}</div>
        </div>
    );
}

function ParameterControlExamples() {
    return (
        <IntlWrapper>
            <div className="screenshot-target" style={{ padding: 16, display: "flex", gap: 32 }}>
                <div>
                    <h3>ParameterControlButton</h3>
                    <Section title="Inactive (current value)">
                        <ParameterControlButton
                            name="Threshold"
                            definition={numberDefinitionWithoutConstraints}
                            value={25}
                            isActive={false}
                            isDraggable
                            onClick={() => {}}
                        />
                    </Section>
                    <Section title="Active (open)">
                        <ParameterControlButton
                            name="Threshold"
                            definition={numberDefinitionWithoutConstraints}
                            value={25}
                            isActive
                            isDraggable
                            onClick={() => {}}
                        />
                    </Section>
                    <Section title="Long parameter name">
                        <ParameterControlButton
                            name="A very long parameter name that should ellipsise"
                            definition={numberDefinitionWithoutConstraints}
                            value={1234}
                            isActive={false}
                            isDraggable
                            onClick={() => {}}
                        />
                    </Section>
                </div>
                <div>
                    <h3>ParameterControl — number</h3>
                    <Section title="value === resetValue (Reset hidden)">
                        <ParameterControl
                            name="Threshold"
                            definition={numberDefinitionWithConstraints}
                            value={25}
                            resetValue={25}
                            mode="commit"
                            onCommit={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                    <Section title="value !== resetValue (Reset shown)">
                        <ParameterControl
                            name="Threshold"
                            definition={numberDefinitionWithConstraints}
                            value={50}
                            resetValue={25}
                            mode="commit"
                            onCommit={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                    <Section title="No resetValue (Reset hidden)">
                        <ParameterControl
                            name="Threshold"
                            definition={numberDefinitionWithConstraints}
                            value={25}
                            mode="commit"
                            onCommit={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                    <Section title="No constraints">
                        <ParameterControl
                            name="Threshold"
                            definition={numberDefinitionWithoutConstraints}
                            value={42}
                            resetValue={25}
                            mode="commit"
                            onCommit={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                    <Section title="Staged mode (Close-only footer)">
                        <ParameterControl
                            name="Threshold"
                            definition={numberDefinitionWithConstraints}
                            value={50}
                            resetValue={25}
                            mode="staged"
                            onStage={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                </div>
                <div>
                    <h3>ParameterControl — string</h3>
                    <Section title="value === resetValue (Reset hidden)">
                        <ParameterControl
                            name="Scenario"
                            definition={stringDefinitionWithConstraints}
                            value="Actual"
                            resetValue="Actual"
                            mode="commit"
                            onCommit={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                    <Section title="value !== resetValue (Reset shown)">
                        <ParameterControl
                            name="Scenario"
                            definition={stringDefinitionWithConstraints}
                            value="Budget"
                            resetValue="Actual"
                            mode="commit"
                            onCommit={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                    <Section title="No constraints">
                        <ParameterControl
                            name="Scenario"
                            definition={stringDefinitionWithoutConstraints}
                            value="Budget"
                            resetValue="Actual"
                            mode="commit"
                            onCommit={() => {}}
                            onClose={() => {}}
                        />
                    </Section>
                </div>
            </div>
        </IntlWrapper>
    );
}

export default {
    title: "12 UI Kit/ParameterControl",
};

export function FullFeatured() {
    return <ParameterControlExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured parameter chip",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<ParameterControlExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <ParameterControlExamples />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
