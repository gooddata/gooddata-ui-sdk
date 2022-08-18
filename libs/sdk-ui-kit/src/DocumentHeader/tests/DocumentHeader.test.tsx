// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import DocumentHeader, { IDocumentHeaderProps } from "../DocumentHeader";
import { Helmet } from "react-helmet";

describe("DocumentHeader", () => {
    const createComponent = (props: IDocumentHeaderProps = {}) => {
        return render(<DocumentHeader {...props} />);
    };

    it("should set document title to 'Title - brand'", () => {
        createComponent({
            pageTitle: "Title",
            brandTitle: "brand",
            appleTouchIconUrl: "url",
            faviconUrl: "url",
        });

        const helmet = Helmet.peek();
        expect(helmet.title).toEqual("Title - brand");
    });

    it("should set document title to 'Title' when no brand is provided", () => {
        createComponent({
            pageTitle: "Title",
            appleTouchIconUrl: "url",
            faviconUrl: "url",
        });

        const helmet = Helmet.peek();
        expect(helmet.title).toEqual("Title");
    });

    it("should set document title to 'brand' when no Title is provided", () => {
        createComponent({
            pageTitle: "",
            brandTitle: "brand",
            appleTouchIconUrl: "url",
            faviconUrl: "url",
        });

        const helmet = Helmet.peek();
        expect(helmet.title).toEqual("brand");
    });

    it("should set the icons", () => {
        createComponent({
            pageTitle: "Title",
            appleTouchIconUrl: "APPLE_URL",
            faviconUrl: "FAVICON_URL",
        });

        const helmet = Helmet.peek();
        expect(helmet.linkTags).toMatchSnapshot();
    });
});
