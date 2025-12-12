// (C) 2007-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocumentHeader, type IDocumentHeaderProps } from "../DocumentHeader.js";

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

        expect(document.title).toEqual("Title - brand");
    });

    it("should set document title to 'Title' when no brand is provided", () => {
        createComponent({
            pageTitle: "Title",
            appleTouchIconUrl: "url",
            faviconUrl: "url",
        });

        expect(document.title).toEqual("Title");
    });

    it("should set document title to 'brand' when no Title is provided", () => {
        createComponent({
            pageTitle: "",
            brandTitle: "brand",
            appleTouchIconUrl: "url",
            faviconUrl: "url",
        });

        expect(document.title).toEqual("brand");
    });

    it("should set the icons", () => {
        createComponent({
            pageTitle: "Title",
            appleTouchIconUrl: "APPLE_URL",
            faviconUrl: "FAVICON_URL",
        });

        expect(Array.from(document.querySelectorAll("link"))).toMatchSnapshot();
    });
});
