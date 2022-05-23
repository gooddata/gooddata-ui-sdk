// (C) 2021-2022 GoodData Corporation

import { Validator, ValidationError } from "jsonschema";
import flatten from "lodash/flatten";

import { LocalizationSchema, LocalesStructure } from "../schema/localization";
import { done, skipped, message, fail } from "../utils/console";

export async function getStructureCheck(
    localizations: Array<[string, LocalesStructure]>,
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
        ([, localization]) => validator.validate(localization, LocalizationSchema).errors,
    );
    const mergedErrors = flatten(errors);

    if (mergedErrors.length) {
        const instancesOfErrors = mergedErrors.map((err: ValidationError) => err.instance);

        fail(`Structure check ends with ${mergedErrors.length} errors.`, true);
        throw new Error(
            `Structure of localizations is not correct, see: ${JSON.stringify(instancesOfErrors)}`,
        );
    } else {
        done("Done", debug);
    }
}
