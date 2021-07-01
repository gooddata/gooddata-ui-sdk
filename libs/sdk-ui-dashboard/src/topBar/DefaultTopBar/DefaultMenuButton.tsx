// (C) 2021 GoodData Corporation
import React, { useMemo, useState } from "react";
import { Button, SingleSelectListItem, ItemsWrapper, Overlay } from "@gooddata/sdk-ui-kit";

import { useIntl } from "react-intl";
import { IDefaultMenuButtonComponentProps, IMenuButtonItem } from "../types";

/**
 * Default implementation of the menu. Apart from fulfilling the dashboard menu contract, the default implementation
 * allows customization of the button itself.
 *
 * @internal
 */
export const DefaultMenuButton: React.FC<IDefaultMenuButtonComponentProps> = ({
    onExportToPdfCallback,
    onScheduleEmailingCallback,
    menuItems,
    additionalMenuItems,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();

    const effectiveMenuItems = useMemo(() => {
        if (menuItems) {
            return menuItems;
        }

        const defaultMenuItems: IMenuButtonItem[] = [
            {
                itemId: "export-to-pdf",
                itemName: intl.formatMessage({ id: "options.menu.export.PDF" }),
                onClick: onExportToPdfCallback,
            },
            {
                itemId: "schedule-emailing",
                itemName: intl.formatMessage({ id: "options.menu.schedule.email" }),
                onClick: onScheduleEmailingCallback,
            },
        ];

        return (additionalMenuItems ?? []).reduce((acc, [index, item]) => {
            if (index === -1) {
                acc.push(item);
            } else {
                acc.splice(index, 0, item);
            }
            return acc;
        }, defaultMenuItems);
    }, [onExportToPdfCallback, onScheduleEmailingCallback, menuItems, additionalMenuItems, intl]);

    const onMenuButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const renderMenuItems = () => {
        return (
            <Overlay
                key={"topBarMenuButton"}
                alignTo=".s-header-options-button"
                alignPoints={[{ align: "br tr" }]}
                className="gd-header-menu-overlay"
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                onClose={onMenuButtonClick}
            >
                <ItemsWrapper smallItemsSpacing>
                    {effectiveMenuItems.map((menuItem) => {
                        return (
                            <SingleSelectListItem
                                className="gd-menu-item"
                                key={menuItem.itemId}
                                title={menuItem.itemName}
                                type={menuItem.type}
                                onClick={() => {
                                    menuItem.onClick?.();
                                    setIsOpen(false);
                                }}
                            />
                        );
                    })}
                </ItemsWrapper>
            </Overlay>
        );
    };

    return (
        <>
            <Button
                onClick={onMenuButtonClick}
                value="&#8943;"
                className={"gd-button-primary dash-header-options-button s-header-options-button gd-button"}
            />
            {isOpen && renderMenuItems()}
        </>
    );
};
