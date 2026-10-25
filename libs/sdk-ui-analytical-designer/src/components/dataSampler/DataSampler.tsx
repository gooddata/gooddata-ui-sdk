// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    deleteDataSamplingPercentage as deleteDataSamplingPercentageAction,
    updateDataSamplingPercentage as updateDataSamplingPercentageAction,
} from "../../actions/data_sample_actions.js";
import {
    DATA_SAMPLING_PERCENTAGE,
    DATA_SAMPLING_URL,
    DEFAULT_DATA_SAMPLING_PERCENTAGE,
} from "../../constants/data_sampling.js";
import { isDataSamplingEnabled as isDataSamplingEnabledSelector } from "../../selectors/feature_flag_selector.js";
import { type AppDispatch } from "../../store/types.js";

import { DataSamplerDropdown } from "./DataSamplerDropdown.js";

export function DataSampler({ isSmallScreen }: { isSmallScreen?: boolean }) {
    const dispatch = useDispatch<AppDispatch>();
    const isDataSamplingEnabled = useSelector(isDataSamplingEnabledSelector);

    const updateDataSamplingPercentage = useCallback(
        (percentage: number) => {
            dispatch(updateDataSamplingPercentageAction(percentage));
        },
        [dispatch],
    );

    const deleteDataSamplingPercentage = useCallback(() => {
        dispatch(deleteDataSamplingPercentageAction());
    }, [dispatch]);

    // The host owns the workspace in the pathname (/workspace/<id>/analyze), so the hash-less URL
    // already identifies the workspace the sampling setting belongs to.
    const currentLocation = window.location.href.replace(window.location.hash, "");
    const [isDataSamplingChecked, setDataSamplingChecked] = useState(
        window.sessionStorage.getItem(DATA_SAMPLING_URL) === currentLocation || false,
    );
    const [storedDataSamplePercentage, setStoredDataSamplePercentage] = useState(
        parseFloat(window.sessionStorage.getItem(DATA_SAMPLING_PERCENTAGE)) ||
            DEFAULT_DATA_SAMPLING_PERCENTAGE,
    );
    const intl = useIntl();

    useEffect(() => {
        if (isDataSamplingChecked) {
            updateDataSamplingPercentage(storedDataSamplePercentage);
        } else {
            deleteDataSamplingPercentage();
        }
    }, [
        isDataSamplingChecked,
        storedDataSamplePercentage,
        deleteDataSamplingPercentage,
        updateDataSamplingPercentage,
    ]);

    const onDataSamplingCheck = () => {
        if (isDataSamplingChecked) {
            window.sessionStorage.removeItem(DATA_SAMPLING_URL);
        } else {
            window.sessionStorage.setItem(DATA_SAMPLING_URL, currentLocation);
        }

        setDataSamplingChecked(!isDataSamplingChecked);
    };

    const setDataSamplingPercentage = (percentage: number) => {
        window.sessionStorage.setItem(DATA_SAMPLING_PERCENTAGE, percentage.toString());
        setStoredDataSamplePercentage(percentage);
    };

    return isDataSamplingEnabled ? (
        <div
            className={cx("adi-data-sampler", {
                "adi-data-sampler-small-screen": isSmallScreen,
            })}
        >
            <BubbleHoverTrigger>
                <div className="adi-data-sampler-toggler">
                    <label className="input-checkbox-toggle s-checkbox-toggle-label adi-data-sampler-checkbox-wrapper">
                        <input
                            type="checkbox"
                            className="s-checkbox-toggle"
                            id={"data-sampler-toggler"}
                            name={"data-sampler-toggler"}
                            checked={isDataSamplingChecked}
                            onChange={() => onDataSamplingCheck()}
                        />
                        <span
                            className={cx("input-label-text adi-data-sampler-checkbox-icon", [
                                {
                                    "data-sampler-checked": isDataSamplingChecked,
                                },
                            ])}
                        />
                    </label>

                    <label className="adi-data-sampler-toggler-label" htmlFor="data-sampler-toggler">
                        {intl.formatMessage({
                            id: "dataSampler.checkbox.label",
                        })}
                    </label>
                </div>

                {!isDataSamplingChecked && (
                    <Bubble alignPoints={[{ align: "bc tr" }]}>
                        <FormattedMessage
                            id="dataSampler.tooltip"
                            values={{ b: (chunks) => <b>{chunks}</b> }}
                        />
                    </Bubble>
                )}
            </BubbleHoverTrigger>
            <DataSamplerDropdown
                isDisabled={!isDataSamplingChecked}
                dataSamplerPercentage={storedDataSamplePercentage}
                setDataSamplePercentageValue={setDataSamplingPercentage}
            />
        </div>
    ) : null;
}
