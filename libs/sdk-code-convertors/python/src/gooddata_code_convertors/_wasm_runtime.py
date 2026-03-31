# (C) 2026 GoodData Corporation

"""Low-level WASM runtime for code convertors via wasmtime."""

import atexit
import json
import os
import tempfile
from pathlib import Path
from typing import Any

from wasmtime import Config, Engine, Linker, Module, Store, WasiConfig

def _find_wasm_binary() -> Path:
    """Locate the WASM binary: packaged in wheel, or via env override for development."""
    # 1. Packaged location (inside the wheel)
    packaged = Path(__file__).parent / "_data" / "convertors.wasm"
    if packaged.exists():
        return packaged
    # 2. Environment override for development/testing
    env_path = os.environ.get("GOODDATA_CONVERTORS_WASM")
    if env_path:
        p = Path(env_path)
        if p.exists():
            return p
    # 3. Not found
    return packaged  # will fail with clear error in _ensure_loaded()


_WASM_PATH = _find_wasm_binary()

# Cache Engine and Module (expensive to create, thread-safe, immutable).
# A fresh Store is created per call (cheap, holds per-call state).
_engine: Engine | None = None
_module: Module | None = None
_linker: Linker | None = None


def _ensure_loaded() -> tuple[Engine, Module, Linker]:
    global _engine, _module, _linker
    if _engine is None:
        if not _WASM_PATH.exists():
            raise FileNotFoundError(
                f"WASM binary not found at {_WASM_PATH}. "
                "Build it with: cd sdk/libs/sdk-code-convertors && npm run build-wasm"
            )
        # Build all objects before assigning globals so a partial failure
        # doesn't leave a broken cached state.
        engine = Engine(Config())
        module = Module.from_file(engine, str(_WASM_PATH))
        linker = Linker(engine)
        linker.define_wasi()
        _engine, _module, _linker = engine, module, linker
    return _engine, _module, _linker


def _cleanup() -> None:
    """Release WASM resources before interpreter shutdown to avoid tokio runtime panic."""
    global _engine, _module, _linker
    _linker = None
    _module = None
    _engine = None


atexit.register(_cleanup)


class ConversionError(Exception):
    """Raised when a WASM converter function returns an error."""

    def __init__(self, message: str, stack: str | None = None):
        self.stack = stack
        super().__init__(message)


def call(function_name: str, *args: Any) -> Any:
    """Execute a converter function via the WASM JSON-RPC protocol.

    Args:
        function_name: The converter function name (e.g. "yamlMetricToDeclarative").
        *args: Arguments to pass to the converter function.

    Returns:
        The result value from the converter.

    Raises:
        ConversionError: If the converter returns an error.
    """
    engine, module, linker = _ensure_loaded()

    payload = json.dumps({"function": function_name, "args": list(args)})

    # Use delete=False so WASI can open the files by path (Windows locks
    # NamedTemporaryFile with delete=True, blocking other handles).
    stdin_path = stdout_path = None
    try:
        stdin_tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        stdin_path = stdin_tmp.name
        stdout_tmp = tempfile.NamedTemporaryFile(mode="r", suffix=".json", delete=False)
        stdout_path = stdout_tmp.name

        stdin_tmp.write(payload)
        stdin_tmp.close()
        stdout_tmp.close()

        store = Store(engine)
        wasi = WasiConfig()
        wasi.stdin_file = stdin_path
        wasi.stdout_file = stdout_path
        wasi.inherit_stderr()
        store.set_wasi(wasi)

        instance = linker.instantiate(store, module)
        start = instance.exports(store)["_start"]
        start(store)

        with open(stdout_path, "r") as f:
            output = f.read()
    finally:
        for path in (stdin_path, stdout_path):
            if path:
                try:
                    os.unlink(path)
                except OSError:
                    pass

    result = json.loads(output)

    if "error" in result:
        raise ConversionError(result["error"], result.get("stack"))

    return result["result"]
