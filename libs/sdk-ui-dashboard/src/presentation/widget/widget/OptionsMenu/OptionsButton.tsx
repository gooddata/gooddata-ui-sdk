// (C) 2019-2021 GoodData Corporation
import React, { useCallback } from "react";
import { objRefToString } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { IWidget, widgetRef } from "@gooddata/sdk-backend-spi";
import { VisType } from "@gooddata/sdk-ui";

import { selectPermissions, selectSettings, useDashboardSelector } from "../../../../model";

const nonExportableVisTypes: VisType[] = ["headline", "xirr"];
function isExportableVisualization(visType: VisType): boolean {
    return !nonExportableVisTypes.includes(visType);
}

interface IOptionsButtonProps {
    widget: IWidget;
    visType: VisType;
    onClick: () => void;
    isMenuOpen: boolean;
}

const OptionsButtonCore: React.FC<IOptionsButtonProps & WrappedComponentProps> = ({
    onClick,
    widget,
    visType,
    intl,
    isMenuOpen,
}) => {
    const onOptionsMenuClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.stopPropagation();
            onClick();
        },
        [onClick],
    );

    const settings = useDashboardSelector(selectSettings);
    const permissions = useDashboardSelector(selectPermissions);
    const areExportsEnabled = settings.enableKPIDashboardExport;
    const hasExportReportPermissions = permissions.canExportReport;

    const isExportableVisType = isExportableVisualization(visType);

    const canExportWidget = areExportsEnabled && hasExportReportPermissions && isExportableVisType;

    if (!canExportWidget) {
        return null;
    }

    const widgetRefValue = widgetRef(widget);
    const objRefAsString = widgetRefValue ? objRefToString(widgetRefValue) : "";

    const optionsClasses = cx("dash-item-action-placeholder", "s-dash-item-action-placeholder");

    const optionsIconClasses = cx(
        "dash-item-action-options",
        "s-dash-item-action-options",
        `dash-item-action-options-${stringUtils.simplifyText(objRefAsString)}`,
        `s-dash-item-action-options-${stringUtils.simplifyText(objRefAsString)}`,
        "gd-icon-download",
        {
            "dash-item-action-options-active": isMenuOpen,
        },
    );

    return (
        <div className={optionsClasses} onClick={onOptionsMenuClick}>
            <BubbleHoverTrigger className={optionsIconClasses} showDelay={500} hideDelay={0} tagName="div">
                <Bubble className="bubble-primary" alignPoints={[{ align: "tc bc" }, { align: "tc br" }]}>
                    <span>{intl.formatMessage({ id: "options.button.bubble" })}</span>
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};

export const OptionsButton = injectIntl(OptionsButtonCore);
