// (C) 2007-2022 GoodData Corporation
import { areObjRefsEqual, ICatalogMeasure, IMeasureMetadataObject, ObjRef } from "@gooddata/sdk-model";
import { Dropdown, DropdownButton, DropdownList, IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import debounce from "lodash/debounce";
import React, { Component, createRef } from "react";
import { useIntl, WrappedComponentProps } from "react-intl";

import {
    useDashboardSelector,
    selectCatalogMeasures,
    selectEnableRenamingMeasureToMetric,
} from "../../../../model";

import { CONFIG_PANEL_INNER_WIDTH } from "./constants";

const alignPoints: IAlignPoint[] = [{ align: "bl tl" }];
const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -10, y: 0 } }];

const LIST_EXTRAS = 58; // search field + top/bottom borders
const LIST_ITEM_HEIGHT = 28;
const MAX_LIST_HEIGHT = 294;

interface IMetricListItemProps {
    item?: IMeasureMetadataObject;
    isSelected?: boolean;
    unlistedTitle: string;
    unlistedIconTitle: string;
    isMobile?: boolean;
    onClick?: () => void;
}

const MetricListItem: React.FC<IMetricListItemProps> = ({
    item,
    isSelected,
    unlistedTitle,
    unlistedIconTitle,
    isMobile,
    onClick,
}) => {
    if (!item) {
        return null;
    }

    const unlistedIcon = item?.unlisted ? (
        <span title={unlistedIconTitle} className="gd-icon-16 gd-icon-unlisted" />
    ) : (
        false
    );

    const effectiveTitle = item?.unlisted ? unlistedTitle : item.title;

    const metricItemClassNames = cx(`s-${stringUtils.simplifyText(effectiveTitle)}`, {
        "gd-list-item": true,
        "gd-list-item-shortened": true,
        "is-selected": isSelected,
    });

    const title = isMobile ? (
        effectiveTitle
    ) : (
        <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{effectiveTitle}</ShortenedText>
    );

    return (
        <div key={item.id} className={metricItemClassNames} onClick={onClick}>
            {title}
            {unlistedIcon}
        </div>
    );
};

interface IMetricDropdownStateProps {
    measures: ICatalogMeasure[];
}
interface IMetricDropdownOwnProps {
    workspace: string;
    openOnInit?: boolean;
    selectedItems: ObjRef[];
    bodyClassName: string;
    onSelect: (item: IMeasureMetadataObject) => void;
}

interface IMetricDropdownProps
    extends IMetricDropdownStateProps,
        IMetricDropdownOwnProps,
        WrappedComponentProps {
    shouldRenameMeasureToMetric: boolean;
}

interface IMetricDropdownState {
    searchQuery: string;
}

class MetricDropdownInner extends Component<IMetricDropdownProps, IMetricDropdownState> {
    buttonRef = createRef<HTMLDivElement>();

    state: IMetricDropdownState = {
        searchQuery: "",
    };

    onSearch = debounce((searchQuery: string) => {
        this.setState({ searchQuery });
    }, 250);

    getButtonValue = () => {
        const { intl, selectedItems, measures } = this.props;
        const selectedItem = selectedItems.length
            ? measures.find((m) => areObjRefsEqual(m.measure.ref, selectedItems[0]))
            : undefined;

        if (selectedItem?.measure?.title) {
            return selectedItem.measure.title;
        }

        return intl.formatMessage({ id: "configurationPanel.selectMeasurePlaceholder" });
    };

    calculateHeight = (itemsCount = this.props.measures?.length) => {
        const winHeight = window.innerHeight;
        const dropdownButtonBottom = this.buttonRef.current
            ? this.buttonRef.current.getBoundingClientRect().bottom
            : 0;
        const minHeight = Math.min(
            winHeight - dropdownButtonBottom - LIST_EXTRAS,
            MAX_LIST_HEIGHT,
            LIST_ITEM_HEIGHT * itemsCount,
        );
        return Math.max(LIST_ITEM_HEIGHT, minHeight);
    };

    onOpenStateChanged = (isOpen: boolean): void => {
        if (isOpen && this.state.searchQuery) {
            this.setState({
                searchQuery: "",
            });
        }
    };

    render() {
        const {
            intl,
            onSelect,
            bodyClassName,
            selectedItems,
            measures,
            openOnInit,
            shouldRenameMeasureToMetric,
        } = this.props;
        const { searchQuery } = this.state;
        const [selectedItem] = selectedItems;
        const buttonValue = this.getButtonValue();
        const filteredMeasures = searchQuery
            ? measures.filter((m) => m.measure.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : measures;
        const height = this.calculateHeight(filteredMeasures.length) || MAX_LIST_HEIGHT;

        return (
            <Dropdown
                alignPoints={alignPoints}
                className="s-metric_select"
                closeOnMouseDrag
                openOnInit={openOnInit}
                ignoreClicksOnByClass={[".dash-content"]}
                onOpenStateChanged={this.onOpenStateChanged}
                renderButton={({ isOpen, toggleDropdown }) => (
                    <div ref={this.buttonRef}>
                        <DropdownButton
                            className={shouldRenameMeasureToMetric ? "type-metric" : "type-measure"}
                            isSmall
                            value={buttonValue}
                            isOpen={isOpen}
                            onClick={toggleDropdown}
                        />
                    </div>
                )}
                renderBody={({ closeDropdown }) => (
                    <div className={cx(bodyClassName, "metrics-dropdown")}>
                        <DropdownList
                            items={filteredMeasures}
                            searchFieldSize="small"
                            showSearch
                            onSearch={this.onSearch}
                            searchString={searchQuery}
                            height={height}
                            width={CONFIG_PANEL_INNER_WIDTH}
                            // disabling autofocus for now as it causes the page to scroll to top for no reason
                            disableAutofocus
                            renderItem={({ item }) => {
                                return (
                                    <MetricListItem
                                        item={item.measure}
                                        isSelected={areObjRefsEqual(selectedItem, item.measure.ref)}
                                        unlistedTitle={intl.formatMessage({
                                            id: "configurationPanel.unlistedMetric",
                                        })}
                                        unlistedIconTitle={intl.formatMessage({
                                            id: "configurationPanel.unlistedMetricIconTitle",
                                        })}
                                        onClick={() => {
                                            onSelect(item.measure);
                                            closeDropdown();
                                        }}
                                    />
                                );
                            }}
                        />
                    </div>
                )}
            />
        );
    }
}

export const MetricDropdown = (props: IMetricDropdownOwnProps) => {
    const measures = useDashboardSelector(selectCatalogMeasures);
    const shouldRenameMeasureToMetric = useDashboardSelector(selectEnableRenamingMeasureToMetric);
    const intl = useIntl();

    return (
        <MetricDropdownInner
            shouldRenameMeasureToMetric={shouldRenameMeasureToMetric}
            intl={intl}
            measures={measures}
            {...props}
        />
    );
};
