// (C) 2023 GoodData Corporation
import type * as fsType from "fs/promises";

type MockedFs = typeof fsType & {
    __setMockFiles(files: { [path: string]: string }): void;
};

const fs = jest.genMockFromModule<MockedFs>("fs/promises");

class MockError extends Error {
    constructor(message: string, public code: string | number) {
        super(message);
    }
}

let mockFiles = Object.create(null);
fs.__setMockFiles = function __setMockFiles(newMockFiles) {
    mockFiles = newMockFiles;
};
const readFile = (fs.readFile = async function (path: any) {
    if (mockFiles[path]) return mockFiles[path];

    throw new MockError("File does not exist", "ENOENT");
});

export default fs;
export { readFile };
