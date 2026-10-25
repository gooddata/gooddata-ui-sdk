// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { IconExternalLink, Item, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { EmbedMenuItem } from "./EmbedMenuItem.js";

const MENU_ALIGN_POINTS = [{ align: "br tr" }];

export interface IEmbedMenuProps {
    isReportBlank: boolean;
    isCodeGenerationSupported: boolean;
    embedAnalyticalDesignerLink: string;
    toggleMenu: () => void;
    onMenuItemClick: () => void;
}

export function EmbedMenu({
    isReportBlank,
    embedAnalyticalDesignerLink,
    toggleMenu,
    onMenuItemClick,
}: IEmbedMenuProps) {
    const intl = useIntl();
    const theme = useTheme();

    const iconColor = theme?.palette?.complementary?.c5 ?? "#000000";

    return (
        <Overlay
            key="EmbedMenu"
            alignTo={`[data-testid="s-embed-button"]`}
            alignPoints={MENU_ALIGN_POINTS}
            className="gd-export-menu-overlay s-gd-export-menu-overlay"
            closeOnMouseDrag
            closeOnOutsideClick
            onClose={toggleMenu}
        >
            <ItemsWrapper smallItemsSpacing className=".s-embed-menu">
                <EmbedMenuItem
                    title={intl.formatMessage({ id: "embedInsightDialog.embed.menu.title" })}
                    disabled={isReportBlank}
                    disableMessage={intl.formatMessage({
                        id: "embedInsightDialog.embed.disable.message.empty.report",
                    })}
                    onMenuItemClick={onMenuItemClick}
                />
                <Separator />
                <Item className="adi-embed-button-menu-item-link" onClick={toggleMenu}>
                    <a href={embedAnalyticalDesignerLink} target="_blank" rel="noreferrer">
                        <FormattedMessage id="embedInsightDialog.embed.analytical.designer.menu.title" />
                        <IconExternalLink
                            className="adi-embed-button-menu-item-ico-link"
                            width={14}
                            color={iconColor}
                        />
                    </a>
                </Item>
            </ItemsWrapper>
        </Overlay>
    );
}
