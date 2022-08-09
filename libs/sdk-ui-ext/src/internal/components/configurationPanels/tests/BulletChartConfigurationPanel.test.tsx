// (C) 2020-2022 GoodData Corporation
import React from "react";
import { DefaultLocale, VisualizationTypes } from "@gooddata/sdk-ui";
import { IBucket, IInsightDefinition } from "@gooddata/sdk-model";

import BulletChartConfigurationPanel from "../BulletChartConfigurationPanel";
import { IConfigurationPanelContentProps } from "../ConfigurationPanelContent";

import { attributeItemA1, attributeItemA2 } from "../../../tests/mocks/visualizationObjectMocks";
import { emptyInsight } from "../../../tests/mocks/testMocks";
import { setupComponent } from "../../../tests/testHelper";

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
        return setupComponent(<BulletChartConfigurationPanel {...props} />);
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

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeEnabled();
        expect(getByLabelText("yaxis_section")).toBeEnabled();
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

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeDisabled();
        expect(getByLabelText("yaxis_section")).toBeDisabled();
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

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeDisabled();
        expect(getByLabelText("yaxis_section")).toBeDisabled();
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

        const { getByLabelText } = createComponent(props);

        expect(getByLabelText("xaxis_section")).toBeDisabled();
        expect(getByLabelText("yaxis_section")).toBeDisabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeEnabled();

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeEnabled();
        });

        it("should render configuration panel with disabled name sections", async () => {
            const insight = emptyInsight;
            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeDisabled();

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeDisabled();
        });

        it("should render configuration panel with enabled X axis name section and disabled Y axis name section", async () => {
            const insight = testInsight([
                {
                    localIdentifier: "measures",
                    items: [testMeasure],
                },
            ]);

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("X-Axis"));
            expect(getByLabelText("xaxis name")).toBeEnabled();

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeDisabled();
        });

        it("should not render name sections in configuration panel", async () => {
            const { queryByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                featureFlags: {
                    enableAxisNameConfiguration: false,
                },
                insight: emptyInsight,
            });

            await user.click(getByText("X-Axis"));
            expect(queryByLabelText("xaxis name")).not.toBeInTheDocument();
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
            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis labels")).toBeDisabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis labels")).toBeEnabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeEnabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                insight,
            });

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeDisabled();
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

            const { getByLabelText, getByText, user } = createComponent({
                ...defaultProps,
                featureFlags: {
                    ...defaultProps.featureFlags,
                    enableAxisNameViewByTwoAttributes: true,
                },
                insight,
            });

            await user.click(getByText("Y-Axis"));
            expect(getByLabelText("yaxis name")).toBeEnabled();
        });
    });
});
