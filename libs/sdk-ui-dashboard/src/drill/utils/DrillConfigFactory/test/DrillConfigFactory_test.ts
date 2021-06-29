// (C) 2019-2021 GoodData Corporation

import { IAvailableDrillTargetMeasure, IAvailableDrillTargets } from "@gooddata/sdk-ui";
import { uriRef, idRef, ObjRefInScope, isLocalIdRef } from "@gooddata/sdk-model";
import { IDrillToInsight, IDrillToDashboard, IDrillToAttributeUrl } from "@gooddata/sdk-backend-spi";

import { DrillConfigFactory } from "../DrillConfigFactory";
import { DrillToVisualizationItem } from "../DrillToVisualizationItem";
import { DrillToDashboardItem } from "../DrillToDashboardItem";
import { DrillToUrlItem } from "../DrillToUrlItem";
import {
    IDefinitionValidationData,
    IDrillConfigItem,
    DRILL_TARGET_TYPE,
    IDrillToUrl,
} from "../../../interfaces";
import {
    drillToCustomUrl,
    drillToAttributeUrl,
    drillToCustomUrlConfig,
    drillToAttributeUrlConfig,
    drillablePushData,
    drillablePushDataWithAttributes,
    departmentIdAttributeDisplayForm,
    departmentNameAttributeDisplayForm,
    countryAttributeDisplayForm,
    testDrillToInsight,
    testDrillToDashboard,
    testDrillToAttributeUrl,
    testDrillToCustomUrl,
} from "./mocks";

const drillToVisualization: IDrillToInsight = testDrillToInsight(
    "m1",
    uriRef("/gdc/md/mockproject/obj/my_visualization_a"),
);

const drillToDashboard: IDrillToDashboard = testDrillToDashboard("m1", idRef("dashboard-1"));

const pushData: IAvailableDrillTargetMeasure = {
    measure: {
        measureHeaderItem: {
            localIdentifier: "m1",
            name: "title",
            format: "##",
        },
    },
    attributes: [],
};

function localIdFrom(ref: ObjRefInScope): string | undefined {
    return isLocalIdRef(ref) ? ref.localIdentifier : undefined;
}

describe("DrillConfigFactory", () => {
    describe("Create", () => {
        it("create correct class for IDrillToVisualization data", () => {
            const result = DrillConfigFactory.Create(drillToVisualization);
            expect(result).toBeInstanceOf(DrillToVisualizationItem);
        });

        it("create correct class for IDrillToDashboard data", () => {
            const result = DrillConfigFactory.Create(drillToDashboard);
            expect(result).toBeInstanceOf(DrillToDashboardItem);
        });

        it("create correct class for IDrillToCustomUrl data", () => {
            const result = DrillConfigFactory.Create(drillToCustomUrl);
            expect(result).toBeInstanceOf(DrillToUrlItem);
        });

        it("create correct class for IDrillToAttributeUrl data", () => {
            const result = DrillConfigFactory.Create(drillToAttributeUrl);
            expect(result).toBeInstanceOf(DrillToUrlItem);
        });
    });
});

describe("DrillToVisualizationItem", () => {
    describe("getFromLocalIdentifier", () => {
        it("return correct local identifier", () => {
            const result = DrillConfigFactory.Create(drillToVisualization).getFromLocalIdentifier();
            expect(result).toEqual(localIdFrom(drillToVisualization.origin.measure));
        });
    });

    describe("getTargetIdentifier", () => {
        it("return correct target identifier", () => {
            const config = DrillConfigFactory.Create(drillToVisualization);
            const result = (config as DrillToVisualizationItem).getTargetRef();
            expect(result).toEqual(drillToVisualization.target);
        });
    });

    describe("createConfig", () => {
        it("create correct drill config", () => {
            const expectedResult: IDrillConfigItem = {
                complete: true,
                drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
                localIdentifier: "m1",
                title: "title",
                type: "measure",
                insightRef: uriRef("/gdc/md/mockproject/obj/my_visualization_a"),
                attributes: [],
            };

            const result = DrillConfigFactory.Create(drillToVisualization).createConfig({
                measures: [pushData],
            });
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isItemValid", () => {
        it("return true for valid item", () => {
            const data: IDefinitionValidationData = {
                dashboardsList: [],
                supportedDrillableItems: { measures: [pushData] },
            };

            const result = DrillConfigFactory.Create(drillToVisualization).isItemValid(data);
            expect(result).toBeTruthy();
        });

        it("return false for invalid item", () => {
            const data: IDefinitionValidationData = {
                dashboardsList: [],
                supportedDrillableItems: { measures: [] },
            };

            const result = DrillConfigFactory.Create(drillToVisualization).isItemValid(data);
            expect(result).toBeFalsy();
        });
    });
});

describe("DrillToDashboardItem", () => {
    describe("getFromLocalIdentifier", () => {
        it("return correct local identifier", () => {
            const result = DrillConfigFactory.Create(drillToDashboard).getFromLocalIdentifier();
            expect(result).toEqual(localIdFrom(drillToDashboard.origin.measure));
        });
    });

    describe("getTargetIdentifier", () => {
        it("return correct target identifier", () => {
            const config = DrillConfigFactory.Create(drillToDashboard);
            const result = (config as DrillToDashboardItem).getTargetRef();
            expect(result).toEqual(drillToDashboard.target);
        });
    });

    describe("createConfig", () => {
        it("create correct drill config", () => {
            const expectedResult: IDrillConfigItem = {
                complete: true,
                drillTargetType: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
                localIdentifier: "m1",
                title: "title",
                type: "measure",
                dashboard: idRef("dashboard-1"),
                attributes: [],
            };

            const result = DrillConfigFactory.Create(drillToDashboard).createConfig({ measures: [pushData] });
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isItemValid", () => {
        it("return true for valid item", () => {
            const data: IDefinitionValidationData = {
                dashboardsList: [
                    {
                        title: "title",
                        identifier: "dashboard-1",
                        ref: idRef("dashboard-1"),
                        uri: "",
                        description: "",
                        created: "",
                        updated: "",
                    },
                ],
                supportedDrillableItems: { measures: [pushData] },
            };

            const result = DrillConfigFactory.Create(drillToDashboard).isItemValid(data);
            expect(result).toBeTruthy();
        });

        it("return false for invalid item target dashboard id", () => {
            const data: IDefinitionValidationData = {
                dashboardsList: [
                    {
                        title: "title",
                        identifier: "someId",
                        ref: idRef("someId"),
                        uri: "",
                        description: "",
                        created: "",
                        updated: "",
                    },
                ],
                supportedDrillableItems: { measures: [pushData] },
            };

            const result = DrillConfigFactory.Create(drillToDashboard).isItemValid(data);
            expect(result).toBeFalsy();
        });

        it("return false for invalid item from measure id", () => {
            const data: IDefinitionValidationData = {
                dashboardsList: [
                    {
                        title: "title",
                        identifier: "someId",
                        ref: idRef("someId"),
                        uri: "",
                        description: "",
                        created: "",
                        updated: "",
                    },
                ],
                supportedDrillableItems: { measures: [] },
            };

            const result = DrillConfigFactory.Create(drillToDashboard).isItemValid(data);
            expect(result).toBeFalsy();
        });
    });
});

describe("DrillToUrlItem", () => {
    describe("getFromLocalIdentifier", () => {
        it("return correct local identifier for drillToCustomUrl", () => {
            const result = DrillConfigFactory.Create(drillToCustomUrl).getFromLocalIdentifier();
            expect(result).toEqual(localIdFrom(drillToCustomUrl.origin.measure));
        });

        it("return correct local identifier for drillToAttributeUrl", () => {
            const result = DrillConfigFactory.Create(drillToAttributeUrl).getFromLocalIdentifier();
            expect(result).toEqual(localIdFrom(drillToAttributeUrl.origin.measure));
        });
    });

    describe("createConfig", () => {
        it("create correct drillToCustomUrlConfig", () => {
            const result = DrillConfigFactory.Create(drillToCustomUrl).createConfig({
                measures: [drillablePushData],
            });
            expect(result).toEqual(drillToCustomUrlConfig);
        });

        it("create correct drillToAttributeUrlConfig", () => {
            const result = DrillConfigFactory.Create(drillToAttributeUrl).createConfig({
                measures: [drillablePushData],
            });
            expect(result).toEqual(drillToAttributeUrlConfig);
        });
    });

    describe("isItemValid", () => {
        const validationDataWithDisplayForms: IDefinitionValidationData = {
            dashboardsList: [],
            supportedDrillableItems: drillablePushDataWithAttributes,
            attributeDisplayForms: [
                countryAttributeDisplayForm,
                departmentIdAttributeDisplayForm,
                departmentNameAttributeDisplayForm,
            ],
        };

        it("should throw exception when unsupported drill config type is provided", () => {
            const config = DrillConfigFactory.Create({} as IDrillToUrl);
            const test = () => config.isItemValid(validationDataWithDisplayForms);
            expect(test).toThrow();
        });
        it("return true for valid item", () => {
            const config = DrillConfigFactory.Create({} as IDrillToUrl);
            const data: IDefinitionValidationData = {
                dashboardsList: [],
                supportedDrillableItems: { measures: [drillablePushData] },
            };
            const test = () => config.isItemValid(data);
            expect(test).toThrow();
        });

        describe("drilled measure is supported", () => {
            it("should return true when custom URL is set and measure is supported", () => {
                const result = DrillConfigFactory.Create(drillToCustomUrl).isItemValid(
                    validationDataWithDisplayForms,
                );
                expect(result).toBe(true);
            });

            it("should return true when attribute display forms are empty", () => {
                const result = DrillConfigFactory.Create(drillToCustomUrl).isItemValid({
                    dashboardsList: [],
                    supportedDrillableItems: drillablePushDataWithAttributes,
                });
                expect(result).toBe(true);
            });

            describe("drillToAttributeDisplayForm is supported", () => {
                it("should return false when attribute URL is set and insightAttributeDisplayForm is not supported", () => {
                    const result = DrillConfigFactory.Create(drillToAttributeUrl).isItemValid({
                        dashboardsList: [],
                        supportedDrillableItems: drillablePushDataWithAttributes,
                        attributeDisplayForms: [countryAttributeDisplayForm],
                    });
                    expect(result).toBe(false);
                });

                it("should return true when attribute URL is set and insightAttributeDisplayForm is supported", () => {
                    const result = DrillConfigFactory.Create(drillToAttributeUrl).isItemValid({
                        dashboardsList: [],
                        supportedDrillableItems: drillablePushDataWithAttributes,
                        attributeDisplayForms: [
                            departmentIdAttributeDisplayForm,
                            departmentNameAttributeDisplayForm,
                            countryAttributeDisplayForm,
                        ],
                    });
                    expect(result).toBe(true);
                });
            });

            describe("drillToAttributeDisplayForm is not supported", () => {
                it("should return false when attribute URL is set and insightAttributeDisplayForm is not supported", () => {
                    const result = DrillConfigFactory.Create(drillToAttributeUrl).isItemValid({
                        dashboardsList: [],
                        supportedDrillableItems: drillablePushDataWithAttributes,
                        attributeDisplayForms: [],
                    });
                    expect(result).toBe(false);
                });

                it("should return false when attribute URL is set and insightAttributeDisplayForm is supported", () => {
                    const result = DrillConfigFactory.Create(drillToAttributeUrl).isItemValid({
                        dashboardsList: [],
                        supportedDrillableItems: drillablePushDataWithAttributes,
                        attributeDisplayForms: [
                            departmentIdAttributeDisplayForm,
                            departmentNameAttributeDisplayForm,
                        ],
                    });
                    expect(result).toBe(false);
                });
            });

            describe("drillToAttributeDisplayForm is not of hyperlink type", () => {
                it("should return false when attribute URL is set and both display forms are supported", () => {
                    const drillToAttributeUrl: IDrillToAttributeUrl = testDrillToAttributeUrl(
                        "m1",
                        uriRef("/gdc/mockproject/obj/10"),
                        uriRef("/gdc/mockproject/obj/11"),
                    );
                    const result = DrillConfigFactory.Create(drillToAttributeUrl).isItemValid({
                        dashboardsList: [],
                        supportedDrillableItems: drillablePushDataWithAttributes,
                        attributeDisplayForms: [
                            departmentIdAttributeDisplayForm,
                            departmentNameAttributeDisplayForm,
                        ],
                    });
                    expect(result).toBe(false);
                });
            });
        });

        describe("drilled measure is not supported", () => {
            const supportedDrillableItemsM2: IAvailableDrillTargets = {
                measures: [
                    {
                        measure: {
                            measureHeaderItem: {
                                localIdentifier: "m2",
                                name: "My measure",
                                format: "##,#",
                            },
                        },
                        attributes: [
                            {
                                attributeHeader: {
                                    formOf: {
                                        uri: "/gdc/mockproject/obj/10",
                                        ref: uriRef("/gdc/mockproject/obj/10"),
                                        identifier: "10",
                                        name: "Display form",
                                    },
                                    uri: "/gdc/mockproject/obj/1",
                                    ref: uriRef("/gdc/mockproject/obj/1"),
                                    identifier: "1",
                                    localIdentifier: "a1",
                                    name: "My attribute",
                                },
                            },
                        ],
                    },
                ],
            };

            it("should return false when custom URL is set", () => {
                const result = DrillConfigFactory.Create(drillToCustomUrl).isItemValid({
                    dashboardsList: [],
                    supportedDrillableItems: supportedDrillableItemsM2,
                    attributeDisplayForms: [countryAttributeDisplayForm],
                });
                expect(result).toBe(false);
            });

            it("should return false when attribute display forms are empty", () => {
                const result = new DrillToUrlItem(drillToAttributeUrl).isItemValid({
                    dashboardsList: [],
                    supportedDrillableItems: supportedDrillableItemsM2,
                });
                expect(result).toBe(false);
            });

            it("should return false when attribute URL is set", () => {
                const result = new DrillToUrlItem(drillToAttributeUrl).isItemValid({
                    dashboardsList: [],
                    supportedDrillableItems: supportedDrillableItemsM2,
                    attributeDisplayForms: [
                        departmentIdAttributeDisplayForm,
                        departmentNameAttributeDisplayForm,
                        countryAttributeDisplayForm,
                    ],
                });
                expect(result).toBe(false);
            });
        });
    });

    describe("isCustomUrlValid", () => {
        const drillToCustomParametrizedUrl = testDrillToCustomUrl(
            "m1",
            "https://gooddata.com?a={attribute_title(id10)}&b={attribute_title(id11)}&c={attribute_title(id20)}",
        );

        it("should return true when attribute URL is set", () => {
            const result = new DrillToUrlItem(drillToAttributeUrl).isCustomUrlValid({
                dashboardsList: [],
                supportedDrillableItems: drillablePushDataWithAttributes,
            });
            expect(result).toBe(true);
        });

        it("should return true when every custom URL parameter is supported", () => {
            const result = new DrillToUrlItem(drillToCustomParametrizedUrl).isCustomUrlValid({
                dashboardsList: [],
                supportedDrillableItems: drillablePushDataWithAttributes,
                attributeDisplayForms: [
                    departmentIdAttributeDisplayForm,
                    departmentNameAttributeDisplayForm,
                    countryAttributeDisplayForm,
                ],
            });
            expect(result).toBe(true);
        });

        it("should return false when some custom URL parameter is not supported", () => {
            const result = new DrillToUrlItem(drillToCustomParametrizedUrl).isCustomUrlValid({
                dashboardsList: [],
                supportedDrillableItems: drillablePushDataWithAttributes,
                attributeDisplayForms: [countryAttributeDisplayForm],
            });
            expect(result).toBe(false);
        });
    });
});
