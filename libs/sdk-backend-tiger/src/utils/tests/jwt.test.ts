// (C) 2023-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { computeExpirationReminderTimeout, decodeJwtPayload, validateJwt } from "../jwt.js";

const jwt1 =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1VMm9wT2xnRzV0UFlKNm9pSk9VczFUMXB1OCJ9.eyJzdWIiOiJwZXRyLmRvbGVqc2kiLCJuYW1lIjoiUGV0ciBEb2xlanNpIiwiaWF0IjoxNjg5MTY0MTk3LCJqdGkiOiI3N2ZkZDI4OS00MDkyLTRkMzQtOThmNC00ZDRkN2YyNWZjMTQiLCJleHAiOjE2ODkxNjQyMjd9.keJ9yKu7DuIMM7Z3N8Aaw44PRHqS4NI2FSYcuvABlDz-j2dw3Nc5Djt5qczr_Yfs0HahmstZugoUoszzrc6S9UcJLaoeljn9Ftouwuqr8ArzVurdk51xQDK2u4fMx-S96J93MCbBg2onRoE0WHxzrENwt82QwVXD44dObqYXEzFFh3E5z65F3XMUeuI_BLwAsrdTVwqA9ZyYaXIqOFXFaFZwrXK2EVjg_NISLx0I-8g6yzpVrS5d32ezhWM0aRiy-O2P-b0SC1Eu_BX9FXiSqNvZnkRiERFCfYYYQrf9TvobC7UesBj1bYfgNgHHP18wd2Zru1-V5mvdEnAF19omAw";
const jwt2 =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1VMm9wT2xnRzV0UFlKNm9pSk9VczFUMXB1OCJ9.eyJzdWIiOiJwZXRyLmRvbGVqc2kiLCJuYW1lIjoiUGV0ciBEb2xlanNpIiwiaWF0IjoxNjg5MTY0Mzg5LCJqdGkiOiIxNGNkMTVlYi1lYjgwLTQ1ZGUtOTk2OS1kMjEzZjdiZjVkY2UiLCJleHAiOjE2ODkxNjQ0MTl9.MpIMB1d5JYaxojkrtswN4eaGlH3FKsISnqb7f8iETWDtv6D4J6cJJIuJg34q9v7C8--mAEVVbUyDI4U6jlP4TJ0P2tcvkTmFEjXWLrweOum_E_MzcxvUekksV-k9kIfG6dv0Q11uQn_g7tV40w0GLaPxFPZvOvvNfsXTs1OQlsn_6QpL2-XPQuNE-BE2e9OogOzA_h3A-EkiJCLHn-sn1aNgiRZEeiMweMLuQ2KhMpEFZIrHvA8QHG2QXWtdeeQ05PD6-LnghZRDBLWXxuz7x5JSBapC90R3D4acJ5639Krwvb2x4bKc8sJOm9TPBZ79lKdqKKl4YboNPeX1dDzbTg";
const jwt3 =
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1VMm9wT2xnRzV0UFlKNm9pSk9VczFUMXB1OCJ9.eyJzdWIiOiJtb3J0IiwibmFtZSI6IlBldHIgRG9sZWpzaSIsImlhdCI6MTY4OTE2NDQxMCwianRpIjoiOTNmMWI5OGItOWFmNC00OGZiLTgwMGEtN2VlNThhYTA0NjFhIiwiZXhwIjoxNjg5MTY0NDQwfQ.HFEa5Xx5AWaSV16fT7oFWeovKV1WRrqdsyOfQpE8vR-BfNnEVMJ68vO5emM02O-fPvZAjsvwMUjV65YRondSSWo-OKVCVL1DMHzytwA_mAUJyQhXv8WqFa8bdeVrKiV1S3w51p2JmKFLfmBz_EVX5HTSzFlkEXa8MYttiiO_hPOJ3b_F6sv-wiVgTrGDjSn3JJ0tbysC_DCHhc0q-z1LL3t_20lkpOa_1fOGahVOwkXgyn66Fgm7ipTTtz9kxvN2IBy-lVIv-ixqQBW9PlMUosPdn4hMGRz-93qZmByzL3XsdhpfdORr6poQF1lpXxImQg03gXAREoh_vduAF2GK3g";

describe("jwt", () => {
    describe("decodeJwtPayload", () => {
        it("should throw when token is not provided", () => {
            expect(() => decodeJwtPayload("")).toThrowError();
        });

        it("should parse payload of JWT", () => {
            expect(decodeJwtPayload(jwt1)).toMatchSnapshot();
        });
    });

    describe("validateJwt", () => {
        it("should not throw when two different JWTs from the same subject are provided", () => {
            expect(() => validateJwt(jwt1, jwt2)).not.toThrowError();
        });

        it("should throw when two different JWTs for the different subjects are provided", () => {
            expect(() => validateJwt(jwt2, jwt3)).toThrowError();
        });
    });

    describe("computeExpirationReminderTimeout", () => {
        it("should correctly count the time to expiration reminder in milliseconds", () => {
            const timeout = computeExpirationReminderTimeout(jwt1, 6, 1689164199625);
            expect(timeout).toBe(21375);
        });
    });
});
