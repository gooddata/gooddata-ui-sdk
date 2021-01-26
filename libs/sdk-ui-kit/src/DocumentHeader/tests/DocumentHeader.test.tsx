// (C) 2007-2020 GoodData Corporation
import React from "react";
import DocumentTitle from "react-document-title";
import { mount, shallow } from "enzyme";
import DocumentHeader from "../DocumentHeader";
import AppleTouchIcon from "../AppleTouchIcon";
import Favicon from "../Favicon";

describe("DocumentHeader", () => {
    it("should set document title to 'Title - brand'", () => {
        const component = mount(
            <DocumentHeader pageTitle="Title" brandTitle="brand" appleTouchIconUrl="url" faviconUrl="url" />,
        );
        expect(document.title).toEqual("Title - brand");
        component.unmount();
    });

    it("should set document title to 'Title' when no brand is provided", () => {
        const component = mount(
            <DocumentHeader pageTitle="Title" appleTouchIconUrl="url" faviconUrl="url" />,
        );
        expect(document.title).toEqual("Title");
        component.unmount();
    });

    it("should set document title to 'brand' when no Title is provided", () => {
        const component = mount(
            <DocumentHeader pageTitle="" brandTitle="brand" appleTouchIconUrl="url" faviconUrl="url" />,
        );
        expect(document.title).toEqual("brand");
        component.unmount();
    });

    it("should render all components", () => {
        const component = shallow(
            <DocumentHeader pageTitle="Title" appleTouchIconUrl="url" faviconUrl="url" />,
        );

        expect(component.find(DocumentTitle).length).toEqual(1);
        expect(component.find(AppleTouchIcon).length).toEqual(1);
        expect(component.find(Favicon).length).toEqual(1);
    });
});
