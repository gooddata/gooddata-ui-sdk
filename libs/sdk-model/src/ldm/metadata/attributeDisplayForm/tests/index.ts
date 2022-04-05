// (C) 2019-2020 GoodData Corporation
import { idRef } from "../../../../objRef/factory";
import {
    attributeDisplayFormRef,
    attributeDisplayFormTitle,
    attributeDisplayFormAttributeRef,
    IAttributeDisplayFormMetadataObject,
} from "../index";

describe("attribute display form", () => {
    const _attributeDisplayFormTitle = "Account";
    const _attributeDisplayFormRef = idRef("label.account.account");
    const _attributeDisplayFormAttributeRef = idRef("attr.account.account");

    const attributeDisplayForm: IAttributeDisplayFormMetadataObject = {
        type: "displayForm",
        description: "test display form",
        unlisted: false,
        deprecated: false,
        production: false,
        id: _attributeDisplayFormRef.identifier,
        uri: "/uri",
        ref: _attributeDisplayFormRef,
        title: _attributeDisplayFormTitle,
        attribute: _attributeDisplayFormAttributeRef,
    };

    describe("attributeDisplayFormRef", () => {
        it("should return ref", () => {
            expect(attributeDisplayFormRef(attributeDisplayForm)).toEqual(_attributeDisplayFormRef);
        });

        it("should fail if attribute display form is null", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            expect(() => attributeDisplayFormRef(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            expect(() => attributeDisplayFormRef(undefined)).toThrow();
        });
    });

    describe("attributeDisplayFormTitle", () => {
        it("should return title", () => {
            expect(attributeDisplayFormTitle(attributeDisplayForm)).toEqual(_attributeDisplayFormTitle);
        });

        it("should fail if attribute display form is null", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            expect(() => attributeDisplayFormTitle(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            expect(() => attributeDisplayFormTitle(undefined)).toThrow();
        });
    });

    describe("attributeDisplayFormAttributeRef", () => {
        it("should return attribute ref", () => {
            expect(attributeDisplayFormAttributeRef(attributeDisplayForm)).toEqual(
                _attributeDisplayFormAttributeRef,
            );
        });

        it("should fail if attribute display form is null", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            expect(() => attributeDisplayFormAttributeId(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-expect-error Testing possible inputs not allowed by types but possible if used from JavaScript
            expect(() => attributeDisplayFormAttributeId(undefined)).toThrow();
        });
    });
});
