// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ErrorComponent, LoadingComponent, useExecutionDataView } from "@gooddata/sdk-ui";
import { Md } from "../../md";
import { newAttributeSort, newPositiveAttributeFilter } from "@gooddata/sdk-model";
const style = { border: "1px black solid" };

const seriesBy = [Md.$TotalSales, Md.$FranchisedSales];
const slicesBy = [Md.LocationState, Md.LocationCity];
const sortBy = [newAttributeSort(Md.LocationState, "asc")];
const filters = [newPositiveAttributeFilter(Md.LocationState, ["Florida", "Texas"])];

export const UseDataViewWithSlicesExample: React.FC = () => {
    const { result, error, status } = useExecutionDataView({
        execution: { seriesBy, slicesBy, sortBy, filters },
    });
    const slices = result?.data().slices().toArray();

    return (
        <div>
            {status === "error" && (
                <div>
                    <ErrorComponent
                        message="There was an error getting your execution"
                        description={JSON.stringify(error, null, 2)}
                    />
                </div>
            )}
            {status === "loading" && (
                <div>
                    <div className="gd-message progress">
                        <div className="gd-message-text">Loading…</div>
                    </div>
                    <LoadingComponent />
                </div>
            )}
            {status === "success" && (
                <table style={style}>
                    <tbody>
                        <tr style={style}>
                            <th>State</th>
                            <th>City</th>
                            <th>Total Sales</th>
                            <th>Total Franchised Cost</th>
                        </tr>
                        {slices?.map((slice) => {
                            const sliceTitles = slice.sliceTitles();
                            const sales = slice.dataPoints()[0];
                            const franchisedSales = slice.dataPoints()[1];

                            return (
                                <tr key={slice.id} style={style}>
                                    <td style={style}>{sliceTitles[0]}</td>
                                    <td style={style}>{sliceTitles[1]}</td>
                                    <td style={style}>{sales.formattedValue()}</td>
                                    <td style={style}>{franchisedSales.formattedValue()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};
