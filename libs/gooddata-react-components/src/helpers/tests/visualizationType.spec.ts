// (C) 2007-2018 GoodData Corporation
import { VisualizationTypes } from "../../constants/visualizationTypes";
import {
    getVisualizationTypeFromVisualizationClass,
    getVisualizationTypeFromUrl,
} from "../visualizationType";
import { clearSdkCache } from "../sdkCache";

describe("getVisualizationTypeFromUrl", () => {
    it("should be undefined if uri leads to external src", () => {
        expect(getVisualizationTypeFromUrl("loremipsum.com/CDN/index.js")).toBeNull();
    });
    it("should be BAR if uri is local:bar", () => {
        expect(getVisualizationTypeFromUrl("local:bar")).toBe(VisualizationTypes.BAR);
    });
    it("should be COLUMN if uri is local:column", () => {
        expect(getVisualizationTypeFromUrl("local:column")).toBe(VisualizationTypes.COLUMN);
    });
    it("should be LINE if uri is local:line", () => {
        expect(getVisualizationTypeFromUrl("local:line")).toBe(VisualizationTypes.LINE);
    });
    it("should be TABLE if uri is local:TABLE", () => {
        expect(getVisualizationTypeFromUrl("local:table")).toBe(VisualizationTypes.TABLE);
    });
    it("should be PIE if uri is local:pie", () => {
        expect(getVisualizationTypeFromUrl("local:pie")).toBe(VisualizationTypes.PIE);
    });
    it("should handle different casing", () => {
        expect(getVisualizationTypeFromUrl("local:Bar")).toBe(VisualizationTypes.BAR);
        expect(getVisualizationTypeFromUrl("local:BAR")).toBe(VisualizationTypes.BAR);
        expect(getVisualizationTypeFromUrl("local:bAR")).toBe(VisualizationTypes.BAR);
    });
});

describe("getVisualizationTypeFromVisualizationClass", () => {
    const pieVisClass = {
        content: {
            url: "local:pie",
            icon: "local:pie",
            iconSelected: "local:pie_selected",
            title: "Visualization",
            checksum: "local:pie",
        },
        meta: {
            title: "",
        },
    };

    afterEach(() => {
        clearSdkCache();
    });

    it("should return correct type when url is local:pie", () => {
        const getVisualizationTypeFromUrlMock = jest.fn();
        getVisualizationTypeFromVisualizationClass(pieVisClass, getVisualizationTypeFromUrlMock);
        expect(getVisualizationTypeFromUrlMock).toHaveBeenCalledWith("local:pie");
    });
    it("should get url from vis. class and pass it to getVisualizationTypeFromUrl ", () => {
        const getVisualizationTypeFromUrlMock = jest.fn();
        getVisualizationTypeFromVisualizationClass(pieVisClass, getVisualizationTypeFromUrlMock);
        expect(getVisualizationTypeFromUrlMock).toHaveBeenCalledWith("local:pie");
    });
});
