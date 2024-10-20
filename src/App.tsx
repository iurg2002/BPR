// src/App.tsx
import React from "react";
import AppRouter from "./routes/AppRouter";
import { DataProvider } from "./context/DataContext";

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppRouter />
    </DataProvider>
  );
};

export default App;
