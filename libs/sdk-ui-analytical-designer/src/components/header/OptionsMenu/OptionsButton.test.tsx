// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IAppState } from "../../../store/types.js";
import { tableVisualizationClass } from "../../../tests/constants.test.helpers.js";
import { withData } from "../../../tests/state_builder.test.helpers.js";
import { withIntl } from "../../../utils/with_intl.js";
import { withRedux } from "../../../utils/with_redux.js";

import { OptionsButton } from "./OptionsButton.js";

describe("OptionsButton", () => {
    it("should update isShowExportMenu on click", () => {
        function setupAppState(state: IAppState) {
            return withData(state, { visualizationClass: tableVisualizationClass });
        }

        const WrappedComponent = withRedux(withIntl(OptionsButton), setupAppState);
        const { getByText } = render(<WrappedComponent />);

        fireEvent.click(getByText("⋯"));
        expect(document.querySelector(".s-gd-export-menu-overlay")).toBeInTheDocument();

        fireEvent.click(getByText("⋯"));
        expect(document.querySelector(".s-gd-export-menu-overlay")).not.toBeInTheDocument();
    });
});
