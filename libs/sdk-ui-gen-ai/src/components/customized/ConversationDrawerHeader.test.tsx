// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DefaultConversationDrawerHeader } from "./ConversationDrawerHeader.js";

describe("DefaultConversationDrawerHeader", () => {
    it("should render title and divider", () => {
        const { container } = render(<DefaultConversationDrawerHeader title="Conversations" />);

        expect(screen.getByText("Conversations")).toHaveClass(
            "gd-gen-ai-chat__window__conversations__header",
        );
        expect(
            container.querySelector(".gd-gen-ai-chat__window__conversations__divider"),
        ).toBeInTheDocument();
    });
});
