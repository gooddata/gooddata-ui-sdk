// (C) 2022 GoodData Corporation
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const setupComponent = (jsx: any) => {
    return {
        user: userEvent.setup(),
        ...render(jsx),
    };
};
