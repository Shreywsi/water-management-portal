from ml.train import train_model
import traceback


def retrain_model(location_id):

    try:
        train_model(location_id)

        return {
            "success": True,
            "message": f"Location {location_id} retrained successfully."
        }

    except Exception as e:

        traceback.print_exc()

        return {
            "success": False,
            "message": str(e)
        }