// (C) 2007-2025 GoodData Corporation

import { Header, Item, ItemsWrapper, Separator } from "@gooddata/sdk-ui-kit";

import { type IStoryParameters } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

import "./styles.scss";

function ListExamples() {
    return (
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
}

// eslint-disable-next-line no-restricted-exports
export default {
    title: "12 UI Kit/Menu List",
};

export function FullFeatured() {
    return <ListExamples />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<ListExamples />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: ".screenshot-target" },
} satisfies IStoryParameters;
