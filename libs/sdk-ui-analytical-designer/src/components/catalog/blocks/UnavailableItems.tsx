// (C) 2019-2026 GoodData Corporation

import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

export interface IUnavailableItemsProps {
    hiddenItemsCount: number;
    enableUnavailableItemsVisibility: boolean;
    showUnavailableItems: boolean;
    toggleUnavailableItemsVisibility: (visible: boolean) => void;
}

export function UnavailableItems({
    hiddenItemsCount,
    enableUnavailableItemsVisibility,
    showUnavailableItems,
    toggleUnavailableItemsVisibility,
}: IUnavailableItemsProps) {
    const intl = useIntl();
    const toggleVisibilityLabel = showUnavailableItems
        ? defineMessage({ id: "catalog.unavailableItems.hide" })
        : defineMessage({ id: "catalog.unavailableItems.show" });

    return (
        <footer>
            <div className="unavailable-items-matched s-unavailable-items-matched">
                <FormattedMessage
                    id="catalog.unavailable_items_matched"
                    values={{ count: hiddenItemsCount, isShow: showUnavailableItems }}
                />
                {enableUnavailableItemsVisibility ? (
                    <Button
                        onClick={() => toggleUnavailableItemsVisibility(!showUnavailableItems)}
                        className="gd-button-link-dimmed"
                        value={intl.formatMessage(toggleVisibilityLabel)}
                    />
                ) : null}
            </div>
        </footer>
    );
}
