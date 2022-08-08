// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { IMeasure, IMeasureDefinition, newMeasure } from "@gooddata/sdk-model";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaceholdersProvider, IPlaceholdersProviderProps } from "../context";
import { newPlaceholder } from "../factory";
import { IPlaceholder } from "../base";
import { usePlaceholders } from "../hooks";

const createComponent = (
    componentProps: IComponentWithUsePlaceholderHookProps,
    providerProps?: IPlaceholdersProviderProps,
) =>
    render(
        <PlaceholdersProvider {...providerProps}>
            <ComponentWithUsePlaceholderHook {...componentProps} />
        </PlaceholdersProvider>,
    );

interface IComponentWithUsePlaceholderHookProps {
    placeholders: IPlaceholder<any>[];
    onSetPlaceholders?: (currentValue: any[]) => any[];
}

const ComponentWithUsePlaceholderHook = (props: IComponentWithUsePlaceholderHookProps) => {
    const { onSetPlaceholders } = props;
    const [results, setPlaceholders] = usePlaceholders(props.placeholders);

    const onButtonClick = useCallback(() => {
        if (onSetPlaceholders) {
            setPlaceholders(onSetPlaceholders);
        }
    }, [onSetPlaceholders]);

    return (
        <div>
            <SetPlaceholderValueButton onClick={onButtonClick} />
            <ComponentWithResult results={results} />;
        </div>
    );
};

interface ISetPlaceholderValueButtonProps {
    onClick?: () => void;
}

const SetPlaceholderValueButton = ({ onClick }: ISetPlaceholderValueButtonProps) => {
    return <button onClick={onClick}>Placeholder</button>;
};

interface IComponentWithResultProps {
    results: IMeasure<IMeasureDefinition>[];
}
const ComponentWithResult = ({ results }: IComponentWithResultProps) => {
    return (
        <div>
            {results.map((res, i) => (
                <div key={i}>{res?.measure?.localIdentifier}</div>
            ))}
        </div>
    );
};

describe("usePlaceholders", () => {
    it("should resolve default placeholder values", () => {
        const measure = newMeasure("test-measure");
        const singleValuePlaceholder = newPlaceholder(measure);
        const multiValuePlaceholder = newPlaceholder([]);
        const { queryByText } = createComponent({
            placeholders: [singleValuePlaceholder, multiValuePlaceholder],
        });
        expect(queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
    });

    it("should update placeholder values", async () => {
        const measure = newMeasure("updated-measure");
        const measure2 = newMeasure("updated-measure2");
        const singleValuePlaceholder = newPlaceholder();
        const multiValuePlaceholder = newPlaceholder();

        const { getByText, queryByText } = createComponent({
            placeholders: [singleValuePlaceholder, multiValuePlaceholder],
            onSetPlaceholders: () => [measure, measure2],
        });
        const user = userEvent.setup();

        await user.click(getByText("Placeholder"));
        await waitFor(() => {
            expect(queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
            expect(queryByText(measure2.measure.localIdentifier)).toBeInTheDocument();
        });
    });
});
