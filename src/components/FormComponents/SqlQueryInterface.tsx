import {
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { useDatabase } from "../../hooks/useDatabaseHook";

export const SqlQueryInterface: React.FC = () => {
  const { db } = useDatabase();
  const [query, setQuery] = useState("SELECT * FROM patients LIMIT 10;");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const executeQuery = async () => {
    if (!query.trim() || !db) return;

    setLoading(true);
    setError("");
    setExecutionTime(null);

    try {
      const start = performance.now();
      const trimmedQuery = query.trim().toUpperCase();
      let result: any;

      if (
        trimmedQuery.startsWith("SELECT") ||
        trimmedQuery.startsWith("WITH") ||
        trimmedQuery.startsWith("SHOW") ||
        trimmedQuery.startsWith("EXPLAIN")
      ) {
        result = await db.query(query);
        setResults(Array.isArray(result) ? result : result?.rows || []);
      } else {
        result = await db.exec(query);
        setResults([
          {
            affected_rows: result.affectedRows,
            query_type: "modification",
          },
        ]);
      }

      const end = performance.now();
      setExecutionTime(end - start);
    } catch (err: any) {
      setError(`Query execution failed: ${err.message || "Unknown error"}`);
      console.error("Query error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "SELECT * FROM patients ORDER BY created_at DESC LIMIT 10;",
    "SELECT COUNT(*) as total_patients FROM patients;",
    "SELECT gender, COUNT(*) as count FROM patients WHERE gender IS NOT NULL GROUP BY gender;",
    "SELECT * FROM patients WHERE date_of_birth > '1990-01-01';",
    `SELECT 
      DATE_PART('year', AGE(CURRENT_DATE, date_of_birth::date)) as age,
      first_name, 
      last_name 
    FROM patients 
    WHERE date_of_birth IS NOT NULL
    ORDER BY age DESC;`,
    `SELECT 
      EXTRACT(MONTH FROM created_at) as month,
      COUNT(*) as registrations
    FROM patients 
    GROUP BY EXTRACT(MONTH FROM created_at)
    ORDER BY month;`,
  ];

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 24,
              height: 24,
              bgcolor: "primary.main",
              borderRadius: "50%",
              mr: 1,
            }}
          />
          <Typography variant="h5" fontWeight="bold">
            SQL Query Interface
          </Typography>
        </Stack>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Sample Queries</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {sampleQueries.map((sample, i) => (
                <Button
                  key={i}
                  variant="text"
                  onClick={() => setQuery(sample)}
                  sx={{ textTransform: "none", justifyContent: "start" }}
                >
                  {sample}
                </Button>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        <TextField
          label="SQL Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          InputProps={{
            sx: { fontFamily: "monospace", fontSize: "0.875rem" },
          }}
        />

        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            disabled={loading || !query.trim()}
            onClick={executeQuery}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Execute Query"}
          </Button>
          {executionTime !== null && (
            <Typography variant="body2" color="text.secondary">
              Execution Time: {executionTime.toFixed(2)} ms
            </Typography>
          )}
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {results.length > 0 && (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(results[0]).map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((val, j) => (
                      <TableCell key={j}>
                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {!loading && results.length === 0 && !error && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No results to display. Run a query to see results.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};
