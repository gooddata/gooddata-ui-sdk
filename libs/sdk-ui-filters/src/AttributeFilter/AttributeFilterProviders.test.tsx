// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type ISeparators, attributeDisplayFormRef, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import { AttributeFilterProviders } from "./AttributeFilterProviders.js";
import { useAttributeFilterContext } from "./Context/AttributeFilterContext.js";

const backend = recordedBackend(ReferenceRecordings.Recordings);
const filter = newPositiveAttributeFilter(attributeDisplayFormRef(ReferenceMd.Product.Default), []);

function SeparatorsProbe({ onRender }: { onRender: (separators: ISeparators | undefined) => void }) {
    onRender(useAttributeFilterContext().separators);
    return null;
}

describe("AttributeFilterProviders", () => {
    it("passes the separators of the host to the filter, so number-formatted values use them", () => {
        const separators: ISeparators = { thousand: " ", decimal: "," };
        let received: ISeparators | undefined;

        render(
            <AttributeFilterProviders
                backend={backend}
                workspace="reference-workspace"
                filter={filter}
                separators={separators}
            >
                <SeparatorsProbe onRender={(value) => (received = value)} />
            </AttributeFilterProviders>,
        );

        expect(received).toEqual(separators);
    });
});
