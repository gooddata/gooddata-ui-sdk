// (C) 2022 GoodData Corporation
import React from "react";
import { defineMessage, FormattedMessage, useIntl, MessageDescriptor } from "react-intl";
import {
    Dropdown,
    DropdownButton,
    DropdownList,
    IAlignPoint,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";
import { IKpiComparisonDirection } from "@gooddata/sdk-model";
import { CONFIG_PANEL_INNER_WIDTH } from "./constants";

const alignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

const messages: { [D in IKpiComparisonDirection]: MessageDescriptor } = {
    growIsBad: defineMessage({ id: "configurationPanel.comparisonDirectionItems.red" }),
    growIsGood: defineMessage({ id: "configurationPanel.comparisonDirectionItems.green" }),
};

const placeholderMessage = defineMessage({ id: "configurationPanel.selectComparisonDirectionPlaceholder" });

const directionOrder: IKpiComparisonDirection[] = ["growIsGood", "growIsBad"];

interface IKpiComparisonDirectionDropdownProps {
    comparisonDirectionId: IKpiComparisonDirection | undefined;
    onComparisonDirectionChanged: (newComparisonDirectionId: IKpiComparisonDirection) => void;
}

export const KpiComparisonDirectionDropdown: React.FC<IKpiComparisonDirectionDropdownProps> = (props) => {
    const { comparisonDirectionId, onComparisonDirectionChanged } = props;
    const intl = useIntl();

    const buttonValue = comparisonDirectionId
        ? intl.formatMessage(messages[comparisonDirectionId])
        : intl.formatMessage(placeholderMessage);

    return (
        <div>
            <FormattedMessage id="configurationPanel.increasingNumberIs" tagName="label" />
            <Dropdown
                alignPoints={alignPoints}
                className="s-growing_number_is"
                renderButton={({ isOpen, toggleDropdown }) => (
                    <DropdownButton
                        title={buttonValue}
                        value={buttonValue}
                        className={comparisonDirectionId ? `type-${comparisonDirectionId}` : ""}
                        isOpen={isOpen}
                        onClick={toggleDropdown}
                    />
                )}
                closeOnParentScroll
                closeOnMouseDrag
                renderBody={({ closeDropdown }) => (
                    <DropdownList
                        className="configuration-dropdown growing-number-is-list"
                        width={CONFIG_PANEL_INNER_WIDTH}
                        items={directionOrder}
                        renderItem={({ item }) => {
                            const selected = comparisonDirectionId === item;

                            return (
                                <SingleSelectListItem
                                    title={intl.formatMessage(messages[item])}
                                    isSelected={selected}
                                    onClick={() => {
                                        onComparisonDirectionChanged(item);
                                        closeDropdown();
                                    }}
                                />
                            );
                        }}
                    />
                )}
            />
        </div>
    );
};
