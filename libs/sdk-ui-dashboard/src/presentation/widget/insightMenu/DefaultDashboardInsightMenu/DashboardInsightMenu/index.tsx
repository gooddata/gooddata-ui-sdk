// (C) 2021-2022 GoodData Corporation
import React, { useState } from "react";
import { Separator } from "@gooddata/sdk-ui-kit";

import { IDashboardInsightMenuProps, IInsightMenuSubmenu, IInsightMenuItem } from "../../types";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer";
import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton";
import { DashboardInsightSubmenuContainer } from "./DashboardInsightSubmenuContainer";
import { selectIsInEditMode, useDashboardSelector } from "../../../../../model";
import { DashboardInsightMenuBubble } from "./DashboardInsightMenuBubble";
import { DashboardInsightEditMenuBubble } from "./DashboardInsightEditMenuBubble";

const DashboardInsightMenuBody: React.FC<
    IDashboardInsightMenuProps & {
        submenu: IInsightMenuSubmenu | null;
        setSubmenu: React.Dispatch<React.SetStateAction<IInsightMenuSubmenu | null>>;
    }
> = (props) => {
    const { items, widget, submenu, setSubmenu, onClose } = props;

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
    const [submenu, setSubmenu] = useState<IInsightMenuSubmenu | null>(null);

    return isInEditMode ? (
        <DashboardInsightEditMenuBubble onClose={onClose} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody {...props} submenu={submenu} setSubmenu={setSubmenu} />
        </DashboardInsightEditMenuBubble>
    ) : (
        <DashboardInsightMenuBubble onClose={onClose} widget={widget} isSubmenu={!!submenu}>
            <DashboardInsightMenuBody {...props} submenu={submenu} setSubmenu={setSubmenu} />
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
