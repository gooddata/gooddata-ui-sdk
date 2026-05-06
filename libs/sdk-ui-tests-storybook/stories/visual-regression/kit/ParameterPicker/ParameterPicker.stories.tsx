// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IParameterMetadataObject, idRef, objRefToString } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { ParameterPicker } from "@gooddata/sdk-ui-kit";
import "@gooddata/sdk-ui-kit/styles/css/main.css";
import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const param = (id: string, title: string, tags: string[] = []): IParameterMetadataObject =>
    ({
        type: "parameter",
        id,
        uri: `/parameters/${id}`,
        ref: idRef(id, "parameter"),
        title,
        description: "",
        tags,
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "NUMBER", defaultValue: 0 },
    }) as IParameterMetadataObject;

const sampleParameters: ReadonlyArray<IParameterMetadataObject> = [
    param("revenue-target", "Revenue target", ["Finance"]),
    param("growth-rate", "Growth rate", ["Finance", "Forecasting"]),
    param("forecast-horizon", "Forecast horizon", ["Forecasting"]),
    param("threshold", "Threshold"),
    param("tolerance", "Tolerance"),
];

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: "8px 0" }}>{title}</h4>
            <div>{children}</div>
        </div>
    );
}

function ParameterPickerExamples() {
    return (
        <IntlWrapper>
            <div className="screenshot-target" style={{ display: "flex", gap: 24, padding: 16 }}>
                <div>
                    <Section title="Empty workspace">
                        <ParameterPicker
                            parameters={[]}
                            excludedKeys={new Set()}
                            isLoading={false}
                            maxListHeight={300}
                            onAdd={() => {}}
                            onCancel={() => {}}
                        />
                    </Section>
                </div>
                <div>
                    <Section title="Tagged + untagged groups">
                        <ParameterPicker
                            parameters={sampleParameters}
                            excludedKeys={new Set()}
                            isLoading={false}
                            maxListHeight={300}
                            onAdd={() => {}}
                            onCancel={() => {}}
                        />
                    </Section>
                </div>
                <div>
                    <Section title="One excluded (already filtered)">
                        <ParameterPicker
                            parameters={sampleParameters}
                            excludedKeys={new Set([objRefToString(sampleParameters[0].ref)])}
                            isLoading={false}
                            maxListHeight={300}
                            onAdd={() => {}}
                            onCancel={() => {}}
                        />
                    </Section>
                    <Section title="All excluded">
                        <ParameterPicker
                            parameters={sampleParameters}
                            excludedKeys={new Set(sampleParameters.map((p) => objRefToString(p.ref)))}
                            isLoading={false}
                            maxListHeight={300}
                            onAdd={() => {}}
                            onCancel={() => {}}
                        />
                    </Section>
                </div>
            </div>
        </IntlWrapper>
    );
}

export default {
    title: "12 UI Kit/ParameterPicker",
};

export function FullFeatured() {
    return <ParameterPickerExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured parameter picker",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<ParameterPickerExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export function Interface() {
    return <ParameterPickerExamples />;
}
Interface.parameters = { kind: "interface" } satisfies IStoryParameters;
