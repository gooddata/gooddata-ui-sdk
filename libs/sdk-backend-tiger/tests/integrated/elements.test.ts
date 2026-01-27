// (C) 2022-2026 GoodData Corporation

import { omit } from "lodash-es";
import { beforeAll, describe, expect, it } from "vitest";

import {
    type IAttributeElement,
    attributeDisplayFormRef,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import { testBackend, testWorkspace } from "./backend.js";
import { Account, AccountId, Product } from "../../src/fixtures/full.js";
import { productName } from "../../src/fixtures/referenceObjects.js";

const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("tiger elements", () => {
    describe("forDisplayForm", () => {
        it("should load attribute elements for existing display form", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(AccountId))
                .withLimit(20)
                .query();

            expect(omit(result, "cacheId")).toMatchSnapshot();
        });
    });

    describe("forFilter", () => {
        const testAttributeElement = (productName as IAttributeElement[]).find(
            (el) => el.title === "Educationly",
        );

        const testAttributeElementUri = testAttributeElement!.uri!.replace(
            "referenceworkspace",
            testWorkspace(),
        );

        it("should load attribute filter elements for provided positive attribute filter", async () => {
            const attributeFilter = newPositiveAttributeFilter(Product.Name, {
                uris: [testAttributeElementUri],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(attributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should load attribute filter elements for provided negative attribute filter", async () => {
            const testAttributeRef = attributeDisplayFormRef(Product.Name);
            const attributeFilter = newNegativeAttributeFilter(testAttributeRef, {
                uris: [testAttributeElementUri],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(attributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should load no attribute filter elements for provided ALL attribute filter", async () => {
            const testAttributeRef = attributeDisplayFormRef(Product.Name);
            const allAttributeFilter = newNegativeAttributeFilter(testAttributeRef, {
                uris: [],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(allAttributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should return attribute filter elements for provided attribute filter with elements by value", async () => {
            const testAttributeRef = attributeDisplayFormRef(Product.Name);
            const attributeFilter = newNegativeAttributeFilter(testAttributeRef, {
                values: ["Educationly"],
            });
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forFilter(attributeFilter)
                .query();

            expect(result).toMatchSnapshot();
        });

        it("should return correct page for given displayForm", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(Account.Default))
                .withLimit(2)
                .query();
            const page = await result.goTo(3);
            expect(omit(page, "items", "cacheId")).toMatchSnapshot();
        });

        it("should return empty result for out-of-range page in initial request", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(Account.Default))
                .withLimit(100)
                .withOffset(5000)
                .query();

            expect(omit(result, "cacheId")).toMatchSnapshot();
        });

        it("should return empty result for out-of-range page with goTo", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(Account.Default))
                .withLimit(100)
                .query();

            const page = await result.goTo(100);
            expect(omit(page, "cacheId")).toMatchSnapshot();
        });

        it("should return empty result for out-of-range page with next", async () => {
            const result = await backend
                .workspace(testWorkspace())
                .attributes()
                .elements()
                .forDisplayForm(attributeDisplayFormRef(Account.Default))
                .withLimit(100)
                .withOffset(4840)
                .query();

            const page = await result.next();
            expect(omit(page, "cacheId")).toMatchSnapshot();
        });
    });
});
