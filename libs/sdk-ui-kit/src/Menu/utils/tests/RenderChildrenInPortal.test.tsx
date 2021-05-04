// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { RenderChildrenInPortal } from "../RenderChildrenInPortal";

describe("RenderChildrenInPortal", () => {
    it("should render children in targetElement", () => {
        const target = document.createElement("div");

        expect(target.children.length).toBe(0);

        mount(
            <RenderChildrenInPortal targetElement={target}>
                <div className="child-element" />
            </RenderChildrenInPortal>,
        );

        expect(target.children.length).toBe(1);
        expect(target.querySelector(".child-element")).toBeTruthy();
    });
});
