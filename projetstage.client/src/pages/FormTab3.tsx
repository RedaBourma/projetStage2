import { useState } from "react";


// ==========================================
// ASP.NET Backend Integration Guide
// ==========================================
//
// ID USAGE WITH BACKEND:
// The entryId prop in FormTab3 is used to:
// 1. Link calculations to the original entry
// 2. Retrieve previous calculations if they exist
// 3. Complete the form submission process with consistent ID references
//
// BACKEND IMPLEMENTATION (C#):
// [HttpGet("GetCalculations/{entryId}")]
// public IActionResult GetCalculations(string entryId)
// {
//     // Get calculations associated with this entry
//     var calculations = _dbContext.FormCalculations
//         .FirstOrDefault(c => c.EntryId == entryId);
//     
//     if (calculations == null) return NotFound();
//     return Ok(calculations);
// }
//
// [HttpPost("SaveCalculations")]
// public IActionResult SaveCalculations(CalculationsDto data)
// {
//     // data.EntryId should contain the entry ID
//     var existingCalc = _dbContext.FormCalculations
//         .FirstOrDefault(c => c.EntryId == data.EntryId);
//     
//     if (existingCalc != null)
//     {
//         // Update existing calculations
//         existingCalc.X = data.X;
//         existingCalc.Y = data.Y;
//         existingCalc.Z = data.Z;
//         // Update other properties...
//         existingCalc.UpdatedAt = DateTime.UtcNow;
//     }
//     else
//     {
//         // Create new calculations with the provided ID
//         var newCalc = new FormCalculations
//         {
//             EntryId = data.EntryId, // Link to the parent entry
//             X = data.X,
//             Y = data.Y,
//             Z = data.Z,
//             // Set other properties...
//             CreatedAt = DateTime.UtcNow,
//             UpdatedAt = DateTime.UtcNow
//         };
//         _dbContext.FormCalculations.Add(newCalc);
//     }
//     
//     _dbContext.SaveChanges();
//     
//     // Update the main entry status to complete
//     var entry = _dbContext.DashboardEntries.Find(data.EntryId);
//     if (entry != null)
//     {
//         entry.IsComplete = true;
//         entry.UpdatedAt = DateTime.UtcNow;
//         _dbContext.SaveChanges();
//     }
//     
//     return Ok(new { success = true });
// }
//
// 1. ENDPOINTS TO IMPLEMENT:
//    - GET /api/Forms/GetFormData?form1Id={id} - Retrieves initial data for this form
//      Returns: Previously saved form data if it exists
//
//    - GET /api/Forms/GetDropdownOptions?type=form3 - Fetches dropdown options
//      Returns: Array of { value: string, label: string }
//
//    - POST /api/Forms/CalculateForm3 - Processes calculation request for form fields
//      Payload: { form1Id: string, selectedItem: string, fieldValues: { X: number, Y: number, Z: number, W: number } }
//      Returns: { success: boolean, results: any[] } - Calculation results for table display
//
//    - POST /api/Dashboard/CreateEntry - Creates dashboard entry from form data
//      Payload: { form1Id: string, selectedItem: string, calculations: { X: number, Y: number, Z: number, W: number } }
//      Returns: { id: string, createdAt: string } - New dashboard entry information
//
// 2. DATA MODELS REQUIRED:
//    - Form3OptionsDto: {
//        options: {
//          value: string,       // Unique identifier for the option
//          label: string,       // Arabic label
//        }[]
//      }
//
//    - Form3CalculationDto: {
//        form1Id: string,       // Reference to parent form
//        selectedItem: string,  // Selected dropdown option
//        fieldValues: {
//          X: number,           // Main field value (should equal Y+Z+W)
//          Y: number,           // Component value 1
//          Z: number,           // Component value 2
//          W: number            // Component value 3
//        }
//      }
//
//    - DashboardEntryDto: {
//        form1Id: string,       // Reference to parent form
//        selectedItem: string,  // Selected option text
//        calculations: {        // Calculation field values
//          X: number,           // Total value
//          Y: number,           // Component value 1
//          Z: number,           // Component value 2
//          W: number            // Component value 3
//        }
//      }
//
//    - TableResultDto: {
//        rows: {
//          readA: string,       // First column value
//          readB: string,       // Second column value
//          readC: string,       // Third column value
//          result1: string,     // First result value
//          result2: string,     // Second result value
//          result3: string,     // Third result value
//          result4: string      // Fourth result value
//        }[]
//      }
//
// 3. INTEGRATION STEPS:
//    a. Remove the MOCK_MAIN_DROPDOWN and MOCK_TABLE_ROWS objects
//    b. Uncomment the dropdown options states and fetch functions 
//    c. Implement proper data loading from backend APIs
//    d. Update calculation and dashboard entry functions to use real endpoints
//    e. Update table display to show real calculation results from backend
//    f. Implement proper loading states and error handling

interface FormTab3Props {
    form1Data?: any | null; // Data from Form 1, if needed
    onNewEntry: () => void; // Callback for new entry logic
    entryId: string | null; // Unique entry ID from parent
}

const LABELS = {
    title: "إنتخاب أعضاء مجلس النواب",
    subtitle1: "إقتراع يوم الأربعاء 08 شتنبر 2021",
    subtitle2: "الإنتخابات على مستوى الدوائر الإنتخابية المحلية",
        choose: "اختر عنصرا:",
        choosePlaceholder: "اختر",
    fieldX: "عدد المسجلين",
    fieldY: "عدد المصوتين",
    fieldZ: "عدد الأوراق الملغاة",
    fieldW: "عدد الأصوات المعبر عنها",
    calcError: "يجب أن تساوي قيمة عدد المسجلين مجموع قيم عدد المصوتين, عدد الأوراق الملغاة, عدد الأصوات المعبر عنها",
        resultFieldLabel: "الحقل المخصص للنتائج:",
        resultFieldValue: "عدد النتائج النهائية",
        calcButton: "احسب النتائج",
    createDashboardEntry: "أضف إلى لوحة المعلومات",
        tableHeaders: [
        "النتائج النهائية",
        "عدد المقاعد حسب قاعدة أكبر البقايا",
        "بقايا الأصوات",
        "عدد المقاعد على ضوء القاسم الإنتخابي",
        "عدد الأصوات المحصل عليها",
        "الإنتماء السياسي",
        "الإسم الشخصي و العائلي لوكيل اللائحة",
        "رقم اللائحة"
        ],
        tableDash: "-",
};

// Mock dropdown data - replace with backend data when integrating
const MOCK_MAIN_DROPDOWN = ["عنصر ١", "عنصر ٢", "عنصر ٣"];

export default function FormTab3({ form1Data, onNewEntry, entryId }: FormTab3Props) {
    // entryId is available here for backend submission
    console.log("FormTab3 entryId:", entryId); // Temporary: to acknowledge usage
    const [selectedItem, setSelectedItem] = useState("");
    const [X, setX] = useState("");
    const [Y, setY] = useState("");
    const [Z, setZ] = useState("");
    const [W, setW] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Backend Integration - Add these states when connecting to backend:
    // const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
    // const [isLoading, setIsLoading] = useState(false);
    
    // When integrating with backend, add this effect to fetch dropdown options
    // useEffect(() => {
    //     const fetchDropdownOptions = async () => {
    //         setIsLoading(true);
    //         try {
    //             const response = await fetch("/api/Forms/GetDropdownOptions?type=form3", {
    //                 headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
    //             });
    //             if (!response.ok) throw new Error("Failed to fetch dropdown options");
    //             const data = await response.json();
    //             
    //             setDropdownOptions(data.options);
    //         } catch (error) {
    //             console.error("Error fetching dropdown options:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     
    //     fetchDropdownOptions();
    // }, []);

    // Table sample data
    const MOCK_TABLE_ROWS = [
        { readA: "قيمة ١", readB: "قيمة ٢", readC: "قيمة ٣" },
        { readA: "قيمة ٤", readB: "قيمة ٥", readC: "قيمة ٦" },
    ];

    const handleCalc = () => {
        if (+X !== +Y + +Z + +W) {
            setError(LABELS.calcError);
            return;
        }
        setError("");
        
        // ASP.NET Backend Integration:
        // 1. Create data to send to the calculation endpoint
        // const calculationData = {
        //     form1Id: form1Data?.id, // Reference to parent form
        //     selectedItem,
        //     fieldValues: {
        //         X: parseFloat(X),
        //         Y: parseFloat(Y),
        //         Z: parseFloat(Z),
        //         W: parseFloat(W)
        //     }
        // };
        
        // 2. Send calculation request to ASP.NET backend
        // fetch("/api/Forms/CalculateForm3", {
        //     method: "POST",
        //     headers: { 
        //         "Content-Type": "application/json",
        //         "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        //     },
        //     body: JSON.stringify(calculationData)
        // })
        // .then(res => {
        //     if (!res.ok) throw new Error("Calculation failed");
        //     return res.json();
        // })
        // .then(data => {
        //     // Handle calculation results
        //     // Update table with results returned from backend
        //     // setTableResults(data.results);
        //     setSuccess("تم الحساب بنجاح");
        //     setTimeout(() => setSuccess(""), 3000);
        // })
        // .catch(err => {
        //     console.error("Calculation error:", err);
        //     setError("حدث خطأ أثناء الحساب");
        // });
        
        // Demo only - no actual calculation:
        setSuccess("تم الحساب بنجاح");
        setTimeout(() => setSuccess(""), 3000);
    };

    const handleCreateDashboardEntry = () => {
        // Validate required fields
        if (!selectedItem || !X || !Y || !Z || !W) {
            setError("يرجى ملء جميع الحقول أولاً");
            return;
        }
        
        setError("");
        
        // ASP.NET Backend Integration:
        // 1. Create entry data to send to the backend
        // const entryData = {
        //     form1Id: form1Data?.id,
        //     selectedItem,
        //     calculations: {
        //         X: parseFloat(X),
        //         Y: parseFloat(Y),
        //         Z: parseFloat(Z),
        //         W: parseFloat(W)
        //     }
        // };
        
        // 2. Send to backend to create entry
        // fetch("/api/Dashboard/CreateEntry", {
        //     method: "POST",
        //     headers: { 
        //         "Content-Type": "application/json",
        //         "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        //     },
        //     body: JSON.stringify(entryData)
        // })
        // .then(res => {
        //     if (!res.ok) throw new Error("Failed to create entry");
        //     return res.json();
        // })
        // .then(data => {
        //     // Handle success
        //     setSuccess("تم إنشاء السجل بنجاح");
        //     setTimeout(() => setSuccess(""), 3000);
        //     
        //     // Call the parent component's onNewEntry function if provided
        //     if (onNewEntry) onNewEntry();
        // })
        // .catch(err => {
        //     console.error("Error creating entry:", err);
        //     setError("حدث خطأ أثناء إنشاء السجل");
        // });
        
        // Demo only - simply call onNewEntry if provided:
        setSuccess("تم إنشاء السجل بنجاح");
        setTimeout(() => setSuccess(""), 3000);
        if (onNewEntry) onNewEntry();
    };

    return (
        <div className="p-6 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-1">{LABELS.title}</h1>
                        <div className="text-lg text-gray-700">{LABELS.subtitle1}</div>
                        <div className="text-md text-blue-800">{LABELS.subtitle2}</div>
                    </div>

            {/* Summary Rectangle */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-right">
                {form1Data ? (
                    <span className="mx-2">
                        {form1Data.dropdown1} • {form1Data.dropdown2} •
                                <span className="font-medium">القيم: {form1Data.num1}, {form1Data.num2}, {form1Data.num3}</span>
                    </span>
                ) : (
                    "—"
                )}
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Main dropdown selection */}
                        <div>
                            <label className="gov-label">{LABELS.choose}</label>
                <select
                                className="gov-select"
                    value={selectedItem}
                    onChange={e => setSelectedItem(e.target.value)}
                >
                                <option value="">{LABELS.choosePlaceholder}</option>
                                {MOCK_MAIN_DROPDOWN.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                        </div>
            </div>

            {/* Input rectangle */}
                    <div className="mb-6 p-5 bg-green-50 rounded-lg border border-green-100">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rtl">
                            <div>
                                <label className="gov-label">{LABELS.fieldX}</label>
                    <input className="gov-input" type="number" value={X}
                                    onChange={e => setX(e.target.value.replace(/^0+/, ""))} 
                                    placeholder="أدخل قيمة" />
                </div>
                            <div>
                                <label className="gov-label">{LABELS.fieldY}</label>
                    <input className="gov-input" type="number" value={Y}
                                    onChange={e => setY(e.target.value.replace(/^0+/, ""))} 
                                    placeholder="أدخل قيمة" />
                </div>
                            <div>
                                <label className="gov-label">{LABELS.fieldZ}</label>
                    <input className="gov-input" type="number" value={Z}
                                    onChange={e => setZ(e.target.value.replace(/^0+/, ""))} 
                                    placeholder="أدخل قيمة" />
                </div>
                            <div>
                                <label className="gov-label">{LABELS.fieldW}</label>
                    <input className="gov-input" type="number" value={W}
                                    onChange={e => setW(e.target.value.replace(/^0+/, ""))} 
                                    placeholder="أدخل قيمة" />
                            </div>
                </div>
            </div>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-center font-semibold">
                            {success}
                        </div>
                    )}

                    {/* Actions buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <button 
                            className="gov-btn bg-green-600 hover:bg-green-700 text-white px-6 py-2" 
                            onClick={handleCreateDashboardEntry}
                        >
                            {LABELS.createDashboardEntry}
                        </button>
                        
                        <button 
                            className="gov-btn px-6 py-2" 
                            onClick={handleCalc}
                        >
                            {LABELS.calcButton}
                </button>
                        
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                            <span className="text-md font-medium">{LABELS.resultFieldLabel}</span>
                            <span className="text-blue-600 font-bold">{LABELS.resultFieldValue}</span>
                        </div>
            </div>

            {/* Excel-style table - RTL order */}
                    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
                        <h3 className="text-lg font-semibold p-3 bg-gray-50 border-b">جدول النتائج</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse excel-table rtl-table text-base">
                                <thead className="bg-gray-100">
                                    <tr className="bg-gray-100">
                                        {LABELS.tableHeaders.map((head, i) => (
                                            <th key={i} className="border border-gray-300 p-2 text-base">{head}</th>
                                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_TABLE_ROWS.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50">
                                            <td className="border border-gray-300 p-2 text-base">{row.readC}</td>
                                            <td className="border border-gray-300 p-2 text-base">{row.readB}</td>
                                            <td className="border border-gray-300 p-2 text-base">{row.readA}</td>
                                            <td className="border border-gray-300 p-2 text-base">{LABELS.tableDash}</td>
                                            <td className="border border-gray-300 p-2"><input type="text" className="text-base w-full" /></td>
                                            <td className="border border-gray-300 p-2 text-base">{LABELS.tableDash}</td>
                                            <td className="border border-gray-300 p-2 text-base">{LABELS.tableDash}</td>
                                            <td className="border border-gray-300 p-2 text-base">{LABELS.tableDash}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
                    </div>
                </div>
            </div>

            {/* Styling for table */}
            <style>{`
                .rtl-table {
                    direction: rtl;
                }
                .rtl {
                    direction: rtl;
                }
                .excel-table {
                    border-collapse: collapse;
                }
                .excel-table th, .excel-table td {
                    border: 1px solid #ddd;
                }
                .excel-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .excel-table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}
