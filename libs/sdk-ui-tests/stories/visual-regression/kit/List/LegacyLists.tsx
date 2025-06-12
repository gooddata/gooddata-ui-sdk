// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import noop from "lodash/noop.js";
import times from "lodash/times.js";
import { LegacyInvertableList, LegacySingleSelectList } from "@gooddata/sdk-ui-kit";
import { withIntl } from "@gooddata/sdk-ui";
import { wrapWithTheme } from "../../themeWrapper.js";

import { storiesOf } from "../../../_infra/storyRepository.js";
import { UiKit } from "../../../_infra/storyGroups.js";

import "./styles.scss";

interface IItem {
    title: string;
}

const items: IItem[] = times(20, (index) => ({
    title: `Item ${index}`,
}));

const defaultListProps = {
    className: "list-example-list",
    filteredItemsCount: 20,
    height: 200,
    itemHeight: 24,
    items,
    itemsCount: items.length,
    maxSelectionSize: 20,
    onSearch: noop,
    selection: [],
    width: 210,
};

interface ILegacyListExamplesState {
    invertableListSearchString: string;
    selection: IItem[];
    isInverted: boolean;
}

export class LegacyListExamples extends Component<unknown, ILegacyListExamplesState> {
    public readonly state = {
        invertableListSearchString: "",
        selection: items.slice(0, 2),
        isInverted: true,
    };

    private renderInvertableList() {
        const { invertableListSearchString, selection, isInverted } = this.state;

        const filteredItems = items.filter((item) => {
            return item.title.includes(invertableListSearchString);
        });

        return (
            <LegacyInvertableList<IItem>
                {...defaultListProps}
                selectAllCheckbox
                filteredItemsCount={filteredItems.length}
                items={filteredItems}
                onSearch={(str) => {
                    this.setState({
                        invertableListSearchString: str,
                    });
                }}
                searchString={invertableListSearchString}
                selection={selection}
                isInverted={isInverted}
                onSelect={(selectedElements: IItem[], inverted: boolean) => {
                    this.setState({
                        selection: selectedElements,
                        isInverted: inverted,
                    });
                }}
                tagName="Attribute"
            />
        );
    }

    private renderInvertableListWithLimitException() {
        return (
            <LegacyInvertableList
                {...defaultListProps}
                maxSelectionSize={3}
                selection={items.slice(0, 10)}
                showSearchField={false}
            />
        );
    }

    private renderInvertableListInLoadingState() {
        return <LegacyInvertableList {...defaultListProps} isLoading showSearchField={false} />;
    }

    private renderInvertableListWithNoItemsFound() {
        return <LegacyInvertableList {...defaultListProps} filteredItemsCount={0} searchString="xxx" />;
    }

    private renderSingleSelectList() {
        return <LegacySingleSelectList {...defaultListProps} selection={items[0]} />;
    }

    public render(): JSX.Element {
        return (
            <div className="library-component screenshot-target">
                <div className="list-item-list-example">
                    <h4>Invertable list (live with local state)</h4>
                    {this.renderInvertableList()}
                </div>

                <div className="list-item-list-example">
                    <h4>Single select list w/o search</h4>
                    {this.renderSingleSelectList()}
                </div>

                <div className="list-item-list-example">
                    <h4>Multi select with limit exception</h4>
                    {this.renderInvertableListWithLimitException()}
                </div>

                <div className="list-item-list-example">
                    <h4>List in loading state</h4>
                    {this.renderInvertableListInLoadingState()}
                </div>

                <div className="list-item-list-example">
                    <h4>List with no items</h4>
                    {this.renderInvertableListWithNoItemsFound()}
                </div>
            </div>
        );
    }
}

// TODO remove this adhoc translations when List components will have own dictionary and dont rely on provided Intl from top
const customMessages = {
    "gs.list.clear": "Clear",
    "gs.list.only": "Only",
    "gs.list.all": "All",
    "gs.list.is": "is",
    "gs.list.searchResults": "search results",
    "gs.list.selectAll": "Select all",
    "gs.list.except": "except",
    "gs.list.selected": "selected",
    "gs.list.limitExceeded": "Sorry, you have exceeded the limit ({limit}).",
    "gs.list.noItemsFound": "No items found.",
    "gs.list.empty.value": "empty value",
    "gs.list.notAvailableAbbreviation": "N/A",
};

const WithIntl = withIntl(LegacyListExamples, undefined, customMessages);

storiesOf(`${UiKit}/Legacy Lists`)
    .add("full-featured", () => <WithIntl />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<WithIntl />), { screenshot: true });
