// (C) 2022 GoodData Corporation
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import React, { ReactNode } from "react";
import cx from "classnames";

import { stringUtils } from "@gooddata/util";
import { FormattedMessage } from "react-intl";
import {
    useDashboardSelector,
    selectCatalogAttributes,
    selectAttributeFilterDisplayFormByLocalId,
} from "../../../../../../model/index.js";

import { invariant } from "ts-invariant";
import { areObjRefsEqual } from "@gooddata/sdk-model";
interface IParentFiltersDisabledItemProps {
    itemTitle: string;
    itemLocalId?: string;
    hasConnectingAttributes: boolean;
}

const ALIGN_POINTS = [{ align: "bc tl" }, { align: "tc bl" }];

const ARROW_OFFSET = {
    "bc tl": [-100, 10],
    "tc bl": [-100, -10],
};

export const ParentFiltersDisabledItem: React.FC<IParentFiltersDisabledItemProps> = (props) => {
    const { itemLocalId, itemTitle, hasConnectingAttributes } = props;

    const itemDisplayForm = useDashboardSelector(
        selectAttributeFilterDisplayFormByLocalId(itemLocalId || ""),
    );
    const attributes = useDashboardSelector(selectCatalogAttributes);

    const itemAttribute = attributes.find((attr) =>
        attr.displayForms.some((df) => areObjRefsEqual(df.ref, itemDisplayForm)),
    );
    const currentFilterTitle = itemAttribute?.attribute.title;

    invariant(itemTitle, "The parent filter title could not be fetched.");

    const itemClasses = cx(
        "gd-list-item attribute-filter-item s-attribute-filter-dropdown-configuration-item",
        `s-${stringUtils.simplifyText(itemTitle)}`,
    );

    return (
        <BubbleHoverTrigger hideDelay={0}>
            <div className={itemClasses}>
                <label className="input-checkbox-label configuration-item-title">
                    <input
                        type="checkbox"
                        className="input-checkbox s-checkbox"
                        readOnly={true}
                        disabled={true}
                        checked={false}
                    />
                    <span className="input-label-text">{itemTitle}</span>
                </label>
            </div>
            <Bubble
                className="bubble-primary gd-attribute-filter-dropdown-bubble s-attribute-filter-dropdown-bubble"
                alignPoints={ALIGN_POINTS}
                arrowOffsets={ARROW_OFFSET}
            >
                {hasConnectingAttributes ? (
                    <div>
                        <FormattedMessage
                            id="attributesDropdown.filterConfiguredMessage"
                            values={{
                                childTitle: currentFilterTitle,
                                parentTitle: itemTitle,
                                // eslint-disable-next-line react/display-name
                                strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                            }}
                        />
                    </div>
                ) : (
                    <div>
                        <FormattedMessage
                            id="attributesDropdown.noConnectionMessage"
                            values={{
                                childTitle: currentFilterTitle,
                                parentTitle: itemTitle,
                                // eslint-disable-next-line react/display-name
                                strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                            }}
                        />
                    </div>
                )}
            </Bubble>
        </BubbleHoverTrigger>
    );
};
