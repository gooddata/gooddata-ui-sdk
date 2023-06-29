// (C) 2007-2020 GoodData Corporation
import React from "react";

import { ItemsWrapper, Separator, Header, Item } from "@gooddata/sdk-ui-kit";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";
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

storiesOf(`${UiKit}/Menu List`)
    .add("full-featured", () => <ListExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<ListExamples />), { screenshot: true });
