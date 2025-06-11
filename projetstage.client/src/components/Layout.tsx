import { useState, useEffect } from "react";
// Router imports will be used when implementing real navigation
import DashboardTab from "../pages/DashboardTab";
import FormTab1 from "../pages/FormTab1";
import FormTab2 from "../pages/FormTab2";
import FormTab3 from "../pages/FormTab3";
import FormTab4 from "../pages/FormTab4";
import UserProfile from "./UserProfile";
import { useToast } from "@/hooks/use-toast"; // Assuming you have shadcn/ui toast

const TAB_LABELS = [
  "لوحة المعلومات",
  "الإعدادات الأساسية",
  "المكاتب و اللوائح",
  "تحصيل عدد الأصوات",
  "إحتياطي",
];

export default function Layout() {
  const [activeTab, setActiveTab] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [form1Data, setForm1Data] = useState<any | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const handleEditEntry = (entry: any) => {

    // setForm1Data({
    //   prefectureId: entry.prefectureId,
    //   circonscriptionId: entry.circonscriptionId,
    //   prefectureName: entry.prefectureName,
    //   circonscriptionName: entry.circonscriptionName,
    //   nombreSieges: entry.nombreSieges,
    //   nombreBureaux: entry.nombreBureaux,
    //   nombreListes: entry.nombreListes
    // });
    setCurrentEntryId(entry.entryId);
    // setIsCreating(true);
    setActiveTab(1);
    console.log("Starting edit flow for entry:", entry.entryId);
  };

  // handleForm1Submit: Handles submission from FormTab1.
  const handleForm1Update = async (values: any) => {
    console.log("Form 1 updating:", values);

    try {
      const token = localStorage.getItem("auth_token");
      if(!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save form data.",
          variant: "destructive",
        });
        return;
      }

      const updatedEntry = {
        PrefectureId: parseInt(values.prefectureId),
        CirconscriptionId: parseInt(values.circonscriptionId),
        NombreSieges: parseInt(values.nombreSieges),
        NombreBureaux: parseInt(values.nombreBureaux),
        NombreListes: parseInt(values.nombreListes)
      };

      const entryId = currentEntryId
      const response = await fetch(`/api/Dashboard/updateentry/${entryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedEntry)
      })

      if(!response.ok){
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error("Failed to Update entry")
      }

      setForm1Data(values);

       toast({
        title: "Success",
        description: "Entry Updated successfully",
        variant: "default",
      });
    }catch(error: any){
       console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "Failed to save form data",
        variant: "destructive",
      })
    }

  }
  const handleForm1Submit = async (values: any) => {
    console.log("Form 1 submitted:", values);
    
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save form data.",
          variant: "destructive",
        });
        return;
      }

      // Simple DTO with just the required fields
      const de = {
        PrefectureId: parseInt(values.prefectureId),
        CirconscriptionId: parseInt(values.circonscriptionId),
        NombreSieges: parseInt(values.nombreSieges),
        NombreBureaux: parseInt(values.nombreBureaux),
        NombreListes: parseInt(values.nombreListes)
      };

      const response = await fetch('/api/Dashboard/initializeentry', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(de)
      });

      if (!response.ok) {
         const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error("Failed to create entry");
      }

      const { id } = await response.json();
      setCurrentEntryId(id);
      setForm1Data(values);
      setIsCreating(false);
      // setActiveTab(2);
      
      toast({
        title: "Success",
        description: "Entry created successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "Failed to save form data",
        variant: "destructive",
      });
    }
  };

  // handleNewEntry: Called when the user clicks "جديد" (New) on the dashboard.
  // Now it only clears the session and prepares for a new entry
  const handleNewEntry = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a new entry.",
        variant: "destructive",
      });
      return;
    }

    // Clear previous form data and currentEntryId for a fresh start
    setForm1Data(null);
    setCurrentEntryId(null);
    setIsCreating(true);
    // Go to FormTab1 to start filling out the new entry
    setActiveTab(1);
    
    console.log("Starting new entry flow - cleared session data");
  };

  // Handle tab changes - clear session when returning to dashboard

  ///////////////////////////////////hna 3lx ghaytclira ana baghi mli nbrk 3la zkmo lbutton
  const handleTabChange = (idx: number) => {
    // if (idx === 0) {
    // Only clear session when explicitly clicking "جديد" button, not when returning to dashboard
    // This allows users to navigate back to dashboard and return to their work
    //   setCurrentEntryId(null);
    //   setForm1Data(null);
    //   setIsCreating(false);
    // }
    setActiveTab(idx);
  };

  // Logic for disabling tabs based on current state
  const tabDisabled = (tabIdx: number) => {
    // Dashboard tab (0) is always enabled
    if (tabIdx === 0) return false;
    
    // First form tab (1) is enabled if we're creating/editing
    if (tabIdx === 1) return false;
    
    // Form tabs (2, 3) are enabled only if form1Data exists and we have an entryId
    // This ensures user must complete form1 before proceeding
    if(currentEntryId && tabIdx > 1 && tabIdx <= 3) return false;

    if (!currentEntryId && tabIdx > 1 && tabIdx <= 3) return !form1Data || !currentEntryId;
    
    // Form 4 is always disabled for now
    if (tabIdx === 4) return true;
    
    return false;
  };

  return (
    <div
      className="min-h-screen bg-govbg flex flex-col font-andalus text-base"
      dir="rtl"
      style={{ fontFamily: "'Andalus', 'Cairo', sans-serif" }}
    >
      <header className="flex justify-between items-center bg-white shadow-md px-6 py-4">
        <div className="flex items-center space-x-4 flex-row-reverse">
          <div className="gov-title select-none text-2xl">
            منصة إدارة الانتخابات
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="gov-profile-btn text-lg" onClick={() => setProfileOpen(true)}>
            الملف الشخصي
          </button>
        </div>
        {profileOpen ? (
          <UserProfile open={profileOpen} onClose={() => setProfileOpen(false)} />
        ) : null}
      </header>

      <nav className="gov-nav px-2">
        <div className="flex flex-row w-full">
          {TAB_LABELS.map((l, idx) => (
            <div
              key={l}
              className={`gov-tab text-lg font-medium ${activeTab === idx ? "gov-tab-active" : ""} ${tabDisabled(idx) ? "opacity-30 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (!tabDisabled(idx)) handleTabChange(idx);
              }}
              aria-disabled={tabDisabled(idx)}
            >
              {l}
            </div>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-grow p-4">
        {/* Dashboard Table */}
        {activeTab === 0 && (
          <DashboardTab
            activeTab={activeTab} // Pass activeTab to DashboardTab
            onEditEntry={handleEditEntry}
            onNewEntry={handleNewEntry} // Updated to call the new async function
            // isCreating={isCreating}
          />
        )}

        {/* Form 1 */}
        {activeTab === 1 && (
          <FormTab1
            onSubmit={handleForm1Submit}
            onUpdate={handleForm1Update}
            // initialValues will be populated if editing, otherwise null for new entry
            initialValues={form1Data}
            isCreating={isCreating}
            // Pass the currentEntryId to FormTab1. It's either a new backend-generated ID
            // or the ID of the entry being edited.
            entryId={currentEntryId}
          />
        )}

        {/* Form 2 */}
        {activeTab === 2 && (
          <FormTab2
            form1Data={form1Data}
            // Pass the currentEntryId to FormTab2.
            entryId={currentEntryId}
          />
        )}

        {/* Form 3 */}
        {activeTab === 3 && (
          <FormTab3
            // form1Data={form1Data}
            onNewEntry={() => {
              // setIsCreating(false);
              setActiveTab(0);
              setCurrentEntryId(null); // Clear current entry ID after completing a flow
            }}
            // Pass the currentEntryId to FormTab3.
            entryId={currentEntryId}
          />
        )}

        {/* Form 4 */}
        {activeTab === 4 && <FormTab4 />}
      </main>

      <footer className="bg-white p-4 text-center text-base text-gray-600 border-t">
        <p> 2025 وزارة الداخلية، المملكة المغربية. جميع الحقوق محفوظة.</p>
      </footer>

      {/* Global styles for larger text */}
      <style>
        {`
          .gov-label {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
          }
          .gov-input, .gov-select {
            font-size: 1.1rem;
            padding: 0.625rem;
          }
          .gov-btn {
            font-size: 1.1rem;
          }
          table th {
            font-size: 1.05rem;
          }
          table td {
            font-size: 1.05rem;
          }
          input, select, button {
            font-size: 1.1rem;
          }
        `}
      </style>
    </div>
  );
}
