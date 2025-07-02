// (C) 2024-2025 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import {
    bemFactory,
    Icon,
    OverlayController,
    OverlayControllerProvider,
    UiLink,
    UiTooltip,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
import { selectIsWhiteLabeled, useDashboardSelector } from "../../../model/index.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

const tooltipBem = bemFactory("gd-container-tooltip");

export const AddDashboardLayoutWidgetButton: React.FC = () => {
    const isMobileDevice = useMediaQuery("mobileDevice");
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const theme = useTheme();

    return (
        <div className="add-item-placeholder add-panel-item s-add-dashboard-layout">
            <Icon.ColumnContainer color={theme?.palette?.complementary?.c6 ?? "#94a1ad"} />
            <div className={"add-panel-item__text"}>
                <FormattedMessage id="addPanel.dashboardLayout" />
                <OverlayControllerProvider overlayController={overlayController}>
                    <UiTooltip
                        arrowPlacement={"left"}
                        content={
                            <div className={tooltipBem.b()}>
                                <div className={tooltipBem.e("image")} />

                                <div className={tooltipBem.e("text")}>
                                    <FormattedMessage id="addPanel.dashboardLayout.tooltip" />
                                </div>

                                <div className={tooltipBem.e("actions")}>
                                    {!isWhiteLabeled ? (
                                        <UiLink
                                            variant={"inverse"}
                                            rel={"noreferrer noopener"}
                                            target={"_blank"}
                                            href={
                                                "https://www.gooddata.com/docs/cloud/create-dashboards/dashboard-layout/"
                                            }
                                        >
                                            <FormattedMessage
                                                id={"addPanel.dashboardLayout.tooltip.learnMore"}
                                            />
                                        </UiLink>
                                    ) : null}
                                </div>
                            </div>
                        }
                        anchor={
                            <div
                                className={cx("s-description-trigger gd-add-item-placeholder-help-trigger", {
                                    "is-mobile": isMobileDevice,
                                })}
                            >
                                <div className="gd-icon-circle-question" />
                            </div>
                        }
                        optimalPlacement
                        triggerBy={["hover"]}
                    />
                </OverlayControllerProvider>
            </div>
        </div>
    );
};
