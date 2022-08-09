// (C) 2021 GoodData Corporation
import React from "react";
import { shallow, ShallowWrapper } from "enzyme";

import {
    GoodDataSdkError,
    DataTooLargeToComputeSdkError,
    DataTooLargeToDisplaySdkError,
    NoDataSdkError,
    ProtectedReportSdkError,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";
import { CustomError } from "../CustomError";
import { DataTooLargeError } from "../DataTooLargeError";
import { OtherError } from "../OtherError";
import { NoDataError } from "../NoDataError";
import { ExecuteProtectedError } from "../ExecuteProtectedError";

describe("CustomError", () => {
    function renderComponent(error: GoodDataSdkError): ShallowWrapper {
        return shallow(<CustomError error={error} />);
    }

    it.each([
        [ProtectedReportSdkError.name, ExecuteProtectedError, new ProtectedReportSdkError()],
        [DataTooLargeToDisplaySdkError.name, DataTooLargeError, new DataTooLargeToDisplaySdkError()],
        [DataTooLargeToComputeSdkError.name, DataTooLargeError, new DataTooLargeToComputeSdkError()],
        [NoDataSdkError.name, NoDataError, new NoDataSdkError()],
        [UnexpectedSdkError.name, OtherError, new UnexpectedSdkError()],
    ])(
        "should render correct error component for %s error",
        (_errorName: string, component: any, error: GoodDataSdkError) => {
            const wrapper = renderComponent(error);
            expect(wrapper.find(component)).toHaveLength(1);
        },
    );
});
