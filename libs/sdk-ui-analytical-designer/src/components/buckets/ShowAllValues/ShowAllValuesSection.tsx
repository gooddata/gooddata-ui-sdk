// (C) 2022-2026 GoodData Corporation

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ConfigurationCheckbox } from "../measure/ConfigurationCheckbox.js";

export interface IShowAllValuesSectionExternalProps {
    showAllValues: boolean;
    onChangeShowAllValues: (showAllValues: boolean) => void;
    visible: boolean;
}

interface IShowAllValuesSectionInternalProps {
    label: string;
    tooltip: string;
    className?: string;
}

type IShowAllValuesSectionProps = IShowAllValuesSectionExternalProps & IShowAllValuesSectionInternalProps;
export function ShowAllValuesSection({
    showAllValues,
    onChangeShowAllValues,
    tooltip,
    label,
    visible,
    className,
}: IShowAllValuesSectionProps) {
    if (!visible) {
        return null;
    }

    return (
        <section className={className}>
            <div className="adi-show-all-values-section">
                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                    <ConfigurationCheckbox
                        checked={showAllValues}
                        disabled={false}
                        onChange={onChangeShowAllValues}
                        label={label}
                        name="show-all-values"
                    />
                    <Bubble alignPoints={[{ align: "cr cl" }]} arrowOffsets={{ "cr cl": [6, 0] }}>
                        {tooltip}
                    </Bubble>
                </BubbleHoverTrigger>
            </div>
        </section>
    );
}
