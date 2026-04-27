// (C) 2026 GoodData Corporation

import { Fragment, type ReactNode } from "react";

import { useIntl } from "react-intl";

import { Dropdown, ItemsWrapper, SingleSelectListItem, UiIconButton } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";
import {
    type IInsightPickerItem,
    type IInsightPickerMenuAction,
    type IInsightPickerMenuProps,
} from "./types.js";

interface IInsightPickerMenuComponentProps {
    item: IInsightPickerItem;
    menuActions?: IInsightPickerMenuAction[];
    renderMenu?: (props: IInsightPickerMenuProps) => ReactNode;
}

export function InsightPickerMenu({ item, menuActions, renderMenu }: IInsightPickerMenuComponentProps) {
    const intl = useIntl();
    return (
        <Dropdown
            alignPoints={[{ align: "br tr" }, { align: "tr br" }]}
            renderButton={({ toggleDropdown, isOpen }) => (
                <UiIconButton
                    icon="ellipsis"
                    label={intl.formatMessage(messages.menuActions)}
                    size="xlarge"
                    variant="table"
                    isActive={isOpen}
                    dataId="menu-button"
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => {
                if (renderMenu) {
                    return renderMenu({ item, closeMenu: closeDropdown });
                }

                return (
                    <ItemsWrapper smallItemsSpacing>
                        {menuActions?.map((action) => (
                            <Fragment key={action.id}>
                                {action.hasSeparator ? (
                                    <SingleSelectListItem
                                        type="separator"
                                        accessibilityConfig={{ role: "separator" }}
                                    />
                                ) : null}
                                <SingleSelectListItem
                                    className={
                                        action.isDestructive
                                            ? "gd-ui-ext-insight-picker-menu-destructive"
                                            : undefined
                                    }
                                    title={action.title}
                                    onClick={() => {
                                        closeDropdown();
                                        action.onClick(item);
                                    }}
                                    elementType="button"
                                    accessibilityConfig={{ role: "menuitem" }}
                                />
                            </Fragment>
                        ))}
                    </ItemsWrapper>
                );
            }}
        />
    );
}
