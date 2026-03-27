"""Smoke test: load convertors.wasm via wasmtime and verify the stdin/stdout JSON protocol."""

import json
import os
import tempfile
from pathlib import Path

from wasmtime import Config, Engine, Linker, Module, Store, WasiConfig

WASM_PATH = Path(__file__).parent / "convertors.wasm"


def run_wasm(payload: dict) -> dict:
    config = Config()
    engine = Engine(config)
    module = Module.from_file(engine, str(WASM_PATH))

    linker = Linker(engine)
    linker.define_wasi()

    stdout_chunks = bytearray()

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json") as stdin_tmp:
        stdin_tmp.write(json.dumps(payload))
        stdin_tmp.flush()

        store = Store(engine)
        wasi = WasiConfig()
        wasi.stdin_file = stdin_tmp.name
        wasi.stdout_custom = lambda chunk: stdout_chunks.extend(chunk)
        wasi.inherit_stderr()
        store.set_wasi(wasi)

        instance = linker.instantiate(store, module)
        start = instance.exports(store)["_start"]
        start(store)

    return json.loads(stdout_chunks.decode())


def test_valid_conversion():
    result = run_wasm({
        "function": "yamlMetricToDeclarative",
        "args": ["metric:\n  title: Revenue\n  format: '#,##0'\n  expression: SELECT {metric/order_amount}\n"],
    })
    assert "result" in result, f"Expected 'result' key, got: {result}"
    print(f"  PASS: valid conversion returns result")


def test_unknown_function():
    result = run_wasm({
        "function": "nonExistentFunction",
        "args": [],
    })
    assert "error" in result, f"Expected 'error' key, got: {result}"
    assert "Unknown function" in result["error"], f"Unexpected error: {result['error']}"
    assert "available" in result, f"Expected 'available' key, got: {result}"
    print(f"  PASS: unknown function returns error with available list")


if __name__ == "__main__":
    assert WASM_PATH.exists(), f"{WASM_PATH} not found — run 'npm run build' first"

    print("Running Python WASM smoke tests...\n")
    test_valid_conversion()
    test_unknown_function()
    print(f"\nAll tests passed.")
    # Exit immediately to avoid wasmtime tokio runtime panic during cleanup
    os._exit(0)
