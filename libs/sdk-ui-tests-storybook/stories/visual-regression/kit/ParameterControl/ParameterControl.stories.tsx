// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";
import { ParameterControlButton, ParameterControlDropdown } from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

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
                            value={25}
                            isActive={false}
                            isDraggable
                            onClick={() => {}}
                        />
                    </Section>
                    <Section title="Active (open)">
                        <ParameterControlButton
                            name="Threshold"
                            value={25}
                            isActive
                            isDraggable
                            onClick={() => {}}
                        />
                    </Section>
                    <Section title="Long parameter name">
                        <ParameterControlButton
                            name="A very long parameter name that should ellipsise"
                            value={1234}
                            isActive={false}
                            isDraggable
                            onClick={() => {}}
                        />
                    </Section>
                </div>
                <div>
                    <h3>ParameterControlDropdown</h3>
                    <Section title="value === resetValue (Reset hidden)">
                        <ParameterControlDropdown
                            name="Threshold"
                            value={25}
                            resetValue={25}
                            constraints={{ min: 0, max: 100 }}
                            onApply={() => {}}
                            onCancel={() => {}}
                        />
                    </Section>
                    <Section title="value !== resetValue (Reset shown)">
                        <ParameterControlDropdown
                            name="Threshold"
                            value={50}
                            resetValue={25}
                            constraints={{ min: 0, max: 100 }}
                            onApply={() => {}}
                            onCancel={() => {}}
                        />
                    </Section>
                    <Section title="No resetValue (Reset hidden)">
                        <ParameterControlDropdown
                            name="Threshold"
                            value={25}
                            constraints={{ min: 0, max: 100 }}
                            onApply={() => {}}
                            onCancel={() => {}}
                        />
                    </Section>
                    <Section title="No constraints">
                        <ParameterControlDropdown
                            name="Threshold"
                            value={42}
                            resetValue={25}
                            onApply={() => {}}
                            onCancel={() => {}}
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
