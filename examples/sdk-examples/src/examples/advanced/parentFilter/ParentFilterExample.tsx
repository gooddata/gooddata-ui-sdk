// (C) 2007-2022 GoodData Corporation
import React, { useState, useMemo } from "react";
import { useAttributeFilterController } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    newPositiveAttributeFilter,
    ObjRef,
    idRef,
    modifyMeasure,
    IAttributeFilter,
} from "@gooddata/sdk-model";
import Select from "react-select";
import * as Md from "../../../md/full";

const locationIdAttributeIdentifier = "attr.restaurantlocation.locationid";
const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));

interface IFilterValue {
    value: string;
    label: string;
}

interface ICustomFilterProps {
    filter: IAttributeFilter;
    parentFilters?: IAttributeFilter[];
    parentFilterOverAttribute?: ObjRef;
    placeholder: string;
    onChange: (filters: IAttributeFilter) => void;
    className: string;
}

const CustomFilter: React.FC<ICustomFilterProps> = ({
    filter,
    parentFilters,
    parentFilterOverAttribute,
    onChange,
    placeholder,
    className,
}) => {
    const {
        isInitializing,
        isFiltering,
        initError,
        elements,
        committedSelectionElements,
        onSelect,
        onApply,
    } = useAttributeFilterController({
        filter,
        parentFilters,
        parentFilterOverAttribute,
        onApply: onChange,
    });

    if (initError) {
        // eslint-disable-next-line no-console
        console.error("Loading attribute elements failed!", initError);
    }
    const selectOptions = useMemo(
        () =>
            !isInitializing && !isFiltering
                ? elements.map(
                      (item): IFilterValue => ({
                          label: item.title,
                          value: item.uri,
                      }),
                  )
                : [],
        [isInitializing, isFiltering, elements],
    );

    const value = useMemo(() => {
        return committedSelectionElements.map(
            (item): IFilterValue => ({
                label: item.title,
                value: item.uri,
            }),
        );
    }, [committedSelectionElements]);

    return (
        <span
            style={{
                display: "inline-block",
                minWidth: "10em",
                verticalAlign: "middle",
            }}
        >
            <Select
                className={className}
                onChange={(value) => {
                    onSelect(
                        value.map((v) => ({ uri: v.value, title: v.label })),
                        false,
                    );
                    onApply();
                }}
                options={selectOptions}
                isMulti
                isLoading={isInitializing || isFiltering}
                placeholder={placeholder}
                value={value}
            />
            {initError ? <span style={{ color: "#e54d42" }}>Loading failed!</span> : null}
        </span>
    );
};

export const ParentFilterExample: React.FC = () => {
    const [stateFilter, setStateFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(Md.LocationState, {
            uris: [],
        }),
    );
    const [cityFilter, setCityFilter] = useState<IAttributeFilter>(
        newPositiveAttributeFilter(Md.LocationCity, {
            uris: [],
        }),
    );

    return (
        <div>
            <span>Total Sales per site in&emsp;</span>
            <CustomFilter
                filter={stateFilter}
                onChange={setStateFilter}
                placeholder="all states"
                className="s-select-state"
            />
            &emsp;and&emsp;{" "}
            <CustomFilter
                filter={cityFilter}
                onChange={setCityFilter}
                placeholder="all cities"
                parentFilters={[stateFilter]}
                parentFilterOverAttribute={idRef(locationIdAttributeIdentifier)}
                className="s-select-city"
            />
            <hr className="separator" />
            <div style={{ height: 500 }}>
                <BarChart
                    measures={[TotalSales]}
                    viewBy={Md.LocationName.Default}
                    filters={[stateFilter, cityFilter]}
                    height={500}
                />
            </div>
        </div>
    );
};

export default ParentFilterExample;
