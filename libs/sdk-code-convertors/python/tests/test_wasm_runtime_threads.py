# (C) 2026 GoodData Corporation

"""Thread-safety tests for the lazily loaded WASM runtime.

Requires the WASM binary to be built first:
    cd sdk/libs/sdk-code-convertors && npm run build-wasm
"""

import os
import subprocess
import sys
import textwrap
from pathlib import Path

_SRC_DIR = Path(__file__).resolve().parent.parent / "src"

# Runs in a subprocess: losing the race makes wasmtime panic, which aborts the
# whole process instead of raising an exception.
_RACE_SCRIPT = textwrap.dedent(
    """
    import threading

    from gooddata_code_convertors import _wasm_runtime, yaml_metric_to_declarative

    THREADS = 16
    ROUNDS = 3
    METRIC = {"id": "revenue", "title": "Revenue", "maql": "SELECT 1"}

    for round_number in range(ROUNDS):
        _wasm_runtime._cleanup()
        barrier = threading.Barrier(THREADS)
        engines = []
        errors = []

        def worker():
            barrier.wait()
            try:
                engines.append(_wasm_runtime._ensure_loaded()[0])
                yaml_metric_to_declarative(METRIC)
            except Exception as error:
                errors.append(repr(error))

        threads = [threading.Thread(target=worker) for _ in range(THREADS)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

        assert not errors, f"round {round_number}: {errors}"
        # The list keeps every engine alive, so no two can share an id.
        engine_count = len({id(engine) for engine in engines})
        assert engine_count == 1, f"round {round_number}: {engine_count} engines"
    """
)


def test_concurrent_first_use_shares_one_engine():
    env = dict(os.environ)
    env["PYTHONPATH"] = os.pathsep.join(
        filter(None, [str(_SRC_DIR), env.get("PYTHONPATH")])
    )
    completed = subprocess.run(
        [sys.executable, "-c", _RACE_SCRIPT],
        capture_output=True,
        text=True,
        check=False,
        env=env,
        timeout=120,
    )
    assert completed.returncode == 0, (
        f"exit code {completed.returncode}\n"
        f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}"
    )
