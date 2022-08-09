// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { IMeasure, IMeasureDefinition, newMeasure } from "@gooddata/sdk-model";

import { PlaceholdersProvider, IPlaceholdersProviderProps } from "../context";
import { newPlaceholder } from "../factory";
import { IPlaceholder } from "../base";
import { usePlaceholder } from "../hooks";

import { setupComponent } from "../../../tests/testHelper";

const createComponent = (
    componentProps: IComponentWithUsePlaceholderHookProps,
    providerProps?: IPlaceholdersProviderProps,
) =>
    setupComponent(
        <PlaceholdersProvider {...providerProps}>
            <ComponentWithUsePlaceholderHook {...componentProps} />
        </PlaceholdersProvider>,
    );

interface IComponentWithUsePlaceholderHookProps {
    placeholder?: IPlaceholder<any>;
    onSetPlaceholder?: (currentValue: any) => any;
}

const ComponentWithUsePlaceholderHook = (props: IComponentWithUsePlaceholderHookProps) => {
    const { onSetPlaceholder } = props;
    const [result, setPlaceholder] = usePlaceholder(props.placeholder);

    const onButtonClick = useCallback(() => {
        if (onSetPlaceholder) {
            setPlaceholder(onSetPlaceholder);
        }
    }, [onSetPlaceholder]);

    return (
        <div>
            <SetPlaceholderValueButton onClick={onButtonClick} />
            <ComponentWithResult result={result} />;
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
    result: IMeasure<IMeasureDefinition>;
}
const ComponentWithResult = ({ result }: IComponentWithResultProps) => {
    return (
        <div>
            <pre>{result?.measure?.localIdentifier}</pre>
        </div>
    );
};

describe("usePlaceholder", () => {
    it("should resolve default placeholder value", () => {
        const measure = newMeasure("test-measure");
        const singleValuePlaceholder = newPlaceholder(measure);
        const { queryByText } = createComponent({ placeholder: singleValuePlaceholder });

        expect(queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
    });

    it("should update placeholder value", async () => {
        const measure = newMeasure("updated-measure");
        const singleValuePlaceholder = newPlaceholder();
        const { queryByText, getByText, user } = createComponent({
            placeholder: singleValuePlaceholder,
            onSetPlaceholder: () => measure,
        });

        await user.click(getByText("Placeholder"));
        expect(queryByText(measure.measure.localIdentifier)).toBeInTheDocument();
    });
});
