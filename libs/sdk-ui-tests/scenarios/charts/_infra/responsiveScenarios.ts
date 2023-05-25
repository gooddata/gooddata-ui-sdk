// (C) 2007-2019 GoodData Corporation
import { ScenarioCustomizer, scenariosFor, UnboundVisProps, VisProps } from "../../../src/index.js";

export interface IResponsiveSize {
    label?: string;
    width: number;
    height: number;
}

export function responsiveScenarios<T extends VisProps>(
    chart: string,
    groupNames: string[],
    component: React.ComponentType<T>,
    baseProps: UnboundVisProps<T>,
    sizes: Array<IResponsiveSize>,
    generateInsight: boolean,
    customizer?: ScenarioCustomizer<T>,
) {
    const tags = generateInsight ? [] : ["no-plug-viz-tests"];

    const usedLabels: Record<string, string> = {};

    return sizes.map((size) => {
        const label = size.label
            ? `${size.width}x${size.height} - ${size.label}`
            : `${size.width}x${size.height}`;

        if (usedLabels[label]) {
            console.error("Label of story has to be unique", "Label", label);
        }

        usedLabels[label] = label;

        const scenario = scenariosFor<T>(chart, component)
            .withGroupNames(...groupNames)
            .withVisualTestConfig({
                groupUnder: label,
                screenshotSize: { width: size.width, height: size.height },
            })
            .withDefaultTags("vis-config-only", "mock-no-scenario-meta", ...tags);

        if (customizer) {
            scenario.addScenarios(label, baseProps, customizer);
        } else {
            scenario.addScenario(label, baseProps);
        }

        return scenario;
    });
}
