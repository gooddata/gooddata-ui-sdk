// (C) 2024 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { IAlignPoint, DropdownButton } from "@gooddata/sdk-ui-kit";

import { ConfigurationBubble } from "../../../widget/common/configuration/ConfigurationBubble.js";
import { useDashboardSelector, selectFilterViews, selectIsInEditMode } from "../../../../model/index.js";

import { FilterViewsList } from "./FilterViewsList.js";
import { useFilterViewsToastMessages } from "./useFilterViewsToastMessages.js";
import { AddFilterView } from "./AddFilterView.js";

const BUBBLE_ALIGN_POINTS: IAlignPoint[] = [{ align: "br tr", offset: { x: -27, y: -10 } }];

export const FilterViews: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const onClose = () => setIsOpen(false);
    const [isAddNew, setAddNew] = React.useState(false);
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    const filterViews = useDashboardSelector(selectFilterViews);

    useFilterViewsToastMessages();

    const buttonClassNames = cx("gd-filter-views-button", "gd-button-large", {
        "gd-filter-views-button--open": isOpen,
    });

    return (
        <div className="gd-filter-views">
            <DropdownButton onClick={() => setIsOpen(!isOpen)} className={buttonClassNames} isOpen={isOpen}>
                {filterViews.length === 0 ? (
                    <FormattedMessage id="filters.filterViews.dropdown.buttonEmpty" />
                ) : (
                    <FormattedMessage
                        id="filters.filterViews.dropdown.button"
                        values={{ count: filterViews?.length ?? 0 }}
                    />
                )}
            </DropdownButton>
            {isOpen ? (
                <ConfigurationBubble
                    classNames="gd-filters-views__panel"
                    onClose={onClose}
                    alignTo=".gd-filter-views-button"
                    alignPoints={BUBBLE_ALIGN_POINTS}
                >
                    {isAddNew ? (
                        <AddFilterView onClose={() => setAddNew(false)} />
                    ) : (
                        <FilterViewsList
                            filterViews={filterViews}
                            onAddNew={() => setAddNew(true)}
                            onClose={onClose}
                        />
                    )}
                </ConfigurationBubble>
            ) : null}
            {isEditMode ? <div className="gd-filters-views__panel__divider" /> : null}
        </div>
    );
};
