// (C) 2019-2020 GoodData Corporation
import { idRef } from "../../../../objRef/factory";
import { newAttributeDisplayFormMetadataObject } from "../factory";
import {
    attributeDisplayFormRef,
    attributeDisplayFormTitle,
    attributeDisplayFormAttributeRef,
} from "../index";

describe("attribute display form", () => {
    const _attributeDisplayFormTitle = "Account";
    const _attributeDisplayFormRef = idRef("label.account.account");
    const _attributeDisplayFormAttributeRef = idRef("attr.account.account");

    const attributeDisplayForm = newAttributeDisplayFormMetadataObject(_attributeDisplayFormRef, (df) =>
        df.attribute(_attributeDisplayFormAttributeRef).title(_attributeDisplayFormTitle),
    );

    describe("attributeDisplayFormRef", () => {
        it("should return ref", () => {
            expect(attributeDisplayFormRef(attributeDisplayForm)).toEqual(_attributeDisplayFormRef);
        });

        it("should fail if attribute display form is null", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormRef(null)).toThrow();
        });

        it("should fail if attribute display form is undefined", () => {
            // @ts-ignore
            expect(() => attributeDisplayFormRef(undefined)).toThrow();
        });
    });

    describe("attributeDisplayFormTitle", () => {
        it("should return title", () => {
            expect(attributeDisplayFormTitle(attributeDisplayForm)).toEqual(_attributeDisplayFormTitle);
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

    describe("attributeDisplayFormAttributeRef", () => {
        it("should return attribute ref", () => {
            expect(attributeDisplayFormAttributeRef(attributeDisplayForm)).toEqual(
                _attributeDisplayFormAttributeRef,
            );
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
});
