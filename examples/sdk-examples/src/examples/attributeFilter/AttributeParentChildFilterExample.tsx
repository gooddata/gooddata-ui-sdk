// (C) 2007-2020 GoodData Corporation
import React, { useState } from "react";
import { ErrorComponent, OnLoadingChanged, OnError } from "@gooddata/sdk-ui";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../ldm";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import { idRef } from "@gooddata/sdk-model";

export const AttributeParentChildFilterExample: React.FC = () => {
    const [filter, setFilter] = useState<IAttributeFilter>();
    const [parentFilter, setParentFilter] = useState<IAttributeFilter>();
    const [error, setError] = useState<any>();

    const onError: OnError = (...params) => {
        setError(params);
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    const onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    return (
        <div className="s-attribute-filter">
            <AttributeFilter
                filter={newPositiveAttributeFilter(attributeDisplayFormRef(Ldm.LocationState), { uris: [] })}
                fullscreenOnMobile={false}
                onApply={setParentFilter}
            />
            <AttributeFilter
                filter={newPositiveAttributeFilter(attributeDisplayFormRef(Ldm.LocationCity), { uris: [] })}
                parentFilters={parentFilter ? [parentFilter] : []}
                parentFilterOverAttribute={idRef(LdmExt.locationIdAttributeIdentifier)}
                fullscreenOnMobile={false}
                onApply={setFilter}
            />
            <div style={{ height: 300 }} className="s-line-chart">
                {error ? (
                    <ErrorComponent message={error} />
                ) : (
                    <BarChart
                        measures={[LdmExt.TotalSales2]}
                        viewBy={Ldm.LocationCity}
                        filters={[filter, parentFilter]}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    />
                )}
            </div>
        </div>
    );
};
