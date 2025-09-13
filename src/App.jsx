import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import EmailInput from "./emailInput";
import "./App.css";

const SUPABASE_URL = 'https://zdtmxoetngldbtwhckym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdG14b2V0bmdsZGJ0d2hja3ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTk3MjAsImV4cCI6MjA3MzE5NTcyMH0.tlhT6JSi-rv-NZhyCzQCaSgqZjSgOdc07h7E1bwlmMM';

const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const SLA_DAYS = 7;

// Priority colors map keys: "High", "Medium", "Low"
const priorityColors = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

function assignRandomPriority(reportId) {
  const priorities = ["High", "Medium", "Low"];
  const index = reportId 
    ? reportId.charCodeAt(0) % priorities.length 
    : Math.floor(Math.random() * priorities.length);
  return priorities[index];
}

function App() {
  const [email, setEmail] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = async (userEmail) => {
    setLoading(true);
    setError("");
    setReports([]);
    try {
      const { data, error } = await supa
        .from("submissions")
        .select("*")
        .eq("email", userEmail)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReports(data || []);
      setEmail(userEmail);
    } catch (err) {
      setError("Failed to fetch reports: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (createdAt) => {
    if (!createdAt) return "-";
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysPassed = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, SLA_DAYS - daysPassed);
  };

  if (!email) {
    return <EmailInput onSubmit={fetchReports} />;
  }

  return (
    <div className="app-container">
      <h1 className="header">Your Submitted Reports</h1>

      <button
        className="change-email-button"
        onClick={() => {
          setEmail(null);
          setReports([]);
          setError("");
        }}
      >
        Change Email
      </button>

      {loading && <p className="loading-text">Loading reports...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && reports.length === 0 && (
        <p className="no-report-text">No reports found for {email}.</p>
      )}

      <div className="report-grid">
        {reports.map((report) => {
          const priority = report.priority || assignRandomPriority(report.report_number || report.created_at);
          const daysRemaining = getDaysRemaining(report.created_at);
          return (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h2 className="report-title">{report.heading || "Untitled Report"}</h2>
                <span className={`priority-badge ${priorityColors[priority] || ""}`}>
                  {priority}
                </span>
              </div>

              {report.image_url && (
                <img src={report.image_url} alt="Report" className="report-image" />
              )}

              <p className="report-description">{report.description || "No description provided."}</p>

              <div className="report-footer">
                <div><span className="report-footer-label">Days Remaining:</span> {daysRemaining}</div>
                <div><span className="report-footer-label">Submitted:</span> {new Date(report.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
