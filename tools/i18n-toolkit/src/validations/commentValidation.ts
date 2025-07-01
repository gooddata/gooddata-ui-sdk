// (C) 2021-2025 GoodData Corporation

import { LocalesStructure, LocalesItem } from "../schema/localization.js";
import { message, error, skipped, done, fail } from "../utils/console.js";

const FILENAME_CHECK_ONLY = "en-US.json";
const COMMENT_PROPERTY: keyof LocalesItem = "comment";
const COMMENT_LENGTH_MIN = 3;

function hasValidComment(value: LocalesItem): boolean {
    const comment = value[COMMENT_PROPERTY];
    return comment && comment.toString().trim().length >= COMMENT_LENGTH_MIN;
}

function collectCommentErrors(localizations: Array<[string, LocalesStructure]>, debug: boolean): string[] {
    const errors: string[] = [];

    for (const [file, content] of localizations) {
        if (!file.includes(FILENAME_CHECK_ONLY)) {
            continue;
        }

        for (const [key, value] of Object.entries(content)) {
            if (typeof value === "string") {
                continue;
            }

            if (!hasValidComment(value)) {
                const errorMessage = ` ${errors.length + 1}. ${key} (${file})`;
                errors.push(errorMessage);

                if (debug) {
                    error(new Error(errorMessage));
                }
            }
        }
    }

    return errors;
}

export async function getCommentValidationCheck(
    localizations: Array<[string, LocalesStructure]>,
    run: boolean,
    debug: boolean,
): Promise<void> {
    if (!run) {
        skipped("Comment validation check is skipped", true);
        return;
    }

    message("Comment validation check is starting ...", debug);

    const errors = collectCommentErrors(localizations, debug);

    if (errors.length > 0) {
        const errorMessage = `Missing comments for ${errors.length} strings:\n${errors.join("\n")}`;
        fail(errorMessage, true);
        throw new Error(`Missing translation comments for ${errors.length} strings`);
    }

    done("Done", debug);
}
