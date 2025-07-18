// (C) 2019-2025 GoodData Corporation
import { useIntl } from "react-intl";
import DropdownControl from "./DropdownControl.js";
import CheckboxControl from "../configurationControls/CheckboxControl.js";

import { dataLabelsDropdownItems } from "../../constants/dropdowns.js";
import { getTranslatedDropdownItems } from "../../utils/translations.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { messages } from "../../../locales.js";

export interface IDataLabelsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
    isTotalsDisabled?: boolean;
    showDisabledMessage?: boolean;
    defaultValue?: string | boolean;
    enableSeparateTotalLabels?: boolean;
    enablePercentLabels?: boolean;
}

export default function DataLabelsControl({
    pushData,
    properties,
    isDisabled,
    showDisabledMessage = false,
    defaultValue = "auto",
    isTotalsDisabled = true,
    enableSeparateTotalLabels = false,
    enablePercentLabels,
}: IDataLabelsControlProps) {
    const intl = useIntl();

    const dataLabels = properties?.controls?.dataLabels?.visible ?? defaultValue;
    const totalLabels = properties?.controls?.dataLabels?.totalsVisible ?? defaultValue;
    const percentLabels = properties?.controls?.dataLabels?.percentsVisible ?? true;
    const percentLabelsDisabled = isDisabled || !dataLabels;

    // Decide about percents tooltip message: show info variant when not disabled,
    // show special message when disabled by hidden data labels and don't show for
    // other  disabled situations (like loading state, missing metrics state etc.)
    let percentLabelsMessageId;
    if (!dataLabels) {
        percentLabelsMessageId = messages.canvasLabelsPercentagesDisabled.id;
    } else if (!percentLabelsDisabled) {
        percentLabelsMessageId = messages.canvasLabelsPercentagesInfo.id;
    }

    return (
        <div className="s-data-labels-config">
            <DropdownControl
                value={dataLabels}
                valuePath="dataLabels.visible"
                labelText={messages.dataLabels.id}
                disabled={isDisabled}
                properties={properties}
                pushData={pushData}
                items={getTranslatedDropdownItems(dataLabelsDropdownItems, intl)}
                showDisabledMessage={showDisabledMessage}
            />
            {enableSeparateTotalLabels ? (
                <DropdownControl
                    value={totalLabels}
                    valuePath="dataLabels.totalsVisible"
                    labelText={messages.totalLabels.id}
                    disabled={isTotalsDisabled}
                    properties={properties}
                    pushData={pushData}
                    items={getTranslatedDropdownItems(dataLabelsDropdownItems, intl)}
                    showDisabledMessage={isTotalsDisabled}
                />
            ) : null}
            {enablePercentLabels ? (
                <CheckboxControl
                    valuePath="dataLabels.percentsVisible"
                    labelText={messages.canvasLabelsPercentages.id}
                    properties={properties}
                    checked={percentLabels}
                    disabled={percentLabelsDisabled}
                    disabledMessageId={percentLabelsMessageId}
                    showDisabledMessage={!!percentLabelsMessageId}
                    pushData={pushData}
                />
            ) : null}
        </div>
    );
}
