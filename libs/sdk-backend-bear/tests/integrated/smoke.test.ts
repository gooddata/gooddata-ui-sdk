// (C) 2020 GoodData Corporation

import { testBackend } from "./backend";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

describe("example wiremock test", () => {
    it("should read catalog for reference workspace", async () => {
        const result = await backend
            .workspace("l32xdyl4bjuzgf9kkqr2avl55gtuyjwf")
            .catalog()
            .load();

        expect(result).toMatchSnapshot();
    });
});
