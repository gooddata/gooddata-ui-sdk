// (C) 2023-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntl } from "../../utils/with_intl.js";

import { TraceIdMessage } from "./TraceIdMessage.js";

const MANAGE_PERMISSION_TITLE_TOOLTIP_QUERY =
    /Trace ID helps us identify, investigate, and resolve issues as quickly as possible. If you decide to contact our support team, provide us with this ID./;
const ANALYZE_PERMISSION_TITLE_TOOLTIP_QUERY =
    /Trace ID helps us identify, investigate, and resolve issues as quickly as possible. If you decide to contact your administrator, provide them with this ID./;

const TITLE_QUERY = /Error trace ID/;
const TRACE_ID_TOOLTIP_QUERY = /Copy to clipboard/;

describe("TraceIdMessage", () => {
    const traceId = "trace_id";
    const renderTraceIdMessage = (canManageProject?: boolean) => {
        const props = {
            traceId,
            canManageProject: canManageProject ?? true,
            showToastMessage: vi.fn(),
        };
        const Wrapped = withIntl(TraceIdMessage);
        return render(<Wrapped {...props} />);
    };

    it("rendering a message that includes the trace ID", () => {
        renderTraceIdMessage();
        expect(screen.queryByText(new RegExp(traceId))).toBeInTheDocument();
    });

    it("rendering a copy icon", () => {
        const { container } = renderTraceIdMessage();
        expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("rendering a manage permission tooltip when hovering over message", async () => {
        renderTraceIdMessage();
        fireEvent.mouseOver(screen.queryByText(TITLE_QUERY));
        await waitFor(() => {
            expect(screen.queryByText(MANAGE_PERMISSION_TITLE_TOOLTIP_QUERY)).toBeInTheDocument();
            expect(screen.queryByText(ANALYZE_PERMISSION_TITLE_TOOLTIP_QUERY)).not.toBeInTheDocument();
        });
    });

    it("rendering a analyze permission tooltip when hovering over message", async () => {
        renderTraceIdMessage(false);
        fireEvent.mouseOver(screen.queryByText(TITLE_QUERY));
        await waitFor(() => {
            expect(screen.queryByText(MANAGE_PERMISSION_TITLE_TOOLTIP_QUERY)).not.toBeInTheDocument();
            expect(screen.queryByText(ANALYZE_PERMISSION_TITLE_TOOLTIP_QUERY)).toBeInTheDocument();
        });
    });

    it("rendering a tooltip when hovering over trace ID", async () => {
        const { container } = renderTraceIdMessage();
        fireEvent.mouseOver(container.querySelector(".s-report-error-trace-id-data"));
        await waitFor(() => {
            expect(screen.queryByText(TRACE_ID_TOOLTIP_QUERY)).toBeInTheDocument();
        });
    });
});
