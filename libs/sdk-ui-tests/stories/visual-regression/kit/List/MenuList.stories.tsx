// (C) 2007-2025 GoodData Corporation
import React from "react";

import { ItemsWrapper, Separator, Header, Item } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

import "./styles.scss";

const ListExamples = () => (
    <div className="library-component screenshot-target">
        <h4>Menu without spacing</h4>

        <ItemsWrapper smallItemsSpacing>
            <Item>Item text</Item>
            <Header>Header text</Header>
            <Item>Item text</Item>
            <Separator />
            <Item>Item text</Item>
        </ItemsWrapper>

        <h4>Menu with spacing</h4>

        <ItemsWrapper>
            <Item>Item</Item>
            <Item checked>Checked item</Item>
            <Item disabled>Disabled item</Item>
            <Item subMenu>Sub-menu item</Item>
            <Item>Item text</Item>
        </ItemsWrapper>
    </div>
);

export default {
    title: "12 UI Kit/Menu List",
};

export const FullFeatured = () => <ListExamples />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<ListExamples />);
Themed.parameters = { kind: "themed", screenshot: true };
