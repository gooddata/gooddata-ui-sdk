// (C) 2007-2025 GoodData Corporation

import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import cx from "classnames";
import { FormattedMessage, MessageDescriptor, defineMessage, defineMessages, useIntl } from "react-intl";

import { ICatalogDateDataset, ObjRef, objRefToString } from "@gooddata/sdk-model";
import {
    Button,
    Dropdown,
    DropdownButton,
    DropdownList,
    IAlignPoint,
    ScrollableItem,
    ShortenedText,
    isDateDatasetHeader,
} from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import {
    getDateConfigurationDropdownHeight,
    getSortedDateDatasetsItems,
    removeDateFromTitle,
} from "./utils.js";

const DEFAULT_HYPHEN_CHAR = "-";
const alignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];
const tooltipAlignPoints: IAlignPoint[] = [
    { align: "cl cr", offset: { x: -10, y: 0 } },
    { align: "cr cl", offset: { x: 10, y: 0 } },
];
const DROPDOWN_MIN_HEIGHT = 170;
const DEFAULT_DROPDOWN_ITEM_HEIGHT = 28;

interface IDateDatasetsListItemProps {
    id?: string;
    title?: string;
    isHeader?: boolean;
    isSelected?: boolean;
    isUnrelated?: boolean;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
}

// work around the evil DateDatasetsListItem from kit that magically translates SOME of the items' titles
// this way the i18n actually has a chance to detect these
const dateDatasetHeaderMessages: Record<string, MessageDescriptor> = defineMessages({
    "gs.date.date-dataset.recommended": { id: "gs.date.date-dataset.recommended" },
    "gs.date.date-dataset.other": { id: "gs.date.date-dataset.other" },
    "gs.date.date-dataset.related": { id: "gs.date.date-dataset.related" },
    "gs.date.date-dataset.unrelated": { id: "gs.date.date-dataset.unrelated" },
});

function DateDatasetsListItem({
    id,
    title = "",
    isHeader,
    isSelected,
    isUnrelated,
    onClick,
}: IDateDatasetsListItemProps) {
    if (isHeader) {
        return <div className="gd-list-item gd-list-item-header">{title}</div>;
    }

    const classNames = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        `s-${id}`,
        `s-${stringUtils.simplifyText(title)}`,
        {
            "is-selected": isSelected,
            "is-unrelated": isUnrelated,
        },
    );

    return (
        <div className={classNames} onClick={onClick}>
            <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{title}</ShortenedText>
        </div>
    );
}

export interface IDateDatasetDropdownProps {
    autoOpen?: boolean;
    widgetRef: ObjRef;
    relatedDateDatasets: readonly ICatalogDateDataset[];
    activeDateDataset?: ICatalogDateDataset;
    unrelatedDateDataset?: ICatalogDateDataset;
    dateFromVisualization?: ICatalogDateDataset;
    onDateDatasetChange: (id: string) => void;
    className?: string;
    width: number;
    isLoading?: boolean;
    enableUnrelatedItemsVisibility?: boolean;
    unrelatedDateDatasets: readonly ICatalogDateDataset[] | undefined;
}

interface IDateDatasetsDropdownState {
    width: number;
    height: number;
}

export function DateDatasetDropdown(props: IDateDatasetDropdownProps) {
    const {
        className = "s-date-dataset-switch",
        isLoading = false,
        autoOpen = false,
        onDateDatasetChange,
        activeDateDataset,
        unrelatedDateDataset,
        dateFromVisualization,
        relatedDateDatasets,
        widgetRef,
        enableUnrelatedItemsVisibility,
        unrelatedDateDatasets,
    } = props;

    const intl = useIntl();
    const { onItemScroll, closeOnParentScroll } = useAutoScroll(autoOpen);
    const [showUnavailableItems, setShowUnavailableItems] = useState(false);

    const unrelatedDateDataSetId = unrelatedDateDataset ? unrelatedDateDataset.dataSet.id : null;
    let activeDateDataSetId: string;
    let activeDateDataSetTitle = DEFAULT_HYPHEN_CHAR;
    let activeDateDataSetUri: string;
    let recommendedDateDataSet: ICatalogDateDataset | undefined;

    if (!isLoading && activeDateDataset) {
        activeDateDataSetId = activeDateDataset.dataSet.id;
        activeDateDataSetTitle = activeDateDataset.dataSet.title;
        activeDateDataSetUri = activeDateDataset.dataSet.uri;
    }

    if (dateFromVisualization) {
        recommendedDateDataSet = relatedDateDatasets.find(
            (d) => d.dataSet.uri === dateFromVisualization.dataSet.uri,
        );
    }

    const sortedItems = getSortedDateDatasetsItems(
        relatedDateDatasets,
        recommendedDateDataSet,
        unrelatedDateDataset,
        unrelatedDateDatasets,
        enableUnrelatedItemsVisibility && showUnavailableItems,
    );
    const unrelatedDateDatasetCount = (unrelatedDateDatasets?.length ?? 0) - (unrelatedDateDataset ? 1 : 0);

    const buttonRef = useRef<HTMLDivElement | null>(null);
    const [{ height, width }, setDropdownDimensions] = useState<IDateDatasetsDropdownState>({
        width: props.width,
        height: DROPDOWN_MIN_HEIGHT,
    });
    const dropdownBodyHeight = (sortedItems?.length || 0) * DEFAULT_DROPDOWN_ITEM_HEIGHT;

    useEffect(() => {
        const buttonRect = buttonRef?.current?.getBoundingClientRect();
        const calculatedWidth = buttonRect?.width ?? 0;
        const calculatedHeight = getDateConfigurationDropdownHeight(
            buttonRect?.top ?? 0,
            buttonRect?.height ?? 0,
            dropdownBodyHeight,
            !unrelatedDateDatasets?.length,
        );
        setDropdownDimensions({ width: calculatedWidth, height: calculatedHeight });
    }, [dropdownBodyHeight, unrelatedDateDatasets, buttonRef]);

    const onShowHideUnrelatedItemsClick = () => {
        setShowUnavailableItems(!showUnavailableItems);
    };

    const renderDropdownBody = ({ closeDropdown }: { closeDropdown: () => void }) => {
        if (isLoading) {
            return null;
        }

        return (
            <div style={{ width }}>
                <DropdownList
                    className="configuration-dropdown dataSets-list"
                    height={height}
                    width={width}
                    items={sortedItems}
                    itemsCount={sortedItems.length}
                    renderItem={({ item }) => {
                        const isHeader = isDateDatasetHeader(item);
                        const isSelected = !isDateDatasetHeader(item) && activeDateDataSetId === item.id;
                        const isUnrelated = !isDateDatasetHeader(item) && unrelatedDateDataSetId === item.id;
                        return (
                            <DateDatasetsListItem
                                title={
                                    isHeader
                                        ? intl.formatMessage(dateDatasetHeaderMessages[item.title])
                                        : removeDateFromTitle(item.title)
                                }
                                isHeader={isHeader}
                                isSelected={isSelected}
                                isUnrelated={isUnrelated}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isDateDatasetHeader(item)) {
                                        return;
                                    }
                                    closeDropdown();
                                    onDateDatasetChange(item.id);
                                }}
                            />
                        );
                    }}
                />

                {enableUnrelatedItemsVisibility && unrelatedDateDatasetCount > 0 ? (
                    <div className="gd-list-footer">
                        <FormattedMessage
                            id={"gs.date.date-dataset.unrelated_hidden"}
                            values={{
                                count: unrelatedDateDatasetCount,
                                isShow: showUnavailableItems,
                            }}
                        />
                        <Button
                            onClick={onShowHideUnrelatedItemsClick}
                            className="gd-button-link-dimmed unrelated-date-button"
                            value={intl.formatMessage({
                                id: showUnavailableItems
                                    ? defineMessage({ id: "gs.date.date-dataset.unrelated.hide" }).id
                                    : defineMessage({ id: "gs.date.date-dataset.unrelated.show" }).id,
                            })}
                        />
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <Dropdown
            // We want to open the dropdown, when user selects a metric
            // without a recommended data set
            key={`${objRefToString(widgetRef)}_${autoOpen}`}
            openOnInit={autoOpen}
            ignoreClicksOnByClass={[".dash-content"]}
            renderButton={({ isOpen, toggleDropdown }) => {
                const buttonClassName = cx("s-date-dataset-button", isOpen ? "s-expanded" : "s-collapsed", {
                    "is-loading": isLoading,
                    "is-unrelated":
                        !isLoading &&
                        unrelatedDateDataset &&
                        unrelatedDateDataset.dataSet.uri === activeDateDataSetUri,
                });

                const buttonValue = isLoading
                    ? intl.formatMessage({ id: "loading" })
                    : removeDateFromTitle(activeDateDataSetTitle);

                return (
                    <ScrollableItem scrollIntoView={autoOpen} onItemScrolled={onItemScroll}>
                        <div
                            ref={(ref) => {
                                if (ref && ref !== buttonRef.current) {
                                    buttonRef.current = ref;
                                }
                            }}
                        >
                            <DropdownButton
                                className={buttonClassName}
                                value={buttonValue}
                                isOpen={isOpen}
                                onClick={toggleDropdown}
                                disabled={isLoading}
                            />
                        </div>
                    </ScrollableItem>
                );
            }}
            className={className}
            closeOnParentScroll={closeOnParentScroll}
            closeOnMouseDrag
            alignPoints={alignPoints}
            renderBody={renderDropdownBody}
        />
    );
}

/**
 * Purpose of this hook is keep value of closeOnParentScroll derived from autoOpen
 * We need set closeOnParentScroll to false and after item scrolled return to true
 * otherwise dropdown is immediately closed when item is scrolled to view
 */
export function useAutoScroll(autoOpen: boolean) {
    const [closeOnParentScroll, setCloseOnParentScroll] = useState<boolean>(!autoOpen);

    useEffect(() => {
        setCloseOnParentScroll(!autoOpen);
    }, [autoOpen]);

    const onItemScroll = useCallback(() => {
        setTimeout(() => {
            setCloseOnParentScroll(true);
        }, 300);
    }, []);

    return {
        onItemScroll,
        closeOnParentScroll,
    };
}
