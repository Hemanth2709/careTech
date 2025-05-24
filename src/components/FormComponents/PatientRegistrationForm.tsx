import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import type { PatientFormData } from "../../types/Patient";
import { usePGlite } from "@electric-sql/pglite-react";

export const PatientRegistrationForm: React.FC = () => {
  const db = usePGlite();

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleChange =
    (field: keyof PatientFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setError("");
      setSuccess(false);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const sql = `
        INSERT INTO patients 
        (first_name, last_name, email, phone, date_of_birth, gender, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;

      const params = [
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone || null,
        formData.dateOfBirth || null,
        formData.gender || null,
        formData.address || null,
      ];

      await db.query(sql, params);

      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
      });

    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("duplicate key") || msg.includes("unique constraint")) {
        setError("A patient with this email already exists.");
      } else {
        setError(
          "Failed to register patient. Please check your input and try again."
        );
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const requiredFields: {
    field: keyof PatientFormData;
    label: string;
    type?: string;
  }[] = [
    { field: "firstName", label: "First Name *" },
    { field: "lastName", label: "Last Name *" },
    { field: "email", label: "Email *", type: "email" },
  ];

  return (
    <Container maxWidth="lg">
      <Box
        component="section"
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 2,
          p: 4,
          mt: 4,
        }}
      >
        <Typography variant="h5" fontWeight={600} color="primary" mb={2}>
          Register New Patient
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} role="alert">
            Patient registered successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {requiredFields.map(({ field, label, type = "text" }) => (
              <Grid size={{ xs: 12, sm: 6 }} key={field}>
                <TextField
                  fullWidth
                  required
                  label={label}
                  type={type}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange(field)}
                />
              </Grid>
            ))}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange("phone")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange("gender")}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange("address")}
              />
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              size="large"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Register Patient"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
