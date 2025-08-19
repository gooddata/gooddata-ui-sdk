// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegacyListItem } from "../LegacyListItem.js";

describe("LegacyListItem", () => {
    const dummyListItemRenderer = (props: any) => {
        const title = props?.source?.title ?? "";
        return <div>{title}</div>;
    };

    const renderListItem = (customProps = {}) => {
        const props = {
            listItemClass: dummyListItemRenderer,
            ...customProps,
        };
        return render(<LegacyListItem {...props} />);
    };

    it("should render list item", () => {
        renderListItem({
            item: {
                source: {
                    title: "Hello world!",
                },
            },
        });

        expect(screen.getByText("Hello world!")).toBeInTheDocument();
    });

    it("should render separator if item type is 'separator'", () => {
        renderListItem({
            item: {
                source: {
                    title: "Hello world!",
                    type: "separator",
                },
            },
        });

        expect(screen.queryByText("Hello world!")).not.toBeInTheDocument();
        expect(screen.getByRole("list-item-separator")).toBeInTheDocument();
    });

    it("should render header if item type is 'header'", () => {
        const headerTitle = "I am header";
        renderListItem({
            item: {
                source: {
                    title: headerTitle,
                    type: "header",
                },
            },
        });

        expect(screen.getByText(`${headerTitle}`)).toBeInTheDocument();

        expect(screen.getByRole("list-item-header")).toBeInTheDocument();
    });
});
