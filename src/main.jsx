import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode><BrowserRouter><Routes><Route path="/" element={<App />} /><Route path="/browse" element={<App />} /><Route path="/donations/new" element={<App />} /><Route path="/donations/:id" element={<App />} /><Route path="/dashboard" element={<App />} /><Route path="/admin" element={<App />} /><Route path="/profile" element={<App />} /><Route path="/login" element={<App />} /><Route path="/register" element={<App />} /><Route path="*" element={<App />} /></Routes></BrowserRouter></React.StrictMode>
);
