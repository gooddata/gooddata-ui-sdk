// (C) 2021-2022 GoodData Corporation

import { Validator, ValidationError } from "jsonschema";
import flatten from "lodash/flatten";

import { LocalizationSchema, LocalesStructure } from "../schema/localization";
import { done, skipped, error, message } from "../utils/console";

export async function getStructureCheck(
    localizations: Array<LocalesStructure>,
    run: boolean = true,
    debug: boolean = false,
) {
    if (!run) {
        skipped("Structure check is skipped", true);
        return;
    }

    message("Structure check is starting ...", debug);

    const validator = new Validator();
    const errors = localizations.map(
        (localization) => validator.validate(localization, LocalizationSchema).errors,
    );
    const mergedErrors = flatten(errors);

    if (mergedErrors.length) {
        const instancesOfErrors = mergedErrors.map((err: ValidationError) => err.instance);

        error(`Structure check ends with ${mergedErrors.length} errors.`, true);
        throw new Error(
            `Structure of localizations is not correct, see: ${JSON.stringify(instancesOfErrors)}`,
        );
    } else {
        done("Done", debug);
    }
}
