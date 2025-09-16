// (C) 2007-2025 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { newMeasure } from "@gooddata/sdk-model";

import { FormattedNumber } from "../FormattedNumber.js";
import { Kpi } from "../Kpi.js";

const testCustomFormat = "$#,#.##";
const testMeasure = newMeasure("m1", (m) => m.localId("m1").format(testCustomFormat));
const testWorkspace = "dummyWorkspace";

/**
 * This mock enables us to test props as parameters of the called component
 */
vi.mock("../FormattedNumber", () => ({
    FormattedNumber: vi.fn(() => null),
}));

describe("Kpi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render loading indicator", () => {
        render(<Kpi backend={dummyBackendEmptyData()} workspace={testWorkspace} measure={testMeasure} />);

        expect(document.querySelector(".s-loading")).toBeInTheDocument();
    });

    it("should render formatted number when loaded", async () => {
        render(<Kpi backend={dummyBackendEmptyData()} workspace={testWorkspace} measure={testMeasure} />);

        await waitFor(() => {
            expect(FormattedNumber).toHaveBeenCalled();
        });
    });

    it("should propagate custom measure format", async () => {
        render(<Kpi backend={dummyBackendEmptyData()} workspace={testWorkspace} measure={testMeasure} />);

        await waitFor(() => {
            expect(FormattedNumber).toHaveBeenCalledWith(
                expect.objectContaining({ format: testCustomFormat }),
                undefined,
            );
        });
    });
});
