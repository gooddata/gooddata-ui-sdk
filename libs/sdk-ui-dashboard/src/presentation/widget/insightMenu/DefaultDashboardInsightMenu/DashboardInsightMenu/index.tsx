// (C) 2021-2022 GoodData Corporation
import React, { useState } from "react";
import cx from "classnames";
import { Separator } from "@gooddata/sdk-ui-kit";

import { IDashboardInsightMenuProps, IInsightMenuSubmenu, IInsightMenuItem } from "../../types";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer";
import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton";
import { DashboardInsightSubmenuContainer } from "./DashboardInsightSubmenuContainer";
import { selectIsInEditMode, useDashboardSelector } from "../../../../../model";
import { ConfigurationBubble } from "../../../common";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble";

const DashboardInsightMenuBody: React.FC<IDashboardInsightMenuProps> = (props) => {
    const { items, widget, onClose } = props;
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return submenu ? (
        <DashboardInsightSubmenuContainer
            onClose={onClose}
            title={submenu.itemName}
            onBack={() => setSubmenu(null)}
        >
            <submenu.SubmenuComponent widget={widget} />
        </DashboardInsightSubmenuContainer>
    ) : (
        <DashboardInsightMenuContainer onClose={onClose} widget={widget}>
            <DashboardInsightMenuRoot items={items} setSubmenu={setSubmenu} />
        </DashboardInsightMenuContainer>
    );
};

export const DashboardInsightMenu: React.FC<IDashboardInsightMenuProps> = (props) => {
    const { widget, onClose } = props;
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    return isInEditMode ? (
        <ConfigurationBubble
            classNames={cx(
                "edit-insight-config",
                "s-edit-insight-config",
                "edit-insight-config-arrow-color",
                "edit-insight-config-title-1-line",
            )}
            onClose={onClose}
        >
            <DashboardInsightMenuBody {...props} />
        </ConfigurationBubble>
    ) : (
        <DashboardInsightMenuBubble onClose={onClose} widget={widget}>
            <DashboardInsightMenuBody {...props} />
        </DashboardInsightMenuBubble>
    );
};

type DashboardInsightMenuRootProps = {
    items: IInsightMenuItem[];
    setSubmenu: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>;
};
const DashboardInsightMenuRoot: React.FC<DashboardInsightMenuRootProps> = ({ items, setSubmenu }) => {
    return (
        <>
            {items.map((item) => {
                if (item.type === "separator") {
                    return <Separator key={item.itemId} />;
                }
                if (item.type === "submenu") {
                    return (
                        <DashboardInsightMenuItemButton
                            key={item.itemId}
                            {...item}
                            onClick={() => setSubmenu(item)}
                            submenu={true}
                        />
                    );
                }
                return <DashboardInsightMenuItemButton key={item.itemId} {...item} />;
            })}
        </>
    );
};
