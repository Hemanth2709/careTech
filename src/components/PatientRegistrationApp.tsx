import React, { useState } from "react";
import { PatientRegistrationForm } from "./FormComponents/PatientRegistrationForm";
import { PatientList } from "./FormComponents/PatientList";
import { SqlQueryInterface } from "./FormComponents/SqlQueryInterface";

import {
  Box,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";


// Tabs
const TabNavigation: React.FC<{
  activeTab: number;
  onTabChange: (tab: number) => void;
}> = ({ activeTab, onTabChange }) => (
  <Tabs
    value={activeTab}
    onChange={(_e, newVal) => onTabChange(newVal)}
    aria-label="Patient Registration Tabs"
    sx={{ mb: 4 }}
    variant="fullWidth"
    textColor="primary"
    indicatorColor="primary"
  >
    <Tab label="👤 Register Patient" />
    <Tab label="📋 Patient Records" />
    <Tab label="🗄️ SQL Query" />
  </Tabs>
);

// App Component
const PatientRegistrationApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: "linear-gradient(to right top, #f0f4ff, #f9fbff)",
        py: 8,
        px: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Container
        sx={{
          width: "100%",
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          backgroundColor: "#ffffffdd",
          backdropFilter: "blur(6px)",
        }}
      >
        <Box mb={4}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            fontWeight="bold"
            mb={1}
            color="primary"
          >
            Patient Registration System
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage patient records with real-time synchronization across tabs
          </Typography>
        </Box>

        {/* <SyncStatus lastSync={lastSync} /> */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 0 && (
          <PatientRegistrationForm  />
        )}
        {activeTab === 1 && <PatientList  />}
        {activeTab === 2 && <SqlQueryInterface />}
      </Container>
    </Box>
  );
};

export default PatientRegistrationApp;
