// (C) 2021-2022 GoodData Corporation
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
    Button,
    DEFAULT_ITEM_HEIGHT,
    DEFAULT_MOBILE_ITEM_HEIGHT,
    LegacyInvertableList,
    LOADING_HEIGHT,
    LoadingMask,
    NoData,
} from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import { AllItemsFilteredMessage } from "./AllItemsFilteredMessage";
import { ItemsFilteredMessage } from "./ItemsFilteredMessage";
import { ConfigurationButton } from "./configuration/ConfigurationButton";
import { DeleteButton } from "./DeleteButton";
import { IntlWrapper } from "../../../localization";
import min from "lodash/min";
import max from "lodash/max";
import isEmpty from "lodash/isEmpty";
import {
    AttributeListItem,
    IAttributeDropdownBodyExtendedProps,
    isEmptyListItem,
} from "@gooddata/sdk-ui-filters";
import { IAttributeElement } from "@gooddata/sdk-model";
import AttributeDropdownListItem from "./AttributeDropdownListItem";
import {
    selectLocale,
    useDashboardSelector,
    selectIsInEditMode,
    selectSupportsElementUris,
} from "../../../../model";
import { AttributeFilterConfiguration } from "./configuration/AttributeFilterConfiguration";

const MAX_SELECTION_SIZE = 500;
const MAX_LIST_HEIGHT = 392;
const CONFIGURATION_BUTTON_HEIGHT = 40;
const PARENT_FILTER_MESSAGE_HEIGHT = 30;
const LIST_EXTRAS = 143;
const MOBILE_LIST_EXTRAS = 167;
const LIST_ITEM_HEIGHT = 28;
const MOBILE_LIST_ITEM_HEIGHT = 40;

const AttributeFilterBodyCore: React.FC<IAttributeDropdownBodyExtendedProps> = (props) => {
    const {
        parentFilterTitles,
        isElementsLoading,
        searchString,
        items,
        width,
        isLoaded,
        showItemsFilteredMessage,
        showDeleteButton,
        deleteFilter,
        onCloseButtonClicked,
        onApplyButtonClicked,
        applyDisabled,
        isMobile,
        attributeFilterRef,
    } = props;

    const emptyValueKey = uuid();

    const hasNoData =
        !searchString && !parentFilterTitles?.length && !isElementsLoading && items.length === 0;
    const currentItemHeight = isMobile ? DEFAULT_MOBILE_ITEM_HEIGHT : DEFAULT_ITEM_HEIGHT;

    const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);

    const intl = useIntl();
    const classNames = cx({
        "attributevalues-list": true,
        "gd-flex-item-stretch-mobile": isMobile,
        "gd-flex-row-container-mobile": isMobile,
    });

    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isSupportElementUris = useDashboardSelector(selectSupportsElementUris);

    const getElementsList = (items: AttributeListItem[], emptyString: string) => {
        return items.map((item) => {
            // for empty list items return an empty object -> this causes the underlying list to render an empty row (without checkboxes)
            if (isEmptyListItem(item)) {
                return {} as any;
            }

            const replaceWithEmpty = isSupportElementUris
                ? isEmpty(item?.title) && !isEmpty(item?.uri)
                : isEmpty(item?.title);

            // set "empty value" title only to items that have empty title but not URL (in case the backend capability
            // `supportsElementUris` is set to `true`)
            // this is to distinguish between elements that have not been loaded yet and those who have and have empty title
            return replaceWithEmpty
                ? {
                      ...item,
                      title: emptyString,
                  }
                : item;
        });
    };

    function getDropdownBodyHeight(): number {
        const winHeight = window.innerHeight;
        const itemHeight = isMobile ? MOBILE_LIST_ITEM_HEIGHT : LIST_ITEM_HEIGHT;
        const listExtras = isMobile ? MOBILE_LIST_EXTRAS : LIST_EXTRAS;

        const configurationButtonHeight = props.showConfigurationButton ? CONFIGURATION_BUTTON_HEIGHT : 0;
        const filteredItemsMessageHeight = props.showItemsFilteredMessage ? PARENT_FILTER_MESSAGE_HEIGHT : 0;
        const availableWindowHeight =
            winHeight - listExtras - configurationButtonHeight - filteredItemsMessageHeight;

        const maxListHeight = isMobile ? availableWindowHeight : MAX_LIST_HEIGHT;

        const listItemsHeight = itemHeight * props.totalCount;
        const minHeight = min([maxListHeight, availableWindowHeight, listItemsHeight]);
        return max([itemHeight, minHeight])!;
    }

    const isFilteredOutByParents =
        !isElementsLoading && parentFilterTitles?.length && !searchString && !items.length;

    const list = isFilteredOutByParents ? (
        <AllItemsFilteredMessage parentFilterTitles={parentFilterTitles!} />
    ) : hasNoData ? (
        <NoData noDataLabel={intl.formatMessage({ id: "attributesDropdown.noData" })} />
    ) : (
        <LegacyInvertableList
            selection={props.selectedItems}
            filteredItemsCount={props.totalCount}
            onSearch={props.onSearch}
            onSelect={props.onSelect}
            onRangeChange={props.onRangeChange}
            isInverted={props.isInverted}
            items={getElementsList(
                props.items,
                intl.formatMessage({ id: "attributeFilterDropdown.emptyValue" }),
            )}
            listItemClass={AttributeDropdownListItem}
            itemsCount={props.totalCount}
            isLoading={isElementsLoading}
            isLoadingClass={LoadingMask}
            getItemKey={(item: IAttributeElement) => item?.uri || emptyValueKey}
            itemHeight={currentItemHeight}
            height={getDropdownBodyHeight()}
            searchPlaceholder={intl.formatMessage({ id: "attributeFilterDropdown.searchPlaceholder" })}
            maxSelectionSize={MAX_SELECTION_SIZE}
            noItemsFound={!props.items.length}
            searchString={props.searchString}
        />
    );

    const currentWidth = width || 245;
    const actionsClassnames = cx("gd-dialog-footer dropdown-footer", {
        "dropdown-footer-mobile": isMobile,
    });
    const attributeValuesStyles = useMemo(() => {
        return {
            width: isMobile ? "auto" : currentWidth,
            overflow: isMobile ? "hidden" : undefined,
        };
    }, [isMobile, currentWidth]);

    return (
        <div className={classNames} style={attributeValuesStyles}>
            {isConfigurationOpen ? (
                <AttributeFilterConfiguration
                    closeHandler={() => setIsConfigurationOpen(false)}
                    filterRef={attributeFilterRef}
                    onChange={() => {}}
                />
            ) : (
                <>
                    {isLoaded ? list : <LoadingMask height={LOADING_HEIGHT} />}
                    {isLoaded && (
                        <>
                            {showItemsFilteredMessage && (
                                <ItemsFilteredMessage parentFilterTitles={parentFilterTitles!} />
                            )}
                            {isEditMode && (
                                <ConfigurationButton setIsConfigurationOpen={setIsConfigurationOpen} />
                            )}
                            {!hasNoData && (
                                <div className={actionsClassnames}>
                                    {showDeleteButton && deleteFilter && (
                                        <DeleteButton deleteFilter={deleteFilter} />
                                    )}
                                    <Button
                                        key="cancel-button"
                                        className="gd-button-secondary s-cancel_button"
                                        value={intl.formatMessage({ id: "cancel" })}
                                        disabled={false}
                                        onClick={onCloseButtonClicked}
                                    />
                                    <Button
                                        key="apply-button"
                                        className="gd-button-action s-apply_button"
                                        value={intl.formatMessage({ id: "apply" })}
                                        disabled={applyDisabled}
                                        onClick={onApplyButtonClicked}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export const AttributeFilterBody: React.FC<IAttributeDropdownBodyExtendedProps> = (props) => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <AttributeFilterBodyCore {...props} />
        </IntlWrapper>
    );
};
