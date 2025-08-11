// (C) 2025 GoodData Corporation
import { UiIcon } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import React from "react";
import { FormattedMessage } from "react-intl";

type Props = {
    count: number;
    isExpanded: boolean;
};

export function GroupResultCounter({ count, isExpanded }: Props) {
    if (!count) {
        return null;
    }
    return (
        <div className="gd-semantic-search__results-item__counter">
            <FormattedMessage tagName="span" id="semantic-search.results.count" values={{ count }} />
            <div
                className={cx(
                    "gd-semantic-search__results-item__counter__icon",
                    isExpanded && "gd-semantic-search__results-item__counter__icon--expanded",
                )}
            >
                <UiIcon type="navigateRight" size={16} color="complementary-6" ariaHidden={true} />
            </div>
        </div>
    );
}
