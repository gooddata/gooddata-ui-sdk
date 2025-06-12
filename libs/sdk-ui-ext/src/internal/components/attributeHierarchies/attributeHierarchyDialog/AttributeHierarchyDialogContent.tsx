// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { List, LoadingMask } from "@gooddata/sdk-ui-kit";
import { messages } from "@gooddata/sdk-ui";

import AttributeItem from "./AttributeItem.js";
import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";
import AddAttributeAction from "./AddAttributeAction.js";

const DEFAULT_WIDTH = 845;
const DEFAULT_HEIGHT = 388;
const DEFAULT_ROW_HEIGHT = 43;

const AttributeHierarchyDialogContent: React.FC = () => {
    const { formatMessage } = useIntl();
    const { isLoading, attributes } = useAttributeHierarchyDialog();

    const emptyItem = attributes.find((item) => !item.completed);

    const tableTitle = formatMessage(messages.hierarchyLevels);

    return (
        <div className="gd-dialog-content attribute-hierarchy-dialog-content">
            <div className="attribute-hierarchy-table-title s-attribute-hierarchy-table-title">
                {tableTitle}
            </div>
            <List
                className="attribute-hierarchy-table s-attribute-hierarchy-table"
                width={DEFAULT_WIDTH}
                maxHeight={DEFAULT_HEIGHT}
                items={attributes}
                itemHeight={DEFAULT_ROW_HEIGHT}
                itemsCount={attributes.length}
                scrollToItem={emptyItem}
                renderItem={({ rowIndex, item }) => <AttributeItem rowIndex={rowIndex} attribute={item} />}
            />
            <AddAttributeAction />
            {isLoading ? (
                <LoadingMask className="attribute-hierarchy-content-loading-mask s-attribute-hierarchy-content-loading-mask" />
            ) : null}
        </div>
    );
};

export default AttributeHierarchyDialogContent;
