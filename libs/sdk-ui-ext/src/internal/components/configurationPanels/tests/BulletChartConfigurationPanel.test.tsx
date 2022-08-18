// (C) 2020-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";
import { IBucket, IInsightDefinition } from "@gooddata/sdk-model";

import BulletChartConfigurationPanel from "../BulletChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";

import { attributeItemA1, attributeItemA2 } from "../../../tests/mocks/visualizationObjectMocks";
import { emptyInsight } from "../../../tests/mocks/testMocks";

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
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
        };

        it("should render configuration panel with enabled name sections", async () => {
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

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.getByLabelText("xaxis name")).toBeEnabled();

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeEnabled();
        });

        it("should render configuration panel with disabled name sections", async () => {
            const insight = emptyInsight;
            createComponent({
                ...defaultProps,
                insight,
            });

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.getByLabelText("xaxis name")).toBeDisabled();

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeDisabled();
        });

        it("should render configuration panel with enabled X axis name section and disabled Y axis name section", async () => {
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

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.getByLabelText("xaxis name")).toBeEnabled();

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeDisabled();
        });

        it("should not render name sections in configuration panel", async () => {
            createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: emptyInsight,
            });

            await userEvent.click(screen.getByText("X-Axis"));
            expect(screen.queryByLabelText("xaxis name")).not.toBeInTheDocument();
        });
    });

    describe("Y axis labels configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
        };

        it("should render labels configuration panel disabled if there is no attribute", async () => {
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

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis labels")).toBeDisabled();
        });

        it("should render labels configuration panel enabled if there is an attribute", async () => {
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

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis labels")).toBeEnabled();
        });
    });

    describe("Y axis name configuration", () => {
        const defaultProps: IConfigurationPanelContentProps = {
            isError: false,
            isLoading: false,
            locale: DefaultLocale,
            type: VisualizationTypes.BULLET,
            featureFlags: {
                enableAxisNameConfiguration: true,
            },
        };

        it("should render name configuration panel enabled if there is an attribute", async () => {
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

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeEnabled();
        });

        it("should render name configuration panel disabled if there are two attributes", async () => {
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

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeDisabled();
        });

        it("should render name configuration panel enabled if there are two attributes and feature flag 'enableAxisNameViewByTwoAttributes' is true", async () => {
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
                featureFlags: {
                    ...defaultProps.featureFlags,
                    enableAxisNameViewByTwoAttributes: true,
                },
                insight,
            });

            await userEvent.click(screen.getByText("Y-Axis"));
            expect(screen.getByLabelText("yaxis name")).toBeEnabled();
        });
    });
});
