// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type IntlShape } from "react-intl";

import { Dropdown, type IUiListboxInteractiveItem, UiIconButton, UiListbox } from "@gooddata/sdk-ui-kit";

type Props = {
    intl: IntlShape;
    onRunCheck: () => void;
    isLoading: boolean;
};

export function QualityScoreCardMenu({ intl, onRunCheck, isLoading }: Props) {
    const title = intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.title" });
    const moreActionsAriaLabel = intl.formatMessage(
        { id: "analyticsCatalog.quality.scoreCard.menu.ariaLabel" },
        { title },
    );

    const items: IUiListboxInteractiveItem<null>[] = useMemo(
        () => [
            {
                type: "interactive",
                id: "runCheck",
                data: null,
                stringTitle: intl.formatMessage({ id: "analyticsCatalog.quality.scoreCard.runCheck" }),
                icon: "sync",
            },
        ],
        [intl],
    );

    const handleAction = async (item: IUiListboxInteractiveItem<null>) => {
        if (item.id === "runCheck") {
            onRunCheck();
        }
    };

    return (
        <Dropdown
            className="gd-analytics-catalog__quality-score-card__menu"
            alignPoints={[{ align: "br tr" }]}
            renderButton={({ toggleDropdown, ariaAttributes }) => {
                return (
                    <UiIconButton
                        icon="ellipsis"
                        variant="tertiary"
                        onClick={toggleDropdown}
                        ariaAttributes={ariaAttributes}
                        accessibilityConfig={{ ariaLabel: moreActionsAriaLabel }}
                        isDisabled={isLoading}
                        size="large"
                    />
                );
            }}
            renderBody={({ closeDropdown, ariaAttributes }) => {
                return (
                    <UiListbox
                        width={120}
                        items={items}
                        onClose={closeDropdown}
                        onSelect={handleAction}
                        shouldCloseOnSelect
                        ariaAttributes={ariaAttributes}
                        isCompact
                    />
                );
            }}
            closeOnEscape
            autofocusOnOpen
        />
    );
}
