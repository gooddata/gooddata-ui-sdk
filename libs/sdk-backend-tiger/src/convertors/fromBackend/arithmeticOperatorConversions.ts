// (C) 2019-2021 GoodData Corporation
import { ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum } from "@gooddata/api-client-tiger";
import { ArithmeticMeasureOperator } from "@gooddata/sdk-model";

type TigerToSdk = {
    [key in ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum]: ArithmeticMeasureOperator;
};

type SdkToTiger = {
    [key in ArithmeticMeasureOperator]: ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum;
};

const TigerToSdkOperatorMap: TigerToSdk = {
    [ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.CHANGE]: "change",
    [ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.DIFFERENCE]: "difference",
    [ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.MULTIPLICATION]: "multiplication",
    [ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.RATIO]: "ratio",
    [ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.SUM]: "sum",
};

/**
 * Converts supported tiger backend arithmetic measure operator to values recognized by the SDK.
 *
 * @param operator - tiger operator
 */
export function toSdkArithmeticOperator(
    operator: ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum,
): ArithmeticMeasureOperator {
    return TigerToSdkOperatorMap[operator];
}

const SdkToTigerOperatorMap: SdkToTiger = {
    change: ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.CHANGE,
    difference: ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.DIFFERENCE,
    multiplication: ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.MULTIPLICATION,
    ratio: ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.RATIO,
    sum: ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum.SUM,
};

/**
 * Converts arithmetic measure operator recognized by the SDK into arithmetic measure operator known by tiger.
 *
 * @param operator - sdk operator
 */
export function toTigerArithmeticOperator(
    operator: ArithmeticMeasureOperator,
): ArithmeticMeasureDefinitionArithmeticMeasureOperatorEnum {
    return SdkToTigerOperatorMap[operator];
}
