// (C) 2020-2022 GoodData Corporation
import { IInsightWidget, insightIsLocked } from "@gooddata/sdk-model";
import React from "react";
import { Item, ItemsWrapper } from "@gooddata/sdk-ui-kit";

import { selectInsightByRef, useDashboardSelector } from "../../../../model";
import InsightConfigurationWrapper from "./InsightConfigurationWrapper";
import { useIntl } from "react-intl";

interface IInsightConfigurationItemsProps {
    selectedWidget: IInsightWidget;
    // showInteractionItem: boolean;
    handleConfigurationItemClick: () => void;
    // handleInteractionsItemClick: () => void;
    onCloseButtonClick: () => void;
    // onWidgetDelete: (e: React.MouseEvent<HTMLDivElement>) => void;
    // handleRenderInsightConfiguration: (isRender: boolean) => void;
    // isHidingOfWidgetTitleEnabled: boolean;
}

export default function InsightConfigurationItems(props: IInsightConfigurationItemsProps) {
    const {
        handleConfigurationItemClick,
        // handleInteractionsItemClick,
        // handleRenderInsightConfiguration,
        // showInteractionItem,
        // onWidgetDelete,
        ...restProps
    } = props;

    const intl = useIntl();

    // useEffect(() => {
    //     handleRenderInsightConfiguration(true);
    // }, [handleRenderInsightConfiguration]);
    //
    // const onEditItemClick = () => {
    //     if (!canEditInsight) {
    //         return;
    //     }
    //     handleOpenEditInsightOverlay(true, widgetRef);
    // };

    const insight = useDashboardSelector(selectInsightByRef(props.selectedWidget?.insight));

    const isLocked = insight && insightIsLocked(insight);

    return (
        <InsightConfigurationWrapper canEditInsight isLocked={isLocked} {...restProps}>
            <ItemsWrapper style={{ width: "100%" }} smallItemsSpacing>
                <Item subMenu onClick={handleConfigurationItemClick}>
                    <span>
                        <i className="gd-icon-settings" />
                        {intl.formatMessage({ id: "configurationPanel.title" })}
                    </span>
                </Item>
                {/*{showInteractionItem && (*/}
                {/*    <Item subMenu onClick={handleInteractionsItemClick}>*/}
                {/*        <Icon.Interaction className="item-icon" color={theme?.palette?.complementary?.c5} />*/}
                {/*        <span className="item-label">*/}
                {/*            {intl.formatMessage({ id: "configurationPanel.interactions" })}*/}
                {/*        </span>*/}
                {/*    </Item>*/}
                {/*)}*/}
                {/*<Separator />*/}
                {/*{canEditInsight && (*/}
                {/*    <React.Fragment>*/}
                {/*        <Item*/}
                {/*            className={cx(*/}
                {/*                "gd-list-item",*/}
                {/*                "gd-menu-item",*/}
                {/*                "options-menu-edit-insight s-options-menu-edit-insight",*/}
                {/*            )}*/}
                {/*            onClick={onEditItemClick}*/}
                {/*        >*/}
                {/*            <span>*/}
                {/*                <i className="gd-icon-pencil" />*/}
                {/*                {intl.formatMessage({ id: "controlButtons.edit.value" })}*/}
                {/*            </span>*/}
                {/*        </Item>*/}
                {/*        <Separator />*/}
                {/*    </React.Fragment>*/}
                {/*)}*/}
                {/*<Item className="gd-list-item gd-menu-item s-delete-insight-item" onClick={onWidgetDelete}>*/}
                {/*    <span>*/}
                {/*        <i className="gd-icon-trash" />*/}
                {/*        {intl.formatMessage({ id: "configurationPanel.remove.form.dashboard" })}*/}
                {/*    </span>*/}
                {/*</Item>*/}
            </ItemsWrapper>
        </InsightConfigurationWrapper>
    );
}
