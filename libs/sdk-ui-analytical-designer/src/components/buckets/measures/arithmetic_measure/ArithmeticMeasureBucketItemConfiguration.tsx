// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { IsATotalCheckbox } from "../../measure/IsATotalCheckbox.js";
import { MeasureNumberFormatPanel } from "../../measure/MeasureNumberFormatPanel/MeasureNumberFormatPanel.js";

import { OperandDropdown } from "./OperandDropdown.js";
import { OperatorDropdown } from "./OperatorDropdown.js";

export interface IArithmeticMeasureBucketItemConfigurationProps {
    bucketItemLocalIdentifier: string;
}

export function ArithmeticMeasureBucketItemConfiguration(
    props: IArithmeticMeasureBucketItemConfigurationProps,
) {
    return (
        <div className="adi-bucket-configuration adi-metric-bucket-item-configuration adi-arithmetic-measure-configuration s-metric-bucket-item-configuration s-adi-arithmetic-measure-configuration">
            <FormattedMessage id="dashboard.bucket_item.arithmetic_measure.operator_header" />
            <OperatorDropdown localIdentifier={props.bucketItemLocalIdentifier} />
            <FormattedMessage id="dashboard.bucket_item.arithmetic_measure.operands_header" />
            <OperandDropdown operandIndex={0} localIdentifier={props.bucketItemLocalIdentifier} />
            <OperandDropdown operandIndex={1} localIdentifier={props.bucketItemLocalIdentifier} />
            <IsATotalCheckbox localIdentifier={props.bucketItemLocalIdentifier} />
            <MeasureNumberFormatPanel bucketItemLocalIdentifier={props.bucketItemLocalIdentifier} />
        </div>
    );
}
