// (C) 2021-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { WorkspacePickerHomeFooter, IWorkspacePickerHomeFooterProps } from "../WorkspacePickerHomeFooter";

describe("WorkspacePickerHomeFooter", () => {
    function renderWorkspacePickerHomeFooter(props: IWorkspacePickerHomeFooterProps = {}) {
        return render(<WorkspacePickerHomeFooter {...props} />);
    }

    it("should render home icon and call onClick when clicked", async () => {
        const onClick = jest.fn();
        renderWorkspacePickerHomeFooter({ onClick });
        const homeIcon = screen.getByRole("icon-home");

        expect(homeIcon).toBeInTheDocument();

        await userEvent.click(homeIcon);

        await waitFor(() => expect(onClick).toBeCalled());
    });
});
