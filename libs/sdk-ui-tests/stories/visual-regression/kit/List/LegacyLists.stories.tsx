// (C) 2007-2025 GoodData Corporation

import { useCallback, useState } from "react";

import { times } from "lodash-es";

import { withIntl } from "@gooddata/sdk-ui";
import { LegacyInvertableList, LegacySingleSelectList } from "@gooddata/sdk-ui-kit";

import { wrapWithTheme } from "../../themeWrapper.js";

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
    onSearch: () => {},
    selection: [],
    width: 210,
};

function LegacyListExamples() {
    const [invertableListSearchString, setInvertableListSearchString] = useState("");
    const [selection, setSelection] = useState<IItem[]>(items.slice(0, 2));
    const [isInverted, setIsInverted] = useState(true);

    const renderInvertableList = useCallback(() => {
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
                    setInvertableListSearchString(str);
                }}
                searchString={invertableListSearchString}
                selection={selection}
                isInverted={isInverted}
                onSelect={(selectedElements: IItem[], inverted: boolean) => {
                    setSelection(selectedElements);
                    setIsInverted(inverted);
                }}
                tagName="Attribute"
            />
        );
    }, [invertableListSearchString, selection, isInverted]);

    const renderInvertableListWithLimitException = useCallback(() => {
        return (
            <LegacyInvertableList
                {...defaultListProps}
                maxSelectionSize={3}
                selection={items.slice(0, 10)}
                showSearchField={false}
            />
        );
    }, []);

    const renderInvertableListInLoadingState = useCallback(() => {
        return <LegacyInvertableList {...defaultListProps} isLoading showSearchField={false} />;
    }, []);

    const renderInvertableListWithNoItemsFound = useCallback(() => {
        return <LegacyInvertableList {...defaultListProps} filteredItemsCount={0} searchString="xxx" />;
    }, []);

    const renderSingleSelectList = useCallback(() => {
        return <LegacySingleSelectList {...defaultListProps} selection={items[0]} />;
    }, []);

    return (
        <div className="library-component screenshot-target">
            <div className="list-item-list-example">
                <h4>Invertable list (live with local state)</h4>
                {renderInvertableList()}
            </div>

            <div className="list-item-list-example">
                <h4>Single select list w/o search</h4>
                {renderSingleSelectList()}
            </div>

            <div className="list-item-list-example">
                <h4>Multi select with limit exception</h4>
                {renderInvertableListWithLimitException()}
            </div>

            <div className="list-item-list-example">
                <h4>List in loading state</h4>
                {renderInvertableListInLoadingState()}
            </div>

            <div className="list-item-list-example">
                <h4>List with no items</h4>
                {renderInvertableListWithNoItemsFound()}
            </div>
        </div>
    );
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

export default {
    title: "12 UI Kit/Legacy Lists",
};

export function FullFeatured() {
    return <WithIntl />;
}
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<WithIntl />);
Themed.parameters = { kind: "themed", screenshot: true };
