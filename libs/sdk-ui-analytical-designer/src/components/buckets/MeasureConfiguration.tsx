// (C) 2019-2026 GoodData Corporation

import { memo, useCallback, useEffect, useState } from "react";

import classNames from "classnames";
import { connect } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { type ChartType } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { changeMeasureChartType } from "../../actions/buckets_actions.js";
import { toggleDualAxis } from "../../actions/properties_actions.js";
import {
    getPrimaryMeasuresFromMeasureBucket,
    isOptionalStackingSupported,
} from "../../services/buckets_service.js";
import { getBucketsState } from "../../store/buckets/buckets_selectors.js";
import { getVisualizationPropertiesControl } from "../../store/properties/properties_selectors.js";
import {
    getUiConfigBucketFlag,
    getUiConfigSupportedChartTypes,
} from "../../store/reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../../store/types.js";
import { type VisualizationType } from "../../typings/visualization.js";

import { MeasureConfigurationBody } from "./MeasureConfigurationBody.js";

export interface IMeasureConfigurationOwnProps {
    localIdentifier: string;
}

export interface IMeasureConfigurationStateProps {
    isDualAxisEnabled: boolean;
    isSecondaryAxisCheckboxVisible: boolean;
    canSelectChartType: boolean;
    selectedChartType: string;
    supportedChartTypes: VisualizationType[];
    isOptionalStackingSupported: boolean;
}

export interface IMeasureConfigurationDispatchProps {
    changeMeasureChartType: (localIdentifier: string, type: VisualizationType) => void;
    toggleDualAxis: (localIdentifier: string, value: boolean) => void;
}

export type IMeasureConfigurationProps = IMeasureConfigurationOwnProps &
    IMeasureConfigurationStateProps &
    IMeasureConfigurationDispatchProps;

const makeMapStateToProps = () => {
    return createStructuredSelector({
        isDualAxisEnabled: getDualAxisEnabled,
        isSecondaryAxisCheckboxVisible: getAllowShowOnSecondaryAxis,
        canSelectChartType: getAllowSelectChartType,
        selectedChartType: getSelectedChartType,
        supportedChartTypes: getSupportedChartTypes,
        isOptionalStackingSupported: isOptionalStackingVisible,
    });
};

const mapDispatchToProps: IMeasureConfigurationDispatchProps = {
    changeMeasureChartType,
    toggleDualAxis,
};

export const MeasureConfigurationBase = memo(function MeasureConfigurationBase({
    localIdentifier,
    isDualAxisEnabled,
    isSecondaryAxisCheckboxVisible,
    canSelectChartType,
    selectedChartType,
    supportedChartTypes,
    isOptionalStackingSupported,
    changeMeasureChartType,
    toggleDualAxis,
}: IMeasureConfigurationProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!canSelectChartType) {
            setIsOpen(false);
        }
    }, [canSelectChartType]);

    const toggleMenu = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    const getClassNames = () => {
        return classNames({
            "measure-configuration": true,
            "is-open": isOpen,
            [`s-measure-configuration-${localIdentifier}`]: true,
        });
    };

    const onSelect = useCallback(
        (chartType: VisualizationType) => {
            changeMeasureChartType(localIdentifier, chartType);
            setIsOpen(false);
        },
        [changeMeasureChartType, localIdentifier],
    );

    const toggleDualAxisHandler = useCallback(
        (value: boolean) => {
            toggleDualAxis(localIdentifier, value);
            setIsOpen(false);
        },
        [toggleDualAxis, localIdentifier],
    );

    if (!canSelectChartType) {
        return null;
    }

    return (
        <div className={getClassNames()} onClick={toggleMenu}>
            <div className="menu-measure-configuration-icon" />
            {isOpen ? (
                <Overlay
                    alignTo={`.s-measure-configuration-${localIdentifier}`}
                    alignPoints={[
                        {
                            align: "br tr",
                        },
                    ]}
                    onClose={close}
                    closeOnOutsideClick
                    closeOnMouseDrag
                    closeOnParentScroll
                >
                    <MeasureConfigurationBody
                        isSecondaryAxisCheckboxVisible={isSecondaryAxisCheckboxVisible}
                        isDualAxisEnabled={isDualAxisEnabled}
                        supportedChartTypes={supportedChartTypes}
                        selectedChartType={selectedChartType}
                        onSelect={onSelect}
                        toggleDualAxis={toggleDualAxisHandler}
                        isOptionalStackingSupported={isOptionalStackingSupported}
                    />
                </Overlay>
            ) : null}
        </div>
    );
});

export const MeasureConfiguration = connect<
    IMeasureConfigurationStateProps,
    IMeasureConfigurationDispatchProps,
    IMeasureConfigurationOwnProps,
    IAppState
>(
    makeMapStateToProps,
    mapDispatchToProps,
)(MeasureConfigurationBase);

function getDualAxisEnabled(state: IAppState): boolean {
    return getVisualizationPropertiesControl(state, "dualAxis", true);
}

function getAllowShowOnSecondaryAxis(state: IAppState, props: IMeasureConfigurationOwnProps): boolean {
    return getUiConfigBucketFlag(state, props.localIdentifier, "allowShowOnSecondaryAxis", false);
}

function getAllowSelectChartType(state: IAppState, props: IMeasureConfigurationOwnProps): boolean {
    return getUiConfigBucketFlag(state, props.localIdentifier, "allowSelectChartType", false);
}

function getSelectedChartType(state: IAppState, props: IMeasureConfigurationOwnProps): string {
    const { localIdentifier } = props;
    const buckets = getBucketsState(state);
    const index = [...(buckets ?? [])].findIndex((bucket) => bucket?.localIdentifier === localIdentifier);
    return buckets?.at(index)?.chartType;
}

/** stable fallback: this is a `createStructuredSelector` input, so a fresh [] would re-render */
const NO_CHART_TYPES: ChartType[] = Object.freeze([]) as unknown as ChartType[];

function getSupportedChartTypes(state: IAppState): VisualizationType[] {
    // Narrow the SDK's wider ChartType at the plug-viz boundary to the visualization types the
    // measure chart-type menu supports.
    return getUiConfigSupportedChartTypes(state, NO_CHART_TYPES) as VisualizationType[];
}

function getAllowOptionalStacking(state: IAppState, props: IMeasureConfigurationOwnProps): boolean {
    return getUiConfigBucketFlag(state, props.localIdentifier, "allowOptionalStacking", false);
}

const isOptionalStackingVisible = createSelector(
    isOptionalStackingSupported,
    getAllowOptionalStacking,
    getPrimaryMeasuresFromMeasureBucket,
    (optionalStackingSupported, isAllowOptionalStacking, measures) =>
        optionalStackingSupported && isAllowOptionalStacking && (measures?.length ?? 0) > 1,
);

export const MeasureConfigurationTest = {
    getDualAxisEnabled,
    getAllowShowOnSecondaryAxis,
    getAllowSelectChartType,
    getSelectedChartType,
    getSupportedChartTypes,
    isOptionalStackingVisible,
};
