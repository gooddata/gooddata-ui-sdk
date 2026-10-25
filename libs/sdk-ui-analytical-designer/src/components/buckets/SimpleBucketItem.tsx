// (C) 2007-2026 GoodData Corporation

import { memo, useCallback } from "react";

import { type ConnectDragSource } from "@evil-internetmann/react-dnd";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type ObjRef } from "@gooddata/sdk-model";

import {
    changeBucketItemDisplayForm,
    changeBucketItemShowAllValues,
    toggleBucketItemExpanded,
} from "../../actions/buckets_actions.js";
import { normalizeDraggedItemType } from "../../models/bucket_rules.js";
import { DecoratedDateDataset } from "../../models/decorated_date_dataset.js";
import {
    type IGranularityOption,
    isFiscalGranularity,
    isStandardGranularity,
} from "../../models/granularity.js";
import { supportsAllAttributeValues } from "../../selectors/backend_capabilities_selector.js";
import {
    getDisplayFormsForBucketItemSelector,
    isFiscalCalendarActive as isFiscalCalendarActiveSelector,
    isStandardCalendarActive as isStandardCalendarActiveSelector,
    propertiesContainTooltipTextSelector,
} from "../../selectors/buckets_selector.js";
import { isStaticHyperLinkDisplayFormTextEnabled as isStaticHyperLinkDisplayFormTextEnabledSelector } from "../../selectors/ui_config_selector.js";
import { BucketItemService } from "../../services/bucket_item_service.js";
import { isRenamingBucketItem as isRenamingBucketItemSelector } from "../../services/buckets_service.js";
import { isLocationIconEnabled as isLocationIconEnabledSelector } from "../../services/reference_point_service.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";
import { type IDecoratedBucketItem, type IRawBucketItem } from "../../typings/buckets.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { getCatalogItemTitle } from "../../utils/translations.js";
import { getCatalogItemClassName } from "../catalog/item/CatalogItem.js";
import { hasLocationDisplayForm } from "../catalog/utils/locationAttribute.js";

import { AttributeBucketItemConfiguration } from "./AttributeBucketItemConfiguration.js";
import { DateConfiguration } from "./categories/DateConfiguration.js";
import { SimpleBucketItemHeader } from "./SimpleBucketItemHeader.js";

export interface ISimpleBucketItemOwnProps {
    bucketItem: IDecoratedBucketItem;
    connectDragSource: ConnectDragSource;
    dragHandle: boolean;
    /**
     * Kept for API compatibility only — the store value wins, exactly as it did under `connect`,
     * whose default mergeProps let the state props override the own props of the same name.
     */
    isLocationIconEnabled: boolean;
    localIdentifier?: string;
}

export type SimpleBucketItemProps = ISimpleBucketItemOwnProps;

export const SimpleBucketItem = memo(function SimpleBucketItem({
    bucketItem,
    localIdentifier: bucketLocalIdentifier = "",
    connectDragSource = null,
}: SimpleBucketItemProps) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const isRenamingBucketItem = useSelector((state: IAppState) => isRenamingBucketItemSelector(state));
    const isLocationIconEnabled = useSelector((state: IAppState) => isLocationIconEnabledSelector(state));
    const areAllAttributeValuesEnabled = useSelector(() => supportsAllAttributeValues());
    const displayForms = useSelector((state: IAppState) =>
        getDisplayFormsForBucketItemSelector(state, { bucketItem }),
    );
    const propertiesContainTooltipText = useSelector((state: IAppState) =>
        propertiesContainTooltipTextSelector(state),
    );
    const isStaticHyperLinkDisplayFormTextEnabled = useSelector((state: IAppState) =>
        isStaticHyperLinkDisplayFormTextEnabledSelector(state, { localIdentifier: bucketLocalIdentifier }),
    );
    const isFiscalCalendarActive = useSelector((state: IAppState) => isFiscalCalendarActiveSelector(state));
    const isStandardCalendarActive = useSelector((state: IAppState) =>
        isStandardCalendarActiveSelector(state),
    );

    const toggleExpanded = useCallback(
        (item: IRawBucketItem) => {
            dispatch(toggleBucketItemExpanded(item));
        },
        [dispatch],
    );

    const changeDisplayForm = useCallback(
        (localIdentifier: string, displayForm: ObjRef) => {
            dispatch(changeBucketItemDisplayForm(localIdentifier, displayForm));
        },
        [dispatch],
    );

    const changeShowAllValues = useCallback(
        (localIdentifier: string, showAllValues: boolean) => {
            dispatch(changeBucketItemShowAllValues(localIdentifier, showAllValues));
        },
        [dispatch],
    );

    const getItem = () => {
        return bucketItem.attribute;
    };

    const getDateDatasetItemGranularity = () => {
        return bucketItem.granularity;
    };

    const getDateDatasetItem = () => {
        return bucketItem.dateDataset;
    };

    const getItemType = () => {
        // a computed attribute wears the attribute glyph and the attribute layout - it behaves like
        // an attribute in every bucket, so nothing here has to tell them apart
        return normalizeDraggedItemType(getItem().type);
    };

    const getCatalogDateDatasetItemTitle = () => {
        if (bucketItem.isDate) {
            return BucketItemService.getDateDatasetItemTitle(
                getDateDatasetItemGranularity(),
                getDateDatasetItem(),
            );
        }

        return getCatalogItemTitleHelper();
    };

    const getCatalogItemTitleHelper = () => {
        return getCatalogItemTitle(getItem(), intl);
    };

    const getCatalogItemClassNameHelper = () => {
        return getCatalogItemClassName(getItem());
    };

    const getBucketItemAlias = () => {
        return bucketItem.alias;
    };

    const shouldLocationIconBeVisible = (): boolean => {
        const bucketItem = getItem();
        // On an itemCache entry `attribute` is a STRING (the date item's `attr.datedataset`), so
        // the second read resolves to undefined and the `??` falls through.
        const explicitFlag =
            bucketItem.isLocationIconVisible ??
            (bucketItem?.attribute as ICatalogEntry | undefined)?.isLocationIconVisible;

        if (explicitFlag !== undefined) {
            return Boolean(explicitFlag) && isLocationIconEnabled;
        }

        const displayForms = bucketItem?.displayForms;
        const hasLocationForms = hasLocationDisplayForm(displayForms ?? []);

        return hasLocationForms && isLocationIconEnabled;
    };

    const renderHeader = () => {
        const onToggleCollapse = () => toggleExpanded(bucketItem.original as IRawBucketItem);

        const header = (
            <div>
                <div className="adi-bucket-invitation-inner">
                    <FormattedMessage id="dashboard.bucket_item.drop_to_switch" tagName="span" />
                </div>
                <SimpleBucketItemHeader
                    localIdentifier={bucketItem.localIdentifier}
                    title={getCatalogDateDatasetItemTitle()}
                    alias={getBucketItemAlias()}
                    type={getItemType()}
                    className={getCatalogItemClassNameHelper()}
                    isLocationIconVisible={shouldLocationIconBeVisible()}
                    isCollapsed={bucketItem.collapsed}
                    onToggleCollapse={onToggleCollapse}
                />
            </div>
        );

        if (!isRenamingBucketItem && connectDragSource) {
            return connectDragSource(header);
        }
        return header;
    };

    const renderConfiguration = () => {
        if (bucketItem.isDate && !bucketItem.collapsed) {
            return renderDateConfiguration();
        } else if (!bucketItem.isDate && !bucketItem.collapsed) {
            return renderAttributeConfiguration();
        }
        return null;
    };

    const renderDateConfiguration = () => {
        const allGranularities: IGranularityOption[] = bucketItem.dateDataset?.attributes.map(
            ({ dateType, label, chronologicalGranularity, valuesPreview }: IGranularityOption) => ({
                dateType,
                label,
                chronologicalGranularity,
                valuesPreview,
            }),
        );

        const granularities = allGranularities.filter((g) => {
            if (!isFiscalCalendarActive && isFiscalGranularity(g.dateType)) return false;
            return !(!isStandardCalendarActive && isStandardGranularity(g.dateType));
        });

        if (granularities.length === 0) {
            return null;
        }

        const storedGranularity = bucketItem.granularity?.dateType;
        const isStoredGranularityAvailable = granularities.some((g) => g.dateType === storedGranularity);
        const selectedGranularity = isStoredGranularityAvailable
            ? storedGranularity
            : granularities[0].dateType;

        const selectedDateDataSet = DecoratedDateDataset.createFromDecorated(bucketItem.dateDataset);
        const selectedDisplayForm = isStoredGranularityAvailable ? bucketItem.granularity?.dfRef : undefined;

        return (
            <DateConfiguration
                localIdentifier={bucketItem.localIdentifier}
                selectedDateDataSet={selectedDateDataSet}
                selectedGranularity={selectedGranularity}
                granularities={granularities}
                displayForms={displayForms}
                selectedDisplayForm={selectedDisplayForm}
                onSelectDisplayForm={(displayForm: ObjRef) => {
                    changeDisplayForm(bucketItem.localIdentifier, displayForm);
                }}
                showAllValues={!!bucketItem.showAllValues}
                onChangeShowAllValues={(showAllValues) => {
                    changeShowAllValues(bucketItem.localIdentifier, showAllValues);
                }}
            />
        );
    };

    const renderAttributeConfiguration = () => {
        const selectedDisplayForm = bucketItem.original?.dfRef || bucketItem.attribute?.dfRef;

        return (
            <AttributeBucketItemConfiguration
                localIdentifier={bucketItem.localIdentifier}
                bucketLocalIdentifier={bucketLocalIdentifier}
                attribute={getItem()}
                displayForms={displayForms}
                selectedDisplayForm={selectedDisplayForm}
                propertiesContainTooltipText={propertiesContainTooltipText}
                onSelectDisplayForm={(displayForm: ObjRef) => {
                    changeDisplayForm(bucketItem.localIdentifier, displayForm);
                }}
                showAllValuesVisible={areAllAttributeValuesEnabled}
                showAllValues={!!bucketItem.showAllValues}
                isStaticHyperLinkDisplayFormTextEnabled={isStaticHyperLinkDisplayFormTextEnabled}
                onChangeShowAllValues={(showAllValues: boolean) => {
                    changeShowAllValues(bucketItem.localIdentifier, showAllValues);
                }}
            />
        );
    };

    return (
        <div>
            {renderHeader()}
            {renderConfiguration()}
        </div>
    );
});
