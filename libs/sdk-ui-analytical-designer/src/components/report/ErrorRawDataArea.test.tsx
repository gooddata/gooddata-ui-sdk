// (C) 2023-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../../utils/with_intl.js";

import { ErrorRawDataArea } from "./ErrorRawDataArea.js";

const HEADER_TOOLTIP_QUERY =
    /The raw error response shows back-end information about the error that has occurred/;

describe("ErrorRawDataArea", () => {
    const errorRawData = {
        status: 400,
        message: "message error 400",
        traceId: "trace_id",
    };
    const renderErrorRawDataArea = () => {
        const props = { errorRawData };
        const Wrapped = withIntl(ErrorRawDataArea);
        return render(<Wrapped {...props} />);
    };

    it("rendering a tooltip when hovering over header", async () => {
        const { container } = renderErrorRawDataArea();
        fireEvent.mouseOver(container.querySelector(".s-error-raw-data-area-header"));
        await waitFor(() => {
            expect(screen.queryByText(HEADER_TOOLTIP_QUERY)).toBeInTheDocument();
        });
    });

    it("renders raw error data correctly", () => {
        const { container } = renderErrorRawDataArea();
        const textArea = container.querySelector("pre");
        Object.entries(errorRawData)
            .flatMap((it) => it)
            .forEach((it) => {
                expect(textArea).toHaveTextContent(it.toString());
            });
    });
});
