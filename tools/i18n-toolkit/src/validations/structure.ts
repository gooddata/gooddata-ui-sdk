// (C) 2021-2025 GoodData Corporation

import { type ValidationError, Validator } from "jsonschema";

import { type LocalesStructure, LocalizationSchema } from "../schema/localization.js";
import { done, fail, message, skipped } from "../utils/console.js";

interface IStructureError {
    file: string;
    path: string;
    instance: unknown;
    message: string;
}

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
    const mergedErrors: IStructureError[] = localizations.flatMap(([file, localization]) =>
        validator.validate(localization, LocalizationSchema).errors.map((err: ValidationError) => ({
            file,
            path: err.path.join("."),
            instance: err.instance,
            message: err.message,
        })),
    );

    if (mergedErrors.length) {
        fail(`Structure check ends with ${mergedErrors.length} errors.`, true);

        const errorDetails = mergedErrors
            .map(
                (err) =>
                    `  Key: "${err.path}"\n` +
                    `  File: ${err.file}\n` +
                    `  Issue: ${err.message}\n` +
                    `  Value: ${JSON.stringify(err.instance)}`,
            )
            .join("\n\n");

        throw new Error(`Structure of localizations is not correct.\n\n${errorDetails}`);
    } else {
        done("Done", debug);
    }
}
