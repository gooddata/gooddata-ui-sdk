// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { invariant } from "ts-invariant";

import { areObjRefsEqual } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import {
    selectAttributeFilterDisplayFormByLocalId,
    selectCatalogAttributes,
    useDashboardSelector,
} from "../../../../../../model/index.js";
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

export function ParentFiltersDisabledItem(props: IParentFiltersDisabledItemProps) {
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
                                strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                            }}
                        />
                    </div>
                )}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
