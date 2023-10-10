// (C) 2023 GoodData Corporation
import { describe, it, expect, vi } from "vitest";
import { getVisibilityIcon } from "../utils.js";

describe("utils", () => {
    describe("getVisibilityIcon", () => {
        const mockIntl: any = { formatMessage: vi.fn().mockImplementation((message) => message) };

        it("should return undefined when supportsHiddenAndLockedFiltersOnUI is false", () => {
            const result = getVisibilityIcon("hidden", true, false, mockIntl);
            expect(result).toBeUndefined();
        });

        it("should return undefined when mode is undefined", () => {
            const result = getVisibilityIcon(undefined, true, true, mockIntl);
            expect(result).toBeUndefined();
        });

        it("should return undefined when mode is not hidden or readonly", () => {
            const result = getVisibilityIcon("active", true, true, mockIntl);
            expect(result).toBeUndefined();
        });

        it("should return icon and tooltip when mode is hidden", () => {
            const result = getVisibilityIcon("hidden", true, true, mockIntl);
            expect(result).toMatchSnapshot();
        });

        it("should return icon and tooltip when mode is readonly in edit mode", () => {
            const result = getVisibilityIcon("readonly", true, true, mockIntl);
            expect(result).toMatchSnapshot();
        });

        it("should return icon and tooltip when mode is readonly in view mode", () => {
            const result = getVisibilityIcon("readonly", false, true, mockIntl);
            expect(result).toMatchSnapshot();
        });
    });
});
