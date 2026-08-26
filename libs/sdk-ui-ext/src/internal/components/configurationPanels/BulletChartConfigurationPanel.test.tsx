// (C) 2020-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IBucket, type IInsightDefinition } from "@gooddata/sdk-model";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";

import { emptyInsight } from "../../tests/testMocks.test.helpers.js";
import { attributeItemA1, attributeItemA2 } from "../../tests/visualizationObjectMocks.test.helpers.js";

import { BulletChartConfigurationPanel } from "./BulletChartConfigurationPanel.js";
import { type IConfigurationPanelContentProps } from "./ConfigurationPanelContent.js";

// The section headers only handle onClick, so plain fireEvent is enough here; userEvent would add a
// full pointer/mouse sequence plus a real setTimeout between each event for no extra coverage.
function expandSection(title: string): void {
    fireEvent.click(screen.getByText(title));
}

function testInsight(buckets: IBucket[]): IInsightDefinition {
    return {
        insight: {
            visualizationUrl: "local:bullet",
            title: "test insight",
            filters: [],
            properties: {},
            sorts: [],
            buckets,
        },
    };
}

describe("BulletChartConfigurationPanel", () => {
    function createComponent(props: IConfigurationPanelContentProps) {
        return render(<BulletChartConfigurationPanel {...props} />);
    }

    const testMeasure = {
        measure: {
            localIdentifier: "measure1",
            definition: {
                measureDefinition: {
                    item: {
                        uri: "/gdc/md/projectId/obj/9211",
                    },
                },
            },
        },
    };

    it("should render configuration panel with enabled controls", () => {
        const insight: IInsightDefinition = testInsight([
            {
                items: [
                    {
                        measure: {
                            definition: { measureDefinition: { item: { uri: "measure" } } },
                            localIdentifier: "measureId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeEnabled();
        expect(screen.getByLabelText("yaxis_section")).toBeEnabled();
    });

    it("should render configuration panel with disabled controls when it has no measures", () => {
        const insight = testInsight([
            {
                items: [
                    {
                        attribute: {
                            displayForm: { uri: "df" },
                            localIdentifier: "attributeId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeDisabled();
        expect(screen.getByLabelText("yaxis_section")).toBeDisabled();
    });

    it("should render configuration panel with disabled controls when it is in error state", () => {
        const insight = testInsight([
            {
                items: [
                    {
                        measure: {
                            definition: { measureDefinition: { item: { uri: "measure" } } },
                            localIdentifier: "measureId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: true,
            isLoading: false,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeDisabled();
        expect(screen.getByLabelText("yaxis_section")).toBeDisabled();
    });

    it("should render configuration panel with disabled controls when it is loading", () => {
        const insight = testInsight([
            {
                items: [
                    {
                        measure: {
                            definition: { measureDefinition: { item: { uri: "measure" } } },
                            localIdentifier: "measureId",
                        },
                    },
                ],
            },
        ]);

        const props: IConfigurationPanelContentProps = {
            insight,
            isError: false,
            isLoading: true,
            locale: DefaultLocale,
        };

        createComponent(props);

        expect(screen.getByLabelText("xaxis_section")).toBeDisabled();
        expect(screen.getByLabelText("yaxis_section")).toBeDisabled();
    });

    describe("axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
        };

        it("should render configuration panel with enabled name sections", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1],
                },
            ]);

            createComponent({
                ...defaultProps,
                insight,
            });

            expandSection("X-Axis");
            expect(screen.getByLabelText("xaxis name")).toBeEnabled();

            expandSection("Y-Axis");
            expect(screen.getByLabelText("yaxis name")).toBeEnabled();
        });

        it("should render configuration panel with disabled name sections", () => {
            const insight = emptyInsight;
            createComponent({
                ...defaultProps,
                insight,
            });

            expandSection("X-Axis");
            expect(screen.getByLabelText("xaxis name")).toBeDisabled();

            expandSection("Y-Axis");
            expect(screen.getByLabelText("yaxis name")).toBeDisabled();
        });

        it("should render configuration panel with enabled X axis name section and disabled Y axis name section", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
            ]);

            createComponent({
                ...defaultProps,
                insight,
            });

            expandSection("X-Axis");
            expect(screen.getByLabelText("xaxis name")).toBeEnabled();

            expandSection("Y-Axis");
            expect(screen.getByLabelText("yaxis name")).toBeDisabled();
        });
    });

    describe("Y axis labels configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
        };

        it("should render labels configuration panel disabled if there is no attribute", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [],
                },
            ]);
            createComponent({
                ...defaultProps,
                insight,
            });

            expandSection("Y-Axis");
            expect(screen.getByLabelText("yaxis labels")).toBeDisabled();
        });

        it("should render labels configuration panel enabled if there is an attribute", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1],
                },
            ]);

            createComponent({
                ...defaultProps,
                insight,
            });

            expandSection("Y-Axis");
            expect(screen.getByLabelText("yaxis labels")).toBeEnabled();
        });
    });

    describe("Y axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
        };

        it("should render name configuration panel enabled if there is an attribute", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1],
                },
            ]);

            createComponent({
                ...defaultProps,
                insight,
            });

            expandSection("Y-Axis");
            expect(screen.getByLabelText("yaxis name")).toBeEnabled();
        });

        it("should render name configuration panel enabled if there are two attributes", () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
                {
                    localIdentifier: "view",
                    items: [attributeItemA1, attributeItemA2],
                },
            ]);

            createComponent({
                ...defaultProps,
                insight,
            });

            expandSection("Y-Axis");
            expect(screen.getByLabelText("yaxis name")).toBeEnabled();
        });
    });
});
