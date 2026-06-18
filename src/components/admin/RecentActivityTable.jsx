import {
  Card,
  CardHeader,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TableContainer
} from "@mui/material";

import { roleColors } from "../../data/mockData";

export default function RecentActivityTable({ activity = [] }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        title="Recent Activity"
        titleTypographyProps={{
          variant: "h6",
          fontWeight: "bold"
        }}
      />

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">

          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {activity.map((row, index) => (
              <TableRow key={index} hover>

                <TableCell>
                  {row.date}
                </TableCell>

                <TableCell>
                  {row.user}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={row.role}
                    color={roleColors[row.role] || "default"}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  {row.action}
                </TableCell>

              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
    </Card>
  );
}