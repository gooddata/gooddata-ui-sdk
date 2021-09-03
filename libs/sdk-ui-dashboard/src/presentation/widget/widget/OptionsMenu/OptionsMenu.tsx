// (C) 2019-2021 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { objRefToString } from "@gooddata/sdk-model";
import { Bubble, IAlignPoint, ItemsWrapper } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";
import { IWidget, widgetRef } from "@gooddata/sdk-backend-spi";

import { OptionsMenuItem } from "./OptionsMenuItem";
import { DOWNLOADER_ID } from "../../../../_staging/fileUtils/downloadFile";

export interface IOptionsMenuProps extends WrappedComponentProps {
    bubbleMessageKey?: string;
    widget: IWidget;
    exportCSVDisabled?: boolean;
    exportXLSXDisabled?: boolean;
    onExportCSV: () => void;
    onExportXLSX: () => void;
    hideOptionsMenu: () => void;
}

const alignPoints: IAlignPoint[] = [{ align: "bc tr", offset: { x: 2, y: 0 } }];

const ignoredOutsideClickClasses = [`#${DOWNLOADER_ID}`];

const OptionsMenuCore: React.FC<IOptionsMenuProps> = ({
    bubbleMessageKey = "",
    widget,
    intl,
    exportCSVDisabled,
    exportXLSXDisabled,
    onExportCSV,
    onExportXLSX,
    hideOptionsMenu,
}) => {
    const widgetRefValue = widgetRef(widget);
    const exportWidgetRefAsString = objRefToString(widgetRefValue);
    const bubbleMessage = bubbleMessageKey ? intl.formatMessage({ id: bubbleMessageKey }) : undefined;

    return (
        <Bubble
            key="OptionsMenu"
            alignTo={`.s-dash-item-action-options-${stringUtils.simplifyText(exportWidgetRefAsString)}`}
            alignPoints={alignPoints}
            className="bubble-light options-menu-bubble s-options-menu-bubble"
            closeOnOutsideClick
            // we need to ignore the "clicks" on the hidden downloader link to prevent the menu from closing
            // when the download starts (if the user opened it again before the download was ready)
            ignoreClicksOnByClass={ignoredOutsideClickClasses}
            onClose={hideOptionsMenu}
        >
            <ItemsWrapper smallItemsSpacing>
                <OptionsMenuItem
                    bubbleId="ExportXLSXBubble"
                    bubbleMessage={bubbleMessage}
                    className="options-menu-export-xlsx s-options-menu-export-xlsx"
                    isDisabled={exportXLSXDisabled}
                    title={intl.formatMessage({ id: "options.menu.export.XLSX" })}
                    onClick={onExportXLSX}
                />
                <OptionsMenuItem
                    bubbleId="ExportCSVBubble"
                    bubbleMessage={bubbleMessage}
                    className="options-menu-export-csv s-options-menu-export-csv"
                    isDisabled={exportCSVDisabled}
                    title={intl.formatMessage({ id: "options.menu.export.CSV" })}
                    onClick={onExportCSV}
                />
            </ItemsWrapper>
        </Bubble>
    );
};

export const OptionsMenu = injectIntl(OptionsMenuCore);
