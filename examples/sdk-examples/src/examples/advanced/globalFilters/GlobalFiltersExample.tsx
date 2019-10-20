// (C) 2007-2019 GoodData Corporation
import React from "react";
import { AttributeElements } from "@gooddata/sdk-ui";
import { projectId, employeeNameIdentifier } from "../../../constants/fixtures";
import { CustomLoading } from "../../../components/CustomLoading";
import { CustomError } from "../../../components/CustomError";
import { EmployeeProfile } from "./EmployeeProfile";

const options = { limit: 20 };

export const GlobalFiltersExample = () => (
    <AttributeElements identifier={employeeNameIdentifier} projectId={projectId} options={options}>
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
