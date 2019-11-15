// (C) 2007-2018 GoodData Corporation
import CatalogHelper from "../CatalogHelper";

describe("CatalogHelper", () => {
    const catalogJson = {
        measures: {
            Revenue: { identifier: "123", tags: "abc" },
        },
        attributes: {
            Region: {
                identifier: "attr.country.region",
                tags: "attr-tag",
                defaultDisplayForm: { identifier: "label.country.region", tags: "cd" },
                displayForms: {
                    Region: { identifier: "label.country.region", tags: "cd" },
                },
            },
        },
        visualizations: {
            "PVA Pie chart": { identifier: "abd9M0gPgpVt", tags: "efgh" },
        },
        dateDataSets: {
            Date: {
                identifier: "date.dataset.dt",
                tags: "datedt-tags",
                attributes: {
                    Quarter: {
                        identifier: "date.quarter.in.year",
                        tags: "dateattr-q-tags",
                        defaultDisplayForm: { identifier: "date.aam81lMifn6q", tags: "long,quarter" },
                        displayForms: {
                            QQQQ: { identifier: "date.aam81lMifn6q", tags: "long,quarter" },
                            QQ: { identifier: "date.aaqf5qq", tags: "short,quarter" },
                        },
                    },
                },
            },
        },
    };

    it("should return a measure", () => {
        const C = new CatalogHelper(catalogJson);

        expect(C.measure("Revenue")).toBe("123");
        expect(C.measure("non-existent")).toBeUndefined();

        expect(C.measureTags("Revenue")).toBe("abc");
        expect(C.measureTags("non-existent")).toBeUndefined();
    });

    it("should return a visualization", () => {
        const C = new CatalogHelper(catalogJson);

        expect(C.visualization("PVA Pie chart")).toBe("abd9M0gPgpVt");
        expect(C.visualization("non-existent")).toBeUndefined();
        expect(C.visualizationTags("PVA Pie chart")).toBe("efgh");
        expect(C.visualizationTags("non-existent")).toBeUndefined();
    });

    it("should handle attributes", () => {
        const C = new CatalogHelper(catalogJson);

        expect(C.attribute("Region")).toBe(C.attributes.Region.identifier);
        expect(C.attribute("non-existent")).toBeUndefined();
        expect(C.attributeTags("Region")).toBe(C.attributes.Region.tags);
        expect(C.attributeTags("non-existent")).toBeUndefined();

        const defaultDisplayForm = C.attributes.Region.defaultDisplayForm;
        expect(C.attributeDisplayForm("Region")).toBe(defaultDisplayForm.identifier);
        expect(C.attributeDisplayForm("non-existent")).toBeUndefined();
        expect(C.attributeDisplayFormTags("Region")).toBe(defaultDisplayForm.tags);
        expect(C.attributeDisplayFormTags("non-existent")).toBeUndefined();

        const specificDisplayForm = C.attributes.Region.displayForms.Region;
        expect(C.attributeDisplayForm("Region", "Region")).toBe(specificDisplayForm.identifier);
        expect(C.attributeDisplayForm("Region", "non-existent")).toBeUndefined();
        expect(C.attributeDisplayFormTags("Region", "Region")).toBe(specificDisplayForm.tags);
        expect(C.attributeDisplayFormTags("Region", "non-existent")).toBeUndefined();
    });

    it("should handle date data sets", () => {
        const C = new CatalogHelper(catalogJson);

        expect(C.dateDataSet("Date")).toBe(C.dateDataSets.Date.identifier);
        expect(C.dateDataSet("non-existent")).toBeUndefined();

        expect(C.dateDataSetTags("Date")).toBe(C.dateDataSets.Date.tags);
        expect(C.dateDataSetTags("non-existent")).toBeUndefined();

        const attr = C.dateDataSets.Date.attributes.Quarter;
        expect(C.dateDataSetAttribute("non-existent", "x")).toBeUndefined();
        expect(C.dateDataSetAttribute("Date", "Quarter")).toBe(attr.identifier);
        expect(C.dateDataSetAttribute("Date", "non-existent")).toBeUndefined();
        expect(C.dateDataSetAttributeTags("non-existent", "x")).toBeUndefined();
        expect(C.dateDataSetAttributeTags("Date", "Quarter")).toBe(attr.tags);
        expect(C.dateDataSetAttributeTags("Date", "non-existent")).toBeUndefined();

        expect(C.dateDataSetDisplayForm("non-existent", "x")).toBeUndefined();
        expect(C.dateDataSetDisplayForm("Date", "Quarter")).toBe(attr.defaultDisplayForm.identifier);
        expect(C.dateDataSetDisplayForm("Date", "non-existent")).toBeUndefined();
        expect(C.dateDataSetDisplayFormTags("non-existent", "x")).toBeUndefined();
        expect(C.dateDataSetDisplayFormTags("Date", "Quarter")).toBe(attr.defaultDisplayForm.tags);
        expect(C.dateDataSetDisplayFormTags("Date", "non-existent")).toBeUndefined();

        expect(C.dateDataSetDisplayForm("Date", "non-existent", "x")).toBeUndefined();
        expect(C.dateDataSetDisplayForm("Date", "Quarter", "QQQQ")).toBe(attr.displayForms.QQQQ.identifier);
        expect(C.dateDataSetDisplayForm("Date", "Quarter", "non-existent")).toBeUndefined();
        expect(C.dateDataSetDisplayFormTags("Date", "non-existent", "x")).toBeUndefined();
        expect(C.dateDataSetDisplayFormTags("Date", "Quarter", "QQQQ")).toBe(attr.displayForms.QQQQ.tags);
        expect(C.dateDataSetDisplayFormTags("Date", "Quarter", "non-existent")).toBeUndefined();
    });
});
