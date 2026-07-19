import {
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";

export default function AIPredictionCard({ data }) {

  return (

    <Grid container spacing={3}>

      <Grid item xs={12} md={3}>

        <Card>

          <CardContent>

            <Typography
              color="text.secondary"
              gutterBottom
            >
              Predicted Water Balance
            </Typography>

            <Typography
              variant="h3"
              fontWeight="bold"
            >
              {data.prediction} mcm
            </Typography>

          </CardContent>

        </Card>

      </Grid>

      <Grid item xs={12} md={3}>

        <Card>

          <CardContent>

            <Typography
              color="text.secondary"
              gutterBottom
            >
              Confidence
            </Typography>

            <Typography
              variant="h3"
              color="primary"
              fontWeight="bold"
            >
              {data.confidence}%
            </Typography>

            <Typography>

              {data.confidence_level}

            </Typography>

          </CardContent>

        </Card>

      </Grid>

      <Grid item xs={12} md={3}>

        <Card>

          <CardContent>

            <Typography
              color="text.secondary"
              gutterBottom
            >
              Forecast Range
            </Typography>

            <Typography
              variant="h5"
              fontWeight="bold"
            >
              {data.prediction_range.lower} m

              <br />

              —

              <br />

              {data.prediction_range.upper} m

            </Typography>

          </CardContent>

        </Card>

      </Grid>

      <Grid item xs={12} md={3}>

        <Card>

          <CardContent>

            <Typography
              color="text.secondary"
              gutterBottom
            >
              Historical Dataset
            </Typography>

            <Typography
              variant="h3"
              fontWeight="bold"
            >
              {data.years_of_history}
            </Typography>

            <Typography>

              Years

            </Typography>

          </CardContent>

        </Card>

      </Grid>

      <Grid item xs={12}>

        <Card>

          <CardContent>

            <Typography
              variant="h5"
              fontWeight="bold"
            >
              Model Performance
            </Typography>

            <Divider sx={{ my:2 }} />

            <Grid container spacing={3}>

              <Grid item xs={6} md={2}>
                <Typography color="text.secondary">
                  RMSE
                </Typography>

                <Typography variant="h6">
                  {data.model_metrics.rmse}
                </Typography>
              </Grid>

              <Grid item xs={6} md={2}>
                <Typography color="text.secondary">
                  MAE
                </Typography>

                <Typography variant="h6">
                  {data.model_metrics.mae}
                </Typography>
              </Grid>

              <Grid item xs={6} md={2}>
                <Typography color="text.secondary">
                  R²
                </Typography>

                <Typography variant="h6">
                  {data.model_metrics.r2}
                </Typography>
              </Grid>

              <Grid item xs={6} md={3}>
                <Typography color="text.secondary">
                  Training Samples
                </Typography>

                <Typography variant="h6">
                  {data.model_metrics.train_samples}
                </Typography>
              </Grid>

              <Grid item xs={6} md={3}>
                <Typography color="text.secondary">
                  Testing Samples
                </Typography>

                <Typography variant="h6">
                  {data.model_metrics.test_samples}
                </Typography>
              </Grid>

            </Grid>

          </CardContent>

        </Card>

      </Grid>

    </Grid>

  );

}