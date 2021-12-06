// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AttributeElements } from "@gooddata/sdk-ui-filters";
import { Md } from "../../../md";
import { CustomLoading } from "../../../components/CustomLoading";
import { CustomError } from "../../../components/CustomError";
import { EmployeeProfile } from "./EmployeeProfile";
import { attributeDisplayFormRef } from "@gooddata/sdk-model";

export const GlobalFiltersExample = (): JSX.Element => (
    <AttributeElements displayForm={attributeDisplayFormRef(Md.EmployeeName.Default)} limit={20}>
        {({ validElements, error, isLoading }) => {
            if (error) {
                return <CustomError message="There was an error getting Employee Name attribute values" />;
            }
            if (isLoading) {
                return (
                    <div
                        style={{
                            flex: "1 0 auto",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <CustomLoading speed={2} color="tomato" imageHeight={100} height={200} />
                    </div>
                );
            }

            return <EmployeeProfile validElements={validElements} />;
        }}
    </AttributeElements>
);
