// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { debounce } from "lodash-es";
import { FormattedMessage, type MessageDescriptor, defineMessage, defineMessages, useIntl } from "react-intl";

import { type ICatalogDateDataset, type ObjRef, objRefToString } from "@gooddata/sdk-model";
import {
    Button,
    DATE_DATASET_LIST_ITEM_CLASSNAME,
    DateDatasetsListItem,
    Dropdown,
    DropdownButton,
    DropdownList,
    type IAlignPoint,
    ScrollableItem,
    isDateDatasetHeader,
} from "@gooddata/sdk-ui-kit";

import {
    getDateConfigurationDropdownHeight,
    getDateDatasetDropdownWidth,
    getSortedDateDatasetsItems,
    removeDateFromTitle,
} from "./utils.js";

const DEFAULT_HYPHEN_CHAR = "-";
const alignPoints: IAlignPoint[] = [
    { align: "bl tl" },
    { align: "tl bl" },
    { align: "br tr" },
    { align: "tr br" },
];
const DROPDOWN_MIN_HEIGHT = 170;
const DEFAULT_DROPDOWN_ITEM_HEIGHT = 28;
const EVENT_DEBOUNCE_MILLISECONDS = 60;

function measureScrollbarWidth(): number {
    const probe = document.createElement("div");
    probe.className = "s-date-dataset-scrollbar-probe";
    probe.style.position = "absolute";
    probe.style.top = "-9999px";
    probe.style.left = "-9999px";
    probe.style.width = "100px";
    probe.style.height = "100px";
    probe.style.overflow = "scroll";
    document.body.appendChild(probe);

    const scrollbarWidth = probe.offsetWidth - probe.clientWidth;
    document.body.removeChild(probe);

    return scrollbarWidth;
}

function measureLongestItemWidth(titles: string[]): number {
    if (titles.length === 0) {
        return 0;
    }

    const probe = document.createElement("div");
    probe.className = `${DATE_DATASET_LIST_ITEM_CLASSNAME} is-selected s-date-dataset-width-probe`;
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    probe.style.top = "-9999px";
    probe.style.left = "-9999px";

    const text = document.createElement("span");
    text.className = "shortened is-whole";
    probe.appendChild(text);
    document.body.appendChild(probe);

    let maxWidth = 0;
    for (const title of titles) {
        text.textContent = title;
        maxWidth = Math.max(maxWidth, probe.getBoundingClientRect().width);
    }

    document.body.removeChild(probe);

    return Math.ceil(maxWidth);
}

// pre-translate header titles before handing them to the kit's DateDatasetsListItem,
// which renders whatever title it's given as-is (see DateDatasetsDropdown.tsx in AD for the same pattern)
const dateDatasetHeaderMessages: Record<string, MessageDescriptor> = defineMessages({
    "gs.date.date-dataset.recommended": { id: "gs.date.date-dataset.recommended" },
    "gs.date.date-dataset.other": { id: "gs.date.date-dataset.other" },
    "gs.date.date-dataset.related": { id: "gs.date.date-dataset.related" },
    "gs.date.date-dataset.unrelated": { id: "gs.date.date-dataset.unrelated" },
});

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

    const sortedItems = useMemo(
        () =>
            getSortedDateDatasetsItems(
                relatedDateDatasets,
                recommendedDateDataSet,
                unrelatedDateDataset,
                unrelatedDateDatasets,
                enableUnrelatedItemsVisibility && showUnavailableItems,
            ),
        [
            relatedDateDatasets,
            recommendedDateDataSet,
            unrelatedDateDataset,
            unrelatedDateDatasets,
            enableUnrelatedItemsVisibility,
            showUnavailableItems,
        ],
    );
    const unrelatedDateDatasetCount = (unrelatedDateDatasets?.length ?? 0) - (unrelatedDateDataset ? 1 : 0);

    const buttonRef = useRef<HTMLDivElement | null>(null);
    const [{ height, width }, setDropdownDimensions] = useState<IDateDatasetsDropdownState>({
        width: props.width,
        height: DROPDOWN_MIN_HEIGHT,
    });
    const dropdownBodyHeight = (sortedItems?.length || 0) * DEFAULT_DROPDOWN_ITEM_HEIGHT;
    const measuredContentWidthRef = useRef(0);
    const scrollbarWidthRef = useRef<number | null>(null);

    // Cheap: only reads the button's current position/size plus the content width already
    // measured below, so it's safe to run on every debounced resize/scroll. The scrollbar
    // width is measured lazily, on first actual need, and cached — never during render, so
    // this stays safe for SSR/non-DOM environments.
    const recalculateDimensions = useCallback(() => {
        const buttonRect = buttonRef.current?.getBoundingClientRect();
        const calculatedHeight = getDateConfigurationDropdownHeight(
            buttonRect?.top ?? 0,
            buttonRect?.height ?? 0,
            dropdownBodyHeight,
            !unrelatedDateDatasets?.length,
        );
        let contentWidth = measuredContentWidthRef.current;
        if (dropdownBodyHeight > calculatedHeight) {
            scrollbarWidthRef.current ??= measureScrollbarWidth();
            contentWidth += scrollbarWidthRef.current;
        }
        const calculatedWidth = getDateDatasetDropdownWidth(
            buttonRect?.width ?? 0,
            contentWidth,
            buttonRect?.left ?? 0,
            buttonRect?.right ?? 0,
        );
        setDropdownDimensions({ width: calculatedWidth, height: calculatedHeight });
    }, [dropdownBodyHeight, unrelatedDateDatasets]);

    // Expensive: builds a DOM probe and measures every title, so it only re-runs when the
    // actual item list changes, not on every resize/scroll.
    useLayoutEffect(() => {
        const titles = sortedItems.map((item) =>
            isDateDatasetHeader(item)
                ? intl.formatMessage(dateDatasetHeaderMessages[item.title])
                : removeDateFromTitle(item.title),
        );
        measuredContentWidthRef.current = measureLongestItemWidth(titles);
        recalculateDimensions();
    }, [sortedItems, intl, recalculateDimensions]);

    useEffect(() => {
        const debouncedRecalculate = debounce(recalculateDimensions, EVENT_DEBOUNCE_MILLISECONDS);
        window.addEventListener("resize", debouncedRecalculate);
        window.addEventListener("scroll", debouncedRecalculate, true);

        return () => {
            debouncedRecalculate.cancel();
            window.removeEventListener("resize", debouncedRecalculate);
            window.removeEventListener("scroll", debouncedRecalculate, true);
        };
    }, [recalculateDimensions]);

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
                    renderItem={({ item, width: itemWidth }) => {
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
                                width={itemWidth}
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
                    "is-unrelated": !isLoading && unrelatedDateDataset?.dataSet.uri === activeDateDataSetUri,
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
