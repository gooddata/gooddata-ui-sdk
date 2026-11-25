// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import { type IParameterDefinition, idRef } from "@gooddata/sdk-model";

import { convertParameterToCatalogItem } from "../catalogItem/converter.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import { parameterDescriptor } from "./parameterDescriptor.js";

const dateRange: IParameterDefinition = {
    type: "DATE_RANGE",
    defaultValue: { granularity: "GDC.time.month", from: "2025-08" },
};

function createWrapper(enableDateRangeParameters: boolean) {
    return function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestPermissionsProvider
                result={{
                    ...defaultPermissionsResult,
                    settings: { ...defaultPermissionsResult.settings, enableDateRangeParameters },
                }}
            >
                <TestIntlProvider>{children}</TestIntlProvider>
            </TestPermissionsProvider>
        );
    };
}

function isEditable(
    definition: IParameterDefinition,
    enableDateRangeParameters = false,
): boolean | undefined {
    const item = convertParameterToCatalogItem({
        type: "parameter",
        id: "parameter",
        uri: "",
        ref: idRef("parameter", "parameter"),
        title: "Parameter",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition,
    });
    return renderHook(() => parameterDescriptor.useIsItemEditable?.(item), {
        wrapper: createWrapper(enableDateRangeParameters),
    }).result.current;
}

describe("parameterDescriptor.useIsItemEditable", () => {
    it("allows editing a NUMBER or STRING parameter", () => {
        expect(isEditable({ type: "NUMBER", defaultValue: 5 })).toBe(true);
        expect(isEditable({ type: "STRING", defaultValue: "Actual" })).toBe(true);
    });

    it("keeps a DATE_RANGE parameter read-only while date range parameters are off", () => {
        expect(isEditable(dateRange)).toBe(false);
    });

    it("allows editing a DATE_RANGE parameter once date range parameters are on", () => {
        expect(isEditable(dateRange, true)).toBe(true);
    });
});

describe("parameterDescriptor editing of a DATE_RANGE parameter", () => {
    function validate(period: string) {
        const editing = renderHook(() => parameterDescriptor.useEditing(), { wrapper: createWrapper(true) })
            .result.current;
        return editing?.validate(`definition:\n  type: DATE_RANGE\n  defaultValue:\n${period}`, {
            intent: "create",
        });
    }

    it("saves the period with the granularity the model uses", () => {
        expect(validate("    granularity: MONTH\n    from: 2025-08\n    to: 2026-08\n")).toEqual({
            isValid: true,
            definition: {
                type: "parameter",
                definition: {
                    type: "DATE_RANGE",
                    defaultValue: { granularity: "GDC.time.month", from: "2025-08", to: "2026-08" },
                },
            },
        });
    });

    it("blocks the save and names the end that does not match the granularity", () => {
        expect(validate("    granularity: MONTH\n    from: 2026-13\n")).toEqual({
            isValid: false,
            error: "from must be written as YYYY-MM, for example 2025-08.",
            path: ["definition", "defaultValue", "from"],
            target: undefined,
        });
    });

    it("lists the accepted granularities", () => {
        expect(validate("    granularity: month\n    from: 2025-08\n")).toMatchObject({
            isValid: false,
            error: "Granularity must be YEAR, QUARTER, MONTH, WEEK, DAY, HOUR, MINUTE, or SECOND.",
        });
    });
});
