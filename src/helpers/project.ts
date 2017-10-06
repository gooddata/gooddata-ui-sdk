import { Uri } from '@gooddata/data-layer';

export function getProjectIdByUri(uri: string): string {
    const regexExec: RegExpExecArray = Uri.REG_URI_OBJ.exec(uri);

    if (regexExec === null) {
        throw new Error('Project ID not found in URI');
    }

    return regexExec[1];
}
