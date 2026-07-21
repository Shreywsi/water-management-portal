from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=2)
def retrain_model_task(self, location_id):
    from ml.retrain import retrain_model
    try:
        result = retrain_model(location_id)
        logger.info("Model retrained for location %s: %s", location_id, result)
        return result
    except Exception as exc:
        logger.exception("Retrain failed for location %s", location_id)
        raise self.retry(exc=exc, countdown=60)