import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EntrancePage from './pages/EntrancePage';
import HistoryPage  from './pages/HistoryPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<EntrancePage />} />
        <Route path="/history" element={<HistoryPage  />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
