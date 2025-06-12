// (C) 2021-2025 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import defaultUserEvent from "@testing-library/user-event";

import { WorkspacePickerHomeFooter, IWorkspacePickerHomeFooterProps } from "../WorkspacePickerHomeFooter.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("WorkspacePickerHomeFooter", () => {
    function renderWorkspacePickerHomeFooter(props: IWorkspacePickerHomeFooterProps = {}) {
        return render(<WorkspacePickerHomeFooter {...props} />);
    }

    it("should render home icon and call onClick when clicked", async () => {
        const onClick = vi.fn();
        renderWorkspacePickerHomeFooter({ onClick });

        const homeIcon = screen.getByTestId("s-workspace-picker-home-footer");

        expect(homeIcon).toBeInTheDocument();

        await userEvent.click(homeIcon);

        await waitFor(() => expect(onClick).toBeCalled());
    });
});
