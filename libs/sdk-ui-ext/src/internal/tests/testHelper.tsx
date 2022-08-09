// (C) 2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const setupComponent = (jsx: React.ReactElement) => {
    return {
        user: userEvent.setup(),
        ...render(jsx),
    };
};
