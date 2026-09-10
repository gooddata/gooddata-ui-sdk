// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogComputedAttribute,
    type IComputedAttributeMetadataObject,
    catalogComputedAttributeAsCatalogAttribute,
    computedAttributeAsAttributeMetadataObject,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";

import { newDisplayFormMap } from "../metadata/objRefMap.js";

import { loadComputedAttributesByRefs, partitionComputedAttributeRefs } from "./computedAttributes.js";
import { createDisplayFormMap } from "./displayFormMap.js";

function testComputedAttribute(id: string): IComputedAttributeMetadataObject {
    const ref = idRef(id, "computedAttribute");
    const displayForm: IAttributeDisplayFormMetadataObject = {
        type: "displayForm",
        ref,
        id,
        uri: `/computedAttribute/${id}`,
        title: `Computed ${id}`,
        description: "",
        attribute: ref,
        production: true,
        deprecated: false,
        unlisted: false,
        isDefault: true,
        isPrimary: true,
    };

    return {
        type: "computedAttribute",
        ref,
        id,
        uri: `/computedAttribute/${id}`,
        title: `Computed ${id}`,
        description: "",
        expression: "CASE WHEN 1 THEN 1 END",
        production: true,
        deprecated: false,
        unlisted: false,
        displayForms: [displayForm],
    };
}

function testCatalogComputedAttribute(id: string): ICatalogComputedAttribute {
    const computedAttribute = testComputedAttribute(id);

    return {
        type: "computedAttribute",
        computedAttribute,
        defaultDisplayForm: computedAttribute.displayForms[0]!,
        displayForms: computedAttribute.displayForms,
        groups: [],
    };
}

describe("computedAttributeAsAttributeMetadataObject", () => {
    it("should rewrite only the type discriminator and keep the honest ref", () => {
        const computedAttribute = testComputedAttribute("ca_1");
        const adapted = computedAttributeAsAttributeMetadataObject(computedAttribute);

        expect(adapted.type).toBe("attribute");
        expect(adapted.ref).toEqual(idRef("ca_1", "computedAttribute"));
        expect(adapted.displayForms).toBe(computedAttribute.displayForms);
    });
});

describe("catalogComputedAttributeAsCatalogAttribute", () => {
    it("should adapt to the catalog attribute shape with honest refs", () => {
        const item = testCatalogComputedAttribute("ca_1");
        const adapted = catalogComputedAttributeAsCatalogAttribute(item);

        expect(adapted.type).toBe("attribute");
        expect(adapted.attribute.ref).toEqual(idRef("ca_1", "computedAttribute"));
        expect(adapted.defaultDisplayForm).toBe(item.defaultDisplayForm);
        expect(adapted.geoPinDisplayForms).toEqual([]);
    });
});

describe("partitionComputedAttributeRefs", () => {
    it("should split computed attribute refs from the rest", () => {
        const computed = idRef("ca_1", "computedAttribute");
        const label = idRef("label_1", "displayForm");
        const untyped = idRef("label_2");
        const uri = uriRef("/gdc/md/label_3");

        expect(partitionComputedAttributeRefs([computed, label, untyped, uri])).toEqual({
            computedAttributeRefs: [computed],
            otherRefs: [label, untyped, uri],
        });
    });
});

describe("loadComputedAttributesByRefs", () => {
    function backendMock(getComputedAttribute: (ref: unknown) => Promise<unknown>): IAnalyticalBackend {
        return {
            workspace: () => ({
                computedAttributes: () => ({
                    getComputedAttribute,
                }),
            }),
        } as unknown as IAnalyticalBackend;
    }

    it("should not touch the backend when there is nothing to load", async () => {
        const getComputedAttribute = vi.fn();

        const result = await loadComputedAttributesByRefs(backendMock(getComputedAttribute), "ws", []);

        expect(result).toEqual([]);
        expect(getComputedAttribute).not.toHaveBeenCalled();
    });

    it("should silently drop refs whose computed attribute is missing or forbidden", async () => {
        const resolvable = testComputedAttribute("ca_1");
        const getComputedAttribute = vi.fn((ref: unknown) => {
            const id = (ref as { identifier: string }).identifier;
            if (id === "ca_1") {
                return Promise.resolve(resolvable);
            }
            return Promise.reject(
                new UnexpectedResponseError("not found", id === "ca_deleted" ? 404 : 403, {}),
            );
        });

        const result = await loadComputedAttributesByRefs(backendMock(getComputedAttribute), "ws", [
            idRef("ca_1", "computedAttribute"),
            idRef("ca_deleted", "computedAttribute"),
            idRef("ca_forbidden", "computedAttribute"),
        ]);

        expect(result).toEqual([resolvable]);
    });

    it("should rethrow unexpected resolution failures instead of dropping them", async () => {
        const getComputedAttribute = vi.fn((ref: unknown) =>
            (ref as { identifier: string }).identifier === "ca_1"
                ? Promise.resolve(testComputedAttribute("ca_1"))
                : Promise.reject(new UnexpectedResponseError("server error", 500, {})),
        );

        await expect(
            loadComputedAttributesByRefs(backendMock(getComputedAttribute), "ws", [
                idRef("ca_1", "computedAttribute"),
                idRef("ca_broken", "computedAttribute"),
            ]),
        ).rejects.toThrow("server error");
    });
});

describe("display form maps with computed attributes", () => {
    it("should resolve a computed attribute display form under strict type checking", () => {
        const item = testCatalogComputedAttribute("ca_1");
        const map = createDisplayFormMap([catalogComputedAttributeAsCatalogAttribute(item)], [], true);

        expect(map.get(idRef("ca_1", "computedAttribute"))).toBe(item.defaultDisplayForm);
    });

    it("should keep resolving plain display forms stored alongside computed attribute ones", () => {
        const item = testCatalogComputedAttribute("ca_1");
        const plainDisplayForm: IAttributeDisplayFormMetadataObject = {
            type: "displayForm",
            ref: idRef("label_1", "displayForm"),
            id: "label_1",
            uri: "/label/label_1",
            title: "Plain label",
            description: "",
            attribute: idRef("attr_1", "attribute"),
            production: true,
            deprecated: false,
            unlisted: false,
        };

        const map = newDisplayFormMap([plainDisplayForm, ...item.displayForms], true);

        expect(map.get(idRef("label_1", "displayForm"))).toBe(plainDisplayForm);
        expect(map.get(idRef("ca_1", "computedAttribute"))).toBe(item.defaultDisplayForm);
    });
});
