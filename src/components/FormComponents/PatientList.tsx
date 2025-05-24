import { useState } from "react";
import type { Patient } from "../../types/Patient";
import {
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useLiveQuery } from "@electric-sql/pglite-react";
import { InputAdornment, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export const PatientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "email">("name");
  const [loading, setLoading] = useState(false);
  const items = useLiveQuery<Patient>(`
    SELECT *
    FROM patients;
  `);
  const [filteredPatients, setFilteredPatients] = useState<Patient[] | null>(
    null
  );

  const handleSearch = () => {
    if (!items?.rows) return;

    setLoading(true);

    const filtered = items.rows.filter((patient) => {
      const target =
        searchType === "name"
          ? `${patient.first_name} ${patient.last_name}`.toLowerCase()
          : patient.email?.toLowerCase();

      return target?.includes(searchTerm.toLowerCase());
    });

    setFilteredPatients(filtered);
    setLoading(false);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  };

  if (!items) {
    return (
      <Box py={6} textAlign="center">
        <CircularProgress />
        <Typography mt={2} color="text.secondary">
          Loading patients...
        </Typography>
      </Box>
    );
  }

  const handleClear = () => {
    setSearchTerm("");
    setFilteredPatients(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <PersonOutlineIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={600}>
          Patient Records
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          ({(filteredPatients ?? items?.rows)?.length ?? 0} total)
        </Typography>
      </Box>

      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid size={{ xs: 6, md: 8 }}>
          <TextField
            label="Search patients"
            fullWidth
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            aria-label="Search patients"
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    size="small"
                    onClick={() => handleClear()}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="search-type-label">Search by</InputLabel>
            <Select
              labelId="search-type-label"
              value={searchType}
              label="Search by"
              onChange={(e) =>
                setSearchType(e.target.value as "name" | "email")
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ minHeight: "40px" }}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box textAlign="center" py={6}>
          <CircularProgress />
          <Typography mt={2} color="text.secondary">
            Loading patients...
          </Typography>
        </Box>
      ) : (filteredPatients ?? items?.rows)?.length === 0 ? (
        <Box py={6} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No patients found.
          </Typography>
          {searchTerm && (
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria.
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="patient table">
            <caption
              style={{ captionSide: "top", textAlign: "left", padding: "8px" }}
            >
              Displaying {(filteredPatients ?? items?.rows)?.length} patient(s)
            </caption>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Registered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(filteredPatients ?? items?.rows ?? []).map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{`${patient.first_name} ${patient.last_name}`}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                  <TableCell>
                    {patient.gender ? (
                      <Chip
                        label={patient.gender}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="N/A" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(patient.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
