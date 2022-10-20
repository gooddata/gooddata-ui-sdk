// (C) 2007-2022 GoodData Corporation
import React from "react";
import { LoadingComponent, ErrorComponent, useInsightDataView } from "@gooddata/sdk-ui";
import { idRef } from "@gooddata/sdk-model";
import * as Md from "../../md/full";
import { InsightView } from "@gooddata/sdk-ui-ext";

const style = { border: "1px black solid" };

const UseInsightDataViewExample: React.FC = () => {
    const { result, error, status } = useInsightDataView({ insight: idRef(Md.Insights.PieChart) });
    const series = result?.data().series().toArray();
    const slices = result?.data().slices().toArray();

    return (
        <div>
            <div>
                <h3>Original insight:</h3>
                <div style={{ height: 200 }}>
                    <InsightView insight={idRef(Md.Insights.PieChart)} />
                </div>
            </div>
            <div>
                <h3>The same insight, rendered with custom table:</h3>
                {status === "error" ? (
                    <ErrorComponent
                        message="There was an error getting your execution"
                        description={JSON.stringify(error, null, 2)}
                    />
                ) : null}
                {status === "loading" ? (
                    <div>
                        <div className="gd-message progress">
                            <div className="gd-message-text">Loading…</div>
                        </div>
                        <LoadingComponent />
                    </div>
                ) : null}
                {status === "success" ? (
                    <table style={style}>
                        <tbody>
                            <tr>
                                {slices![0].descriptor.descriptors.map((d) => {
                                    return (
                                        <th key={d.attributeHeader.identifier} style={style}>
                                            {d.attributeHeader.name}
                                        </th>
                                    );
                                })}
                                {series!.map((s) => {
                                    return (
                                        <th key={s.id} style={style}>
                                            {s.measureTitle()}
                                        </th>
                                    );
                                })}
                            </tr>
                            {slices!.map((slice) => {
                                const sliceTitles = slice.sliceTitles();
                                const dataPoints = slice.dataPoints();

                                return (
                                    <tr key={slice.id}>
                                        {sliceTitles.map((t) => (
                                            <td key={t} style={style}>
                                                {t}
                                            </td>
                                        ))}
                                        {dataPoints.map((d) => (
                                            <td key={d.seriesDesc.id} style={style}>
                                                {d.formattedValue()}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : null}
            </div>
        </div>
    );
};

export default UseInsightDataViewExample;
