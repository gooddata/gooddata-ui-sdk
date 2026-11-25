// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { NotSupported } from "@gooddata/sdk-backend-spi";

import { convertSkippingNotSupported } from "./convertSkippingNotSupported.js";

const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("convertSkippingNotSupported", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("converts all items in their order", () => {
        expect(convertSkippingNotSupported(items, (item) => item.id.toUpperCase(), "Item")).toEqual([
            "A",
            "B",
            "C",
        ]);
    });

    it("skips an item that is not supported and warns about it", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const error = new NotSupported("unsupported item");

        const result = convertSkippingNotSupported(
            items,
            (item) => {
                if (item.id === "b") {
                    throw error;
                }
                return item.id;
            },
            "Item",
        );

        expect(result).toEqual(["a", "c"]);
        expect(warn).toHaveBeenCalledWith("Item cannot be loaded, skipping it:", "b", error);
    });

    it("rethrows any other error", () => {
        expect(() =>
            convertSkippingNotSupported(
                items,
                () => {
                    throw new Error("broken");
                },
                "Item",
            ),
        ).toThrow("broken");
    });
});
