// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import { FormattedMessage, type IntlShape, defineMessage } from "react-intl";
import { connect } from "react-redux";
import { createSelector } from "reselect";

import { type ObjRef } from "@gooddata/sdk-model";
import { type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { type IDecoratedDateDataset } from "../../../models/decorated_date_dataset.js";
import {
    DecoratedDateDatasets,
    type IDecoratedDateDatasets,
} from "../../../models/decorated_date_datasets.js";
import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";
import {
    changeBucketItemDateDataset,
    changeBucketItemDateDatasetGranularity,
    loadDateDatasetsToDateDropdown,
} from "../../../sagas/date_datasets/date_datasets_actions.js";
import { supportsAllAttributeValues } from "../../../selectors/backend_capabilities_selector.js";
import {
    enableUnavailableItemsVisibility,
    isShowAllValuesOnDatesEnabled,
} from "../../../selectors/feature_flag_selector.js";
import { getIntl } from "../../../selectors/intl_selector.js";
import { DateDatasetsService } from "../../../services/date_datasets_service.js";
import { type IAppState } from "../../../store/types.js";
import { type ICacheItemDisplayForm } from "../../../typings/state_objects.js";
import { NoDateAvailable } from "../../shared/NoDateAvailable.js";
import { AttributeDisplayFormDropdown } from "../AttributeDisplayFormDropdown.js";
import { ShowAllDateValuesSection } from "../ShowAllValues/ShowAllDateValuesSection.js";

import { DateDatasetsDropdown } from "./DateDatasetsDropdown.js";
import { DateGranularityDropdown } from "./DateGranularityDropdown.js";

const DROPDOWN_ITEM_HEIGHT = 23;

const ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "bl tl",
        offset: { x: -7, y: 1 },
    },
    {
        align: "tl bl",
        offset: { x: -7, y: -1 },
    },
];

export interface IDateConfigurationStateProps {
    dateDatasets: IDecoratedDateDatasets;
    isDateDatasetsDropdownLoaded: boolean;
    showAllValuesVisible: boolean;
    intl: IntlShape;
    enableUnavailableItemsVisibility: boolean;
}

export interface IDateConfigurationOwnProps {
    localIdentifier: string;
    selectedDateDataSet: IDecoratedDateDataset;
    selectedGranularity: Granularity;
    granularities: IGranularityOption[];
    defaultDialogHeight?: number;
    displayForms?: ICacheItemDisplayForm[];
    selectedDisplayForm?: ObjRef;
    onSelectDisplayForm?: (displayForm: ObjRef) => void;
    showAllValues?: boolean;
    onChangeShowAllValues?: (showAllValues: boolean) => void;
}

interface IDateConfigurationDispatchProps {
    setBucketItemDateDataset: (dateDatasetRef: ObjRef, bucketItemLocalIdentifier: string) => void;
    setBucketItemGranularity: (localIdentifier: string, granularity: Granularity) => void;
    callLoadDateDatasetsToDateDropdown: (ignoreDateDataset: boolean) => void;
}

export type IDateConfigurationProps = IDateConfigurationStateProps &
    IDateConfigurationDispatchProps &
    IDateConfigurationOwnProps;

const dateConfigurationSelector = createSelector(
    DateDatasetsService.getPlainDateDatasets,
    DateDatasetsService.isDateDatasetsDropdownLoaded,
    isShowAllValuesOnDatesEnabled,
    supportsAllAttributeValues,
    getIntl,
    enableUnavailableItemsVisibility,
    (
        plainDateDatasets,
        isDateDatasetsDropdownLoaded,
        showAllValuesOnDatesEnabled,
        supportsAllAttributeValues,
        intl,
        enableUnavailableItemsVisibility,
    ): IDateConfigurationStateProps => {
        return {
            dateDatasets: DecoratedDateDatasets.createFromDateDatasets(
                plainDateDatasets,
                enableUnavailableItemsVisibility,
            ),
            isDateDatasetsDropdownLoaded,
            showAllValuesVisible: supportsAllAttributeValues && showAllValuesOnDatesEnabled,
            intl,
            enableUnavailableItemsVisibility,
        };
    },
);

function mapDispatchToProps(): IDateConfigurationDispatchProps {
    return {
        setBucketItemDateDataset: changeBucketItemDateDataset,
        setBucketItemGranularity: changeBucketItemDateDatasetGranularity,
        callLoadDateDatasetsToDateDropdown: loadDateDatasetsToDateDropdown,
    };
}

export const DateConfigurationBase = memo(function DateConfiguration({
    defaultDialogHeight = 0,
    localIdentifier,
    selectedDateDataSet,
    selectedGranularity,
    granularities,
    displayForms,
    selectedDisplayForm,
    onSelectDisplayForm,
    showAllValues,
    onChangeShowAllValues,
    dateDatasets,
    isDateDatasetsDropdownLoaded,

    showAllValuesVisible,
    enableUnavailableItemsVisibility,
    setBucketItemDateDataset,
    setBucketItemGranularity,
    callLoadDateDatasetsToDateDropdown,
}: IDateConfigurationProps) {
    const onDateDatasetChange = (selectedDateDataset: IDecoratedDateDataset) => {
        setBucketItemDateDataset(selectedDateDataset.ref, localIdentifier);
    };

    const onGranularityChange = (granularity: Granularity) => {
        setBucketItemGranularity(localIdentifier, granularity);
    };

    const onDateDatasetDropdownOpenStateChanged = (isOpen: boolean) => {
        const ignoreDateDataset = false;
        if (isOpen) {
            callLoadDateDatasetsToDateDropdown(ignoreDateDataset);
        }
    };

    const renderConfiguration = () => {
        return (
            <>
                <span className="select">
                    <span className="select-label">
                        <FormattedMessage id={"filter.date.calendar"} />
                    </span>
                    <div className="adi-date-dataset-switch select-button">
                        <DateDatasetsDropdown
                            unavailableCount={dateDatasets.unavailable}
                            dateDatasets={dateDatasets.items}
                            activeDateDataset={selectedDateDataSet}
                            onDateDatasetChange={onDateDatasetChange}
                            itemHeight={DROPDOWN_ITEM_HEIGHT}
                            defaultDialogHeight={defaultDialogHeight}
                            onOpenStateChanged={onDateDatasetDropdownOpenStateChanged}
                            isDateDatasetsDropdownLoaded={isDateDatasetsDropdownLoaded}
                            enableUnavailableItemsVisibility={enableUnavailableItemsVisibility}
                        />
                    </div>
                </span>

                <span className="select wrap">
                    <span className="select-label">
                        <FormattedMessage id="dashboard.bucket_item.granularity" />
                    </span>
                    <div className="adi-date-granularity-switch select-button">
                        <DateGranularityDropdown
                            granularities={granularities}
                            selectedGranularity={selectedGranularity}
                            onGranularityChange={onGranularityChange}
                        />
                    </div>
                </span>

                <ShowAllDateValuesSection
                    showAllValues={showAllValues}
                    onChangeShowAllValues={onChangeShowAllValues}
                    visible={showAllValuesVisible}
                    granularityOptions={granularities}
                    selectedGranularity={selectedGranularity}
                />

                {displayForms.length > 1 && (
                    <section>
                        <div className="s-date-configuration-display-form">
                            <AttributeDisplayFormDropdown
                                displayForms={displayForms}
                                selectedDisplayForm={selectedDisplayForm}
                                onSelect={onSelectDisplayForm}
                                alignPoints={ALIGN_POINTS}
                            />
                        </div>
                    </section>
                )}
            </>
        );
    };

    const dateDatasetsCount = dateDatasets.items.length;

    return (
        <div
            className={
                "adi-bucket-configuration adi-date-bucket-item-configuration s-date-configuration date-granularity"
            }
        >
            {dateDatasetsCount ? (
                renderConfiguration()
            ) : (
                <NoDateAvailable
                    message={defineMessage({ id: "dashboard.bucket_item.no_date_available_category" }).id}
                />
            )}
        </div>
    );
});

export const DateConfiguration = connect<
    IDateConfigurationStateProps,
    IDateConfigurationDispatchProps,
    IDateConfigurationOwnProps,
    IAppState
>(
    dateConfigurationSelector,
    mapDispatchToProps(),
)(DateConfigurationBase);

export const DateConfigurationTest = {
    dateConfigurationSelector,
};
