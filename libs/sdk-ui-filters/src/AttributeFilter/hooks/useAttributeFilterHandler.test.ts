// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type ISeparators, attributeDisplayFormRef, newPositiveAttributeFilter } from "@gooddata/sdk-model";

import {
    type IUseAttributeFilterHandlerProps,
    useAttributeFilterHandler,
} from "./useAttributeFilterHandler.js";

const backend = recordedBackend(ReferenceRecordings.Recordings);
const filter = newPositiveAttributeFilter(attributeDisplayFormRef(ReferenceMd.Product.Name), []);

const props = (separators?: ISeparators): IUseAttributeFilterHandlerProps => ({
    backend,
    workspace: "reference-workspace",
    filter,
    separators,
});

describe("useAttributeFilterHandler", () => {
    it("builds a new handler when the separators change, so element titles use the new ones", () => {
        const { result, rerender } = renderHook(
            (p: IUseAttributeFilterHandlerProps) => useAttributeFilterHandler(p),
            {
                initialProps: props({ thousand: ",", decimal: "." }),
            },
        );
        const first = result.current;

        rerender(props({ thousand: ",", decimal: "." }));
        expect(result.current).toBe(first);

        rerender(props({ thousand: " ", decimal: "," }));
        expect(result.current).not.toBe(first);
    });
});
