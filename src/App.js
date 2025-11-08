import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import { Home, BarChart3 } from "lucide-react";

export default function App() {
  // Shared app-level state
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMetric, setSelectedMetric] = useState("pm25");
  const [filters, setFilters] = useState({
    country: "US",
    state: "NY",
    school: "MTN12",
    group: "G4",
    studentId: "STU003",
  });
  const [reflection, setReflection] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      {/* Fixed web container with mobile ratio */}
      <div className="w-full max-w-[430px] h-[932px] bg-gray-50 relative shadow-2xl rounded-2xl overflow-hidden">
        {/* Dynamic content */}
        <div className="h-full overflow-y-auto pb-20">
          {activeTab === "home" ? (
            <LandingPage
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              reflection={reflection}
              setReflection={setReflection}
            />
          ) : (
            <Dashboard
              selectedMetric={selectedMetric}
              setSelectedMetric={setSelectedMetric}
              filters={filters}
              setFilters={setFilters}
              reflection={reflection}
              setReflection={setReflection}
            />
          )}
        </div>

        {/* Bottom navigation bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-md flex justify-around py-3">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center text-xs font-medium transition-all ${
              activeTab === "home"
                ? "text-blue-600 scale-105"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            Home
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center text-xs font-medium transition-all ${
              activeTab === "dashboard"
                ? "text-blue-600 scale-105"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}