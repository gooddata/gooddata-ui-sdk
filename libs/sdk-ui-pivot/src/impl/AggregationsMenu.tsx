// (C) 2019 GoodData Corporation
import { Header, Item, ItemsWrapper } from "@gooddata/goodstrap/lib/List/MenuList";
import { attributeDescriptorLocalId, IAttributeDescriptor } from "@gooddata/sdk-backend-spi";
import {
    IExecutionDefinition,
    isMeasureValueFilter,
    ITotal,
    TotalType,
    measureValueFilterCondition,
    isRankingFilter,
} from "@gooddata/sdk-model";
import cx from "classnames";
import React from "react";
import { IntlShape } from "react-intl";
import BubbleHoverTrigger from "@gooddata/goodstrap/lib/Bubble/BubbleHoverTrigger";
import Bubble from "@gooddata/goodstrap/lib/Bubble/Bubble";
import noop from "lodash/noop";

import Menu from "../menu/Menu";
import { IOnOpenedChangeParams } from "../menu/MenuSharedTypes";
import { IMenuAggregationClickConfig } from "../types";
import menuHelper from "./aggregationsMenuHelper";
import AggregationsSubMenu from "./AggregationsSubMenu";
import { AVAILABLE_TOTALS, FIELD_TYPE_ATTRIBUTE } from "./agGridConst";
import { getParsedFields } from "./agGridUtils";
import { IColumnTotal } from "./aggregationsMenuTypes";
import { DataViewFacade } from "@gooddata/sdk-ui";

/*
 * TODO: same thing is in sdk-ui-ext .. but pivot must not depend on it. we may be in need of some lower-level
 *  project on which both of filters and ext can depend. perhaps the purpose of the new project would be to provide
 *  thin layer on top of goodstrap (?)
 */
const SHOW_DELAY_DEFAULT = 200;
const HIDE_DELAY_DEFAULT = 0;

export interface IAggregationsMenuProps {
    intl: IntlShape;
    isMenuOpened: boolean;
    isMenuButtonVisible: boolean;
    showSubmenu: boolean;
    colId: string;
    getExecutionDefinition: () => IExecutionDefinition;
    getDataView: () => DataViewFacade;
    getTotals?: () => ITotal[];
    onAggregationSelect: (clickConfig: IMenuAggregationClickConfig) => void;
    onMenuOpenedChange: ({ opened, source }: IOnOpenedChangeParams) => void;
}

export default class AggregationsMenu extends React.Component<IAggregationsMenuProps> {
    public render(): React.ReactNode {
        const { intl, colId, getDataView, isMenuOpened, onMenuOpenedChange } = this.props;

        // Because of Ag-grid react wrapper does not rerender the component when we pass
        // new gridOptions we need to pull the data manually on each render
        const dv: DataViewFacade = getDataView();
        if (!dv) {
            return null;
        }

        const rowAttributeDescriptors = dv.meta().dimensionItemDescriptors(0) as IAttributeDescriptor[];
        const isOneRowTable = rowAttributeDescriptors.length === 0;
        if (isOneRowTable) {
            return null;
        }

        const measureGroupHeader = dv.meta().measureGroupDescriptor();
        if (!measureGroupHeader) {
            return null;
        }

        const fields = getParsedFields(colId);
        const [lastFieldType, lastFieldId, lastFieldValueId = null] = fields[fields.length - 1];

        const isAttributeHeader = lastFieldType === FIELD_TYPE_ATTRIBUTE;
        const isColumnAttribute = lastFieldValueId === null;
        if (isAttributeHeader && isColumnAttribute) {
            return null;
        }

        const measureLocalIdentifiers = menuHelper.getHeaderMeasureLocalIdentifiers(
            measureGroupHeader.measureGroupHeader.items,
            lastFieldType,
            lastFieldId,
        );

        const totalsForHeader = this.getColumnTotals(measureLocalIdentifiers, isAttributeHeader);

        return (
            <Menu
                toggler={<div className="menu-icon" />}
                togglerWrapperClassName={this.getTogglerClassNames()}
                opened={isMenuOpened}
                onOpenedChange={onMenuOpenedChange}
                openAction={"click"}
                closeOnScroll={true}
            >
                <ItemsWrapper>
                    <div className="s-table-header-menu-content">
                        <Header>{intl.formatMessage({ id: "visualizations.menu.aggregations" })}</Header>
                        {this.renderMainMenuItems(
                            totalsForHeader,
                            measureLocalIdentifiers,
                            rowAttributeDescriptors,
                        )}
                    </div>
                </ItemsWrapper>
            </Menu>
        );
    }

    private getColumnTotals(measureLocalIdentifiers: string[], isAttributeHeader: boolean): IColumnTotal[] {
        const columnTotals = this.props.getTotals?.() ?? [];

        if (isAttributeHeader) {
            return menuHelper.getTotalsForAttributeHeader(columnTotals, measureLocalIdentifiers);
        }

        return menuHelper.getTotalsForMeasureHeader(columnTotals, measureLocalIdentifiers[0]);
    }

    private getTogglerClassNames() {
        const { isMenuButtonVisible, isMenuOpened } = this.props;

        return cx("s-table-header-menu", "gd-pivot-table-header-menu", {
            "gd-pivot-table-header-menu--show": isMenuButtonVisible,
            "gd-pivot-table-header-menu--hide": !isMenuButtonVisible,
            "gd-pivot-table-header-menu--open": isMenuOpened,
        });
    }

    private renderMenuItemContent(
        totalType: TotalType,
        onClick: () => void,
        isSelected: boolean,
        hasSubMenu = false,
        disabled: boolean,
        tooltipMessage?: string,
    ) {
        const { intl } = this.props;
        const onClickHandler = disabled ? noop : onClick;
        const itemElement = (
            <Item checked={isSelected} subMenu={hasSubMenu} disabled={disabled}>
                <div
                    onClick={onClickHandler}
                    className="gd-aggregation-menu-item-inner s-menu-aggregation-inner"
                >
                    {intl.formatMessage({
                        id: `visualizations.totals.dropdown.title.${totalType}`,
                    })}
                </div>
            </Item>
        );
        return disabled ? (
            <BubbleHoverTrigger showDelay={SHOW_DELAY_DEFAULT} hideDelay={HIDE_DELAY_DEFAULT}>
                {itemElement}
                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                    {tooltipMessage}
                </Bubble>
            </BubbleHoverTrigger>
        ) : (
            itemElement
        );
    }

    private getItemClassNames(totalType: TotalType): string {
        return cx("gd-aggregation-menu-item", "s-menu-aggregation", `s-menu-aggregation-${totalType}`);
    }

    private isTableFilteredByMeasureValue(): boolean {
        const definition = this.props.getExecutionDefinition();

        // ignore measure value filters without condition, these are not yet specified by the user and are not sent as part of the execution
        return definition.filters.some(
            (filter) => isMeasureValueFilter(filter) && !!measureValueFilterCondition(filter),
        );
    }

    private isTableFilteredByRankingFilter(): boolean {
        const definition = this.props.getExecutionDefinition();
        return definition.filters.some(isRankingFilter);
    }

    private renderMainMenuItems(
        columnTotals: IColumnTotal[],
        measureLocalIdentifiers: string[],
        rowAttributeDescriptors: IAttributeDescriptor[],
    ) {
        const { intl, onAggregationSelect, showSubmenu } = this.props;
        const firstAttributeIdentifier = attributeDescriptorLocalId(rowAttributeDescriptors[0]);
        const isFilteredByMeasureValue = this.isTableFilteredByMeasureValue();
        const isFilteredByRankingFilter = this.isTableFilteredByRankingFilter();

        return AVAILABLE_TOTALS.map((totalType: TotalType) => {
            const isSelected = menuHelper.isTotalEnabledForAttribute(
                firstAttributeIdentifier,
                totalType,
                columnTotals,
            );
            const attributeDescriptor = rowAttributeDescriptors[0];
            const onClick = () =>
                this.props.onAggregationSelect({
                    type: totalType,
                    measureIdentifiers: measureLocalIdentifiers,
                    include: !isSelected,
                    attributeIdentifier: attributeDescriptor.attributeHeader.localIdentifier,
                });
            const itemClassNames = this.getItemClassNames(totalType);

            const disabled = totalType === "nat" && (isFilteredByMeasureValue || isFilteredByRankingFilter);
            const cause = isFilteredByMeasureValue ? "mvf" : "ranking";
            const tooltipMessage = disabled
                ? intl.formatMessage({ id: `visualizations.totals.dropdown.tooltip.nat.disabled.${cause}` })
                : undefined;

            const renderSubmenu = !disabled && showSubmenu && rowAttributeDescriptors.length > 0;
            const toggler = this.renderMenuItemContent(
                totalType,
                onClick,
                isSelected,
                renderSubmenu,
                disabled,
                tooltipMessage,
            );

            return (
                <div className={itemClassNames} key={totalType}>
                    {renderSubmenu ? (
                        <AggregationsSubMenu
                            intl={intl}
                            totalType={totalType}
                            rowAttributeDescriptors={rowAttributeDescriptors}
                            columnTotals={columnTotals}
                            measureLocalIdentifiers={measureLocalIdentifiers}
                            onAggregationSelect={onAggregationSelect}
                            toggler={toggler}
                        />
                    ) : (
                        toggler
                    )}
                </div>
            );
        });
    }
}
