// (C) 2026 GoodData Corporation

import { type IAttributeDisplayFormMetadataObject, idRef } from "@gooddata/sdk-model";

/**
 * Test-only label (display form) fixture.
 * @internal
 */
export function createLabel(
    id: string,
    title: string,
    overrides: Partial<IAttributeDisplayFormMetadataObject> = {},
): IAttributeDisplayFormMetadataObject {
    return {
        type: "displayForm",
        ref: idRef(id, "displayForm"),
        id,
        uri: `/${id}`,
        title,
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        attribute: idRef("attribute.id", "attribute"),
        ...overrides,
    };
}
