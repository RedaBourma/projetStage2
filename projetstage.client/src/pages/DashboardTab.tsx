import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast"; // Assuming you have shadcn/ui toast
import { useAuth } from "@/App"; // Import the auth context

export interface DashboardEntry {
  id: number; 
  entryId: string | null;
  prefectureId: number;
  prefectureName: string | null;
  circonscriptionId: number;
  circonscriptionName: string | null;
  nombreSieges: number;
  nombreBureaux: number;
  nombreListes: number;
  createdAt: string; 
  updatedAt: string | null;
}

interface DashboardTabProps {
  activeTab: number; // New prop to know when this tab is active
  onEditEntry: (entry: DashboardEntry) => void; // Now passes the full entry
  onNewEntry: () => void; // Updated to trigger the backend call in Layout
  // isCreating: boolean;
}

const COLUMNS = [
  "معرّف", // This column will display the 'entryId'
  "العمالة أو الإقليم أو عمالة المقاطعات",
  "الدائرة الإنتخابية المحلية",
  "عدد المقاعد",
  "عدد المكاتب المركزية",
  "عدد اللوائح",
  "تعديل",
  // "طباعة"
];

export default function DashboardTab({
  activeTab,
  onEditEntry,
  onNewEntry,
  // isCreating
}: DashboardTabProps) {
  const [dashboardEntries, setDashboardEntries] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logout } = useAuth(); // Get the logout function from auth context

  /**
   * useEffect hook to fetch dashboard entries when the tab becomes active (activeTab === 0)
   */
  useEffect(() => {
    const fetchDashboardEntries = async () => {
      // Only fetch if this tab is active
      if (activeTab !== 0) {
        setLoading(false); // Ensure loading is false if not active
        return;
      }

      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to view dashboard entries.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch("/api/Dashboard/entries", { // Your backend endpoint
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Send the JWT
          },
        });

        if (!response.ok) {
          const errorDetail = await response.text();
          console.error("Failed to fetch dashboard entries:", response.status, errorDetail);
          
          // Special handling for 404 - No entries found
          if (response.status === 404 && errorDetail.includes('No dashboard entries found')) {
            // Set empty array and don't throw an error
            setDashboardEntries([]);
            return; // Exit early without throwing
          }
          
          // Handle 401 Unauthorized - Log the user out
          if (response.status === 401) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
            logout(); // Use the logout function from auth context
            return; // Exit early
          }
          
          throw new Error(`Failed to load data: ${response.status} - ${errorDetail || response.statusText}`);
        }

        const data: DashboardEntry[] = await response.json();

        setDashboardEntries(data);
        console.log(dashboardEntries)
        toast({
          title: "Success",
          description: "Dashboard entries loaded successfully.",
        });

      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
        toast({
          title: "Error",
          description: `Failed to load dashboard data: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardEntries();
  }, [activeTab]); // Re-run effect when activeTab changes

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="p-6 w-full text-center text-gray-600">
        Loading dashboard entries...
      </div>
    );
  }

  // If we get a 404 error (no dashboard entries), we'll show an empty table instead of an error message
  if (error && !error.includes('404 - No dashboard entries found')) {
    return (
      <div className="p-6 w-full text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-row-reverse items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            لوحة المعلومات
          </h1>
          <div className="flex gap-2">
            {/* New Entry Button - Calls onNewEntry from Layout */}
            <button
            //               className={`gov-btn px-5 py-2 ${isCreating ? "opacity-60 cursor-not-allowed" : ""}`}
              className={`gov-btn px-5 py-2 `}
              onClick={onNewEntry} // Call the onNewEntry prop from Layout
              // disabled={isCreating}
            >
              <span className="ml-1">جديد</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {COLUMNS.map((head) => (
                  <th key={head} className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardEntries.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="text-center text-gray-400 py-10">
                    لا توجد بيانات حتى الآن.
                  </td>
                </tr>
              ) : (
                dashboardEntries.map((row) => (
                  // Use row.id as key for better performance and uniqueness
                  <tr key={row.id} className="hover:bg-gray-50">
                    {/* Display the 'entryId' from the backend */}
                    <td className="px-6 py-4 whitespace-nowrap">{row.entryId || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.prefectureName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.circonscriptionName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.nombreSieges}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.nombreBureaux}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.nombreListes}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                        onClick={() => {
                          // Call onEditEntry with the full entry object
                          onEditEntry({
                            id: row.id,
                            entryId: row.entryId,
                            prefectureId: row.prefectureId,
                            prefectureName: row.prefectureName,
                            circonscriptionId: row.circonscriptionId,
                            circonscriptionName: row.circonscriptionName,
                            nombreSieges: row.nombreSieges,
                            nombreBureaux: row.nombreBureaux,
                            nombreListes: row.nombreListes,
                            createdAt: row.createdAt,
                            updatedAt: row.updatedAt
                          });
                        }}
                        // disabled={isCreating}
                      >
                        تعديل
                      </button>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                        onClick={() => {
                          // Handle print functionality
                          // console.log("Print entry:", row.entryId);
                        }}
                      >
                        طباعة
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-5 text-sm text-gray-500 text-right bg-gray-50 p-3 rounded-lg border border-gray-200">
          للبدء: انقر على زر <span className="mx-1 font-bold text-green-700">جديد</span> أولاً.
        </div>
      </div>
    </div>
  );
}
