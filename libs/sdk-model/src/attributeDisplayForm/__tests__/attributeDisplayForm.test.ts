// (C) 2019 GoodData Corporation
import {
    IAttributeDisplayForm,
    attributeDisplayFormId,
    attributeDisplayFormTitle,
    attributeDisplayFormAttributeId,
    attributeDisplayFormAttributeUri,
} from "..";

describe("attribute display form", () => {
    const idAttributeDisplayForm: IAttributeDisplayForm = {
        attribute: {
            identifier: "attr.account.account",
        },
        id: "label.account.account",
        title: "Account",
    };

    const uriAttributeDisplayForm: IAttributeDisplayForm = {
        attribute: {
            uri: "/some/attribute/uri",
        },
        id: "label.account.account",
        title: "Account",
    };

    describe("attributeDisplayFormId", () => {
        it("should return identifier", () => {
            expect(attributeDisplayFormId(idAttributeDisplayForm)).toEqual("label.account.account");
        });

        it("should fail if attribute display form is null", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormId(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormId(undefined)).toThrow();
        });
    });

    describe("attributeDisplayFormTitle", () => {
        it("should return title", () => {
            expect(attributeDisplayFormTitle(idAttributeDisplayForm)).toEqual("Account");
        });

        it("should fail if attribute display form is null", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormTitle(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormTitle(undefined)).toThrow();
        });
    });

    describe("attributeDisplayFormAttributeId", () => {
        it("should return id if attribute is specified using id", () => {
            expect(attributeDisplayFormAttributeId(idAttributeDisplayForm)).toEqual("attr.account.account");
        });

        it("should return undefined if attribute is specified using uri", () => {
            expect(attributeDisplayFormAttributeId(uriAttributeDisplayForm)).toBeUndefined();
        });

        it("should fail if attribute display form is null", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormAttributeId(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormAttributeId(undefined)).toThrow();
        });
    });

    describe("attributeDisplayFormAttributeUri", () => {
        it("should return uri if attribute is specified using uri", () => {
            expect(attributeDisplayFormAttributeUri(uriAttributeDisplayForm)).toEqual("/some/attribute/uri");
        });

        it("should return undefined if attribute is specified using id", () => {
            expect(attributeDisplayFormAttributeUri(idAttributeDisplayForm)).toBeUndefined();
        });

        it("should fail if attribute display form is null", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormAttributeUri(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormAttributeUri(undefined)).toThrow();
        });
    });
});
