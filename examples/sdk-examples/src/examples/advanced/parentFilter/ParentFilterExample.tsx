// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { AttributeElements } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import {
    newPositiveAttributeFilter,
    attributeIdentifier,
    attributeDisplayFormRef,
    ObjRef,
} from "@gooddata/sdk-model";
import Select from "react-select";
import { Ldm, LdmExt } from "../../../ldm";

interface IFilterValue {
    value: string;
    label: string;
}

interface IParentFilterExampleState {
    stateFilterValues: IFilterValue[];
    cityFilterValues: IFilterValue[];
}

interface ICityOptions {
    limit: number;
    afm:
        | {
              attributes: Array<{
                  displayForm: {
                      identifier: string | undefined;
                  };
                  localIdentifier: string;
              }>;
              filters: Array<{
                  expression: {
                      value: string;
                  };
              }>;
          }
        | undefined;
}

export class ParentFilterExample extends Component<{}, IParentFilterExampleState> {
    constructor(props: any) {
        super(props);

        this.renderFilter = this.renderFilter.bind(this);
        this.state = {
            stateFilterValues: [],
            cityFilterValues: [],
        };
    }

    public onStateChange = (stateFilterValues: IFilterValue[]) => {
        this.setState({
            stateFilterValues,
        });
    };

    public onCityChange = (cityFilterValues: IFilterValue[]) => {
        this.setState({
            cityFilterValues,
        });
    };

    public renderInsightView(stateFilterValues: IFilterValue[], cityFilterValues: IFilterValue[]) {
        const visFilters = [];

        if (stateFilterValues.length) {
            visFilters.push(
                newPositiveAttributeFilter(Ldm.LocationState, {
                    uris: stateFilterValues.map((filter) => filter.value),
                }),
            );
        }
        if (cityFilterValues.length) {
            visFilters.push(
                newPositiveAttributeFilter(Ldm.LocationCity, {
                    uris: cityFilterValues.map((filter) => filter.value),
                }),
            );
        }

        return (
            <div style={{ height: 500 }}>
                <BarChart
                    measures={[LdmExt.TotalSales1]}
                    viewBy={Ldm.LocationName.Default}
                    filters={visFilters}
                    height={500}
                />
            </div>
        );
    }

    public renderFilter(
        key: string,
        displayForm: ObjRef,
        filterValues: IFilterValue[],
        placeholder: string,
        options: any,
        onChange: any,
    ) {
        return (
            <AttributeElements key={key} displayForm={displayForm} options={options}>
                {({ validElements, isLoading, error }) => {
                    if (error) {
                        return <div>{error}</div>;
                    }
                    const selectOptions = validElements
                        ? validElements.items.map((item) => ({
                              label: item.title,
                              value: item.uri,
                          }))
                        : [];
                    return (
                        <span
                            style={{
                                display: "inline-block",
                                minWidth: "10em",
                                verticalAlign: "middle",
                            }}
                        >
                            <Select
                                onChange={onChange}
                                className={`s-select-${key}`}
                                options={selectOptions}
                                isMulti
                                isLoading={isLoading}
                                placeholder={placeholder}
                                value={filterValues}
                            />
                        </span>
                    );
                }}
            </AttributeElements>
        );
    }

    public render() {
        const { stateFilterValues, cityFilterValues } = this.state;
        // State (parent) filter
        const stateFilter = this.renderFilter(
            "state",
            attributeDisplayFormRef(Ldm.LocationState),
            stateFilterValues,
            "all states",
            { limit: 20 },
            this.onStateChange,
        );

        // City (child) filter
        const cityOptions: ICityOptions = {
            limit: 20,
            afm: undefined,
        };
        if (stateFilterValues.length) {
            // parent value uris need to be surrounded by '[]' and separated by ','
            const selectedParentItems = stateFilterValues
                .map((parentItem) => `[${parentItem.value}]`)
                .join(", ");

            const afm = {
                attributes: [
                    {
                        displayForm: {
                            identifier: attributeIdentifier(Ldm.LocationCity),
                        },
                        localIdentifier: "childAttribute",
                    },
                ],
                filters: [
                    {
                        expression: {
                            value:
                                // parent attribute identifier surrounded by '{}'
                                `({${LdmExt.locationStateAttributeIdentifier}}` +
                                // selected parent values surrounded by '[]' and separated by ','
                                ` IN (${selectedParentItems}))` +
                                // attribute identifier of common attribute between parent
                                // and child attributes surrounded by '{}'
                                ` OVER {${LdmExt.locationIdAttributeIdentifier}}` +
                                // child attribute identifier surrounded by '{}'
                                ` TO {${LdmExt.locationCityAttributeIdentifier}}`,
                        },
                    },
                ],
            };
            cityOptions.afm = afm;
        }
        const cityFilter = this.renderFilter(
            "city",
            attributeDisplayFormRef(Ldm.LocationCity),
            cityFilterValues,
            "all cities",
            cityOptions,
            this.onCityChange,
        );

        return (
            <div>
                <span>Total Sales per site in&emsp;</span>
                {stateFilter}
                &emsp;and&emsp; {cityFilter}
                <hr className="separator" />
                {this.renderInsightView(stateFilterValues, cityFilterValues)}
            </div>
        );
    }
}

export default ParentFilterExample;
