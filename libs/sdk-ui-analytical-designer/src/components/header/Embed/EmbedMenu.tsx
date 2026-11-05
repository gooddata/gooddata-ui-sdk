// (C) 2007-2026 GoodData Corporation

import { IconExternalLink, Item, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { EmbedMenuItem } from "./EmbedMenuItem.js";

const MENU_ALIGN_POINTS = [{ align: "br tr" }];

export interface IEmbedMenuProps {
    embedInsightLabel: string;
    isEmbedInsightDisabled: boolean;
    embedInsightDisabledReason?: string;
    documentationLabel: string;
    documentationUrl: string;
    toggleMenu: () => void;
    onMenuItemClick: () => void;
}

export function EmbedMenu({
    embedInsightLabel,
    isEmbedInsightDisabled,
    embedInsightDisabledReason,
    documentationLabel,
    documentationUrl,
    toggleMenu,
    onMenuItemClick,
}: IEmbedMenuProps) {
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
                    title={embedInsightLabel}
                    disabled={isEmbedInsightDisabled}
                    disableMessage={embedInsightDisabledReason}
                    onMenuItemClick={onMenuItemClick}
                />
                <Separator />
                <Item className="adi-embed-button-menu-item-link" onClick={toggleMenu}>
                    <a href={documentationUrl} target="_blank" rel="noreferrer">
                        {documentationLabel}
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
