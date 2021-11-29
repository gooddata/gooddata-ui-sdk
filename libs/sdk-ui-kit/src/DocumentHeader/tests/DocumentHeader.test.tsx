// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import DocumentHeader from "../DocumentHeader";
import { Helmet } from "react-helmet";

describe("DocumentHeader", () => {
    it("should set document title to 'Title - brand'", () => {
        const component = mount(
            <DocumentHeader pageTitle="Title" brandTitle="brand" appleTouchIconUrl="url" faviconUrl="url" />,
        );
        const helmet = Helmet.peek();
        expect(helmet.title).toEqual("Title - brand");
        component.unmount();
    });

    it("should set document title to 'Title' when no brand is provided", () => {
        const component = mount(
            <DocumentHeader pageTitle="Title" appleTouchIconUrl="url" faviconUrl="url" />,
        );
        const helmet = Helmet.peek();
        expect(helmet.title).toEqual("Title");
        component.unmount();
    });

    it("should set document title to 'brand' when no Title is provided", () => {
        const component = mount(
            <DocumentHeader pageTitle="" brandTitle="brand" appleTouchIconUrl="url" faviconUrl="url" />,
        );
        const helmet = Helmet.peek();
        expect(helmet.title).toEqual("brand");
        component.unmount();
    });

    it("should set the icons", () => {
        const component = mount(
            <DocumentHeader pageTitle="Title" appleTouchIconUrl="APPLE_URL" faviconUrl="FAVICON_URL" />,
        );
        const helmet = Helmet.peek();
        expect(helmet.linkTags).toMatchSnapshot();
        component.unmount();
    });
});
