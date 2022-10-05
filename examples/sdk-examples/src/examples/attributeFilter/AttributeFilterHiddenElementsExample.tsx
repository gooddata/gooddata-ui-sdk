// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const hideEmployeesStartingWithA = [
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339877",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339689",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339879",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339691",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339462",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339881",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339269",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339271",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339464",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339693",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339273",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339695",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339466",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339275",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339697",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339699",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339468",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339470",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339277",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339883",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339472",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339279",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339885",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339887",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339474",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339476",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339889",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339478",
    "/gdc/md/xms7ga4tf3g3nzucd8380o2bev8oeknp/obj/2200/elements?id=6339891",
];

export class AttributeFilterHiddenElementsExample extends Component {
    public onApply = (...params: any[]): void => {
        // eslint-disable-next-line no-console
        console.log("AttributeFilterHiddenElementsExample onApply", ...params);
    };

    public render() {
        return (
            <div>
                <div>Attribute filter with hidden elements</div>
                <AttributeFilter
                    filter={newNegativeAttributeFilter(Md.EmployeeName.Default, { uris: [] })}
                    onApply={this.onApply}
                    hiddenElements={hideEmployeesStartingWithA}
                />
            </div>
        );
    }
}

export default AttributeFilterHiddenElementsExample;
