import subprocess
import os
import sys


def retrain_model():

    BASE_DIR = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "ml.train"
        ],
        cwd=BASE_DIR,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise Exception(result.stderr)

    return {
        "success": True,
        "message": "Model retrained successfully",
        "output": result.stdout
    }