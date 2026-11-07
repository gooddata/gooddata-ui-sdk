// (C) 2021-2026 GoodData Corporation

import {
    type Dispatch,
    type ReactElement,
    type Ref,
    type SetStateAction,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";

import { type KeyBinding } from "@codemirror/view";
import { flushSync } from "react-dom";
import { type Root, createRoot } from "react-dom/client";
import { useIntl } from "react-intl";

import { type IMetadataObject } from "@gooddata/sdk-model";
import {
    type IIconProps,
    IconArrowDown,
    IconArrowUp,
    IconAttribute,
    IconClose,
    IconDataset,
    IconFact,
    IconFunction,
    IconKeyword,
    IconLabel,
    IconMetric,
    IconQuestionMark,
} from "@gooddata/sdk-ui-kit";
import { _isEmpty } from "@gooddata/util";

import { type IMaqlEditorIcon } from "../../../MaqlEditor/codemirror/CodeEditor.styles.js";
import { type IMaqlEditorApi, MaqlEditor } from "../../../MaqlEditor/maql/MaqlEditor.js";
import { useEvents } from "../../../shared/eventing/useEvents.js";
import { makeStyles } from "../../../shared/theme/index.js";
import { FormField } from "../data.js";
import { useMetricFormField } from "../hooks/useMetricFormField.js";
import { useMetricFormStatus } from "../hooks/useMetricFormStatus.js";
import { Placeholder } from "../MaqlEditorUtils/Placeholder.js";
import { type MaqlValue, getMaqlValue, useMaqlField } from "../maqlFieldFunctions.js";

import { events } from "./MaqlEditorField.events.js";
import { useDocumentationLinkProcessing } from "./suggestionDetailsFunctions.js";

const useStyles = makeStyles()(() => ({
    root: {
        flex: "1 1 auto",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
}));

export interface IMaqlEditorEditorProps {
    ref?: Ref<IMaqlEditorApi | null>;
    titles?: boolean;
    onMetricOpen?: (object: IMetadataObject) => void;
    onRun?: () => void;
}

function serializeReactElementToSvg(element: ReactElement<IIconProps>): IMaqlEditorIcon {
    // Create a temporary container element
    const container = document.createElement("div");
    const root: Root = createRoot(container);

    // Render the React element synchronously using flushSync
    flushSync(() => {
        root.render(element);
    });

    // Get the rendered HTML
    const html = container.innerHTML;

    // Clean up
    root.unmount();

    return {
        base64: btoa(html),
        width: element.props.width,
        height: element.props.height,
    };
}

const icons = Object.fromEntries(
    Object.entries({
        fact: <IconFact width={18} height={16} />,
        metric: <IconMetric width={18} height={14} />,
        dataset: <IconDataset width={18} height={14} />,
        label: <IconLabel width={18} height={16} />,
        attribute: <IconAttribute width={18} height={7} />,
        keyword: <IconKeyword width={18} height={16} />,
        function: <IconFunction width={18} height={16} />,
        detail: <IconQuestionMark color="#94a1ad" width={16} height={16} />,
        prev: <IconArrowUp width={10} height={13} />,
        next: <IconArrowDown width={10} height={14} />,
        close: <IconClose width={12} height={12} />,
    }).map(([key, component]) => [key, serializeReactElementToSvg(component)]),
);

export const MaqlEditorEditor = forwardRef<IMaqlEditorApi, IMaqlEditorEditorProps>(function MaqlEditorEditor(
    { onMetricOpen, onRun, titles },
    ref,
) {
    const { classes, cx } = useStyles();
    const intl = useIntl();
    const { value, valid, element, isReadOnly, onBlur, onChange } = useMetricFormField(FormField.expression);

    const [autofocus, setAutofocus] = useState(false);
    const [autohints, setAutoHints] = useAutohint(!valid);

    const isMaqlEditorEmpty = _isEmpty(getMaqlValue(value));

    const [onChanged, onValidation] = useMaqlField(value, onChange);
    const onBlurHandler = useBlur(value, onBlur, setAutoHints, setAutofocus);
    const onMetricOpenHandler = useCallback(
        (_editor: unknown, object: IMetadataObject) => onMetricOpen?.(object),
        [onMetricOpen],
    );

    const onEditorMount = useEditorMount();
    const onToggleSuggestionDetails = useTrackSuggestionDetails();
    const keyBindings = useRunKeyBinding(onRun);

    useImperativeHandle<Pick<HTMLTextAreaElement, "focus">, { focus: () => void }>(element, () => ({
        focus: () => setAutofocus(true),
    }));

    return (
        <div className={cx(classes.root)}>
            <Placeholder
                visible={isMaqlEditorEmpty}
                readonly={isReadOnly}
                selector={".cm-editor .cm-content .cm-line"}
            />
            <MaqlEditor
                autohint={autohints}
                decorators={titles}
                autofocus={autofocus}
                readonly={isReadOnly}
                defaultValue={getMaqlValue(value)}
                icons={icons}
                ariaLabel={intl.formatMessage({ id: "metricComponent.editMetric.metric.definition" })}
                keyBindings={keyBindings}
                onBlur={onBlurHandler}
                onValid={onValidation}
                onChange={onChanged}
                onEditorMount={onEditorMount}
                onMetricOpen={onMetricOpenHandler}
                onToggleSuggestionDetails={onToggleSuggestionDetails}
                ref={ref}
            />
        </div>
    );
});

/**
 * Reports to the telemetry that the user showed or hid the documentation of the suggestions.
 */
function useTrackSuggestionDetails(): () => void {
    const { editorToggleSuggestionDetailsEvent } = useEvents(events);

    return useCallback(() => editorToggleSuggestionDetailsEvent(), [editorToggleSuggestionDetailsEvent]);
}

function useBlur(
    value: MaqlValue,
    onBlur: () => void,
    setAutoHints: (s: boolean) => void,
    setAutofocus: (s: boolean) => void,
) {
    const { metricDefinitionCreatedEvent } = useEvents(events);

    return useCallback(() => {
        if (getMaqlValue(value).length > 0) {
            metricDefinitionCreatedEvent();
        }

        onBlur();
        setAutoHints(false);
        setAutofocus(false);
    }, [value, onBlur, setAutoHints, setAutofocus, metricDefinitionCreatedEvent]);
}

function useEditorMount() {
    const processDocumentationClick = useDocumentationLinkProcessing();

    useEffect(() => {
        document.body.addEventListener("click", processDocumentationClick);

        return () => {
            document.body.removeEventListener("click", processDocumentationClick);
        };
    }, [processDocumentationClick]);

    return useCallback(() => {
        // nothing to set up on the editor itself
    }, []);
}

function useRunKeyBinding(onRun?: () => void): KeyBinding[] {
    return useMemo(
        () => [
            {
                key: "Mod-r",
                run: () => {
                    onRun?.();
                    return true;
                },
            },
        ],
        [onRun],
    );
}

function useAutohint(invalid: boolean): [boolean, Dispatch<SetStateAction<boolean>>] {
    const [autohints, setAutoHints] = useState(false);
    const { submitCount } = useMetricFormStatus();

    useEffect(() => {
        if (submitCount > 0) {
            setAutoHints(invalid);
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [submitCount]);

    return [autohints, setAutoHints];
}
