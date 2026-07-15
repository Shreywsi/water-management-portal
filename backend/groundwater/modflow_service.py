from .build_model import create_modflow_model


def run_modflow():
    try:
        result = create_modflow_model()
        return result

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }