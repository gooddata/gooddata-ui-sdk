// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { DateFilterFormWrapper } from "../DateFilterFormWrapper.js";
import { describe, it, expect } from "vitest";

describe("DateFilterFormWrapper", () => {
    it("should render children", () => {
        const Content = <div>test content</div>;
        render(<DateFilterFormWrapper isMobile={false}>{Content}</DateFilterFormWrapper>);
        expect(screen.getByText("test content")).toBeInTheDocument();
    });

    it("should correctly propagate className to wrapper", () => {
        const className = "foo";
        render(
            <DateFilterFormWrapper isMobile={false} className={className}>
                test content
            </DateFilterFormWrapper>,
        );
        expect(screen.getByText("test content").parentElement).toHaveClass(className);
    });

    it("should match snapshot", () => {
        const component = (
            <DateFilterFormWrapper isMobile={false} className="foo">
                content
            </DateFilterFormWrapper>
        );
        expect(render(component).container).toMatchSnapshot();
    });
});
