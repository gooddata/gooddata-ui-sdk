// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import { Spinner } from "../Spinner";

describe("Spinner", () => {
    it("should render dots", () => {
        render(<Spinner />);
        expect(document.querySelectorAll(".gd-dot-spinner > div")).toHaveLength(8);
    });
});
