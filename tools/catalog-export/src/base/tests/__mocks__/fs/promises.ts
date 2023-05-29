// (C) 2023 GoodData Corporation
import type * as fsType from "fs/promises";

type MockedFs = typeof fsType & {
    __setMockFiles(files: { [path: string]: string }): void;
};

const fs = jest.genMockFromModule<MockedFs>("fs/promises");

let mockFiles = Object.create(null);
fs.__setMockFiles = function __setMockFiles(newMockFiles) {
    mockFiles = newMockFiles;
};
const readFile = (fs.readFile = async function (path: any) {
    if (mockFiles[path]) return mockFiles[path];

    const err = new Error("File does not exist");
    //@ts-ignore
    err.code = "ENOENT";
    throw err;
});

export default fs;
export { readFile };
