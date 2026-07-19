import { useEffect, useState } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress
} from "@mui/material";

import { getAIDashboard } from "../../services/aiService";

export default function AIStatsCards() {

    const [summary, setSummary] = useState(null);

    useEffect(() => {

        async function loadData() {
            try {
                const data = await getAIDashboard();
                setSummary(data.summary);
            } catch (err) {
                console.error(err);
            }
        }

        loadData();

    }, []);

    if (!summary) {
        return <CircularProgress />;
    }

    const cards = [

        {
            title: "Training Rows",
            value: summary.training_rows
        },

        {
            title: "Datasets Uploaded",
            value: summary.dataset_count
        },

        {
            title: "Model Status",
            value: summary.model_ready ? "Ready" : "Not Ready"
        },

        {
            title: "Prediction",
            value: `${summary.prediction} m`
        }

    ];

    return (

        <Grid container spacing={3} sx={{ mb: 4 }}>

            {cards.map((card) => (

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={card.title}
                >

                    <Card elevation={4}>

                        <CardContent>

                            <Typography
                                color="text.secondary"
                                variant="body2"
                            >
                                {card.title}
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{ mt: 1 }}
                            >
                                {card.value}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            ))}

        </Grid>

    );
}