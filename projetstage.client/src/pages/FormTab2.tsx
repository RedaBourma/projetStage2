import React, { useState } from "react";

// ==========================================
// ASP.NET Backend Integration Guide
// ==========================================
//
// ID USAGE WITH BACKEND:
// The entryId prop is critical for FormTab2 to:
// 1. Retrieve related tables data from the backend
// 2. Save table data with proper parent-child relationships
// 3. Maintain data integrity across form submissions
//
// BACKEND IMPLEMENTATION (C#):
// [HttpGet("GetFormTables/{entryId}")]
// public IActionResult GetFormTables(string entryId)
// {
//     // Get all tables associated with this entry
//     var tables = _dbContext.FormTables
//         .Where(t => t.EntryId == entryId)
//         .Include(t => t.TableRows) // Include child rows
//         .ToList();
//     
//     return Ok(tables);
// }
//
// [HttpPost("SaveFormTables")]
// public IActionResult SaveFormTables(FormTablesDto data)
// {
//     // data.EntryId should contain the entry ID
//     // First, remove existing tables for this entry (if updating)
//     var existingTables = _dbContext.FormTables.Where(t => t.EntryId == data.EntryId);
//     _dbContext.FormTables.RemoveRange(existingTables);
//     
//     // Add new tables with the entry ID as foreign key
//     foreach (var table in data.Tables)
//     {
//         var newTable = new FormTable
//         {
//             EntryId = data.EntryId, // Link to the parent entry
//             TableName = table.TableName,
//             // Set other properties...
//         };
//         
//         // Add rows for this table
//         foreach (var row in table.Rows)
//         {
//             newTable.TableRows.Add(new TableRow
//             {
//                 // Row properties...
//             });
//         }
//         
//         _dbContext.FormTables.Add(newTable);
//     }
//     
//     _dbContext.SaveChanges();
//     return Ok(new { success = true });
// }
//
// This component would integrate with the following backend endpoints:
// 1. GET /api/Forms/GetFormTables?form1Id={id} - Retrieves existing table data for this form
//    - Returns main table rows and child detail tables if they exist
//
// 2. POST /api/Forms/SaveFormTables - Saves the main and detail tables
//    - Accepts both parent and child table data in a single request
//    - Returns updated data with server-generated IDs
//
// 3. GET /api/Forms/GetTableDropdownOptions - Retrieves the options for the select dropdown
//    - Returns options with Arabic labels
//    - Format: Array of { value: string, label: string }
//
// The model structure on the backend would be:
// - FormTableData model with properties for the main table and collection of detail tables
// - Detail tables would be linked to main table rows through parent-child relationship
// - Each detail table would have a foreign key reference to its parent row

// Mock options - replace with backend data when integrating
const MOCK_OPTIONS = [
    { value: "option1", label: "الخيار ١" },
    { value: "option2", label: "الخيار ٢" },
    { value: "option3", label: "الخيار ٣" },
];

// For backend integration, add this function to fetch dropdown options:
// const fetchDropdownOptions = async () => {
//     try {
//         const response = await fetch("/api/Forms/GetTableDropdownOptions", {
//             headers: { 
//                 "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
//             }
//         });
//         if (!response.ok) throw new Error("Failed to fetch dropdown options");
//         const data = await response.json();
//         
//         // Replace MOCK_OPTIONS with the fetched data
//         // Format should be: { value: string, label: string }[]
//         return data.options;
//     } catch (error) {
//         console.error("Error fetching dropdown options:", error);
//         return MOCK_OPTIONS; // Fallback to mock data on error
//     }
// };

/**
 * Props for FormTab2 Component
 * @property {object} form1Data - Data from FormTab1 containing numeric values
 */
interface FormTab2Props {
    form1Data?: {
        num1?: number; // Used to determine row count for first table
        num2?: number; // Used to determine row count for detail tables
        [key: string]: any;
    } | null;
    entryId: string | null; // Unique entry ID from parent
}

/**
 * FormTab2 Component - Excel-like Nested Tables
 * 
 * This component displays dynamic nested tables:
 * - A main table with editable text and auto-numbered columns
 * - Detail tables for each row in the main table that can be expanded/collapsed
 * - Each detail table has a dropdown and two text inputs per row
 * 
 * The number of rows is determined by form1Data (num1 for main table, num2 for detail tables)
 */
export default function FormTab2({ form1Data }: FormTab2Props) {
    // Get spreadsheet row counts from Form1 data, fallback to default if undefined
    const n1 = typeof form1Data?.num1 === "number" ? form1Data.num1 : 3;
    const n2 = typeof form1Data?.num2 === "number" ? form1Data.num2 : 4;

    // For first table - only first column is editable, second column is auto-numbered
    const [table1, setTable1] = useState<{ col1: string; number: number }[]>(() =>
        Array.from({ length: n1 }, (_, i) => ({
            col1: `العنصر ${i + 1}`,
            number: i + 1
        }))
    );
    
    // For second tables - one per row in first table, each with n2 rows
    // This creates a parent-child relationship between tables
    const [table2Data, setTable2Data] = useState<{ 
        parentRowIndex: number;
        rows: { select: string; input1: string; input2: string }[] 
    }[]>(() => 
        Array.from({ length: n1 }, (_, i) => ({
            parentRowIndex: i,
            rows: Array.from({ length: n2 }, () => ({
                select: "",
                input1: "",
                input2: ""
            }))
        }))
    );
    
    // Track which row in table1 is expanded to show its detail table
    const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
    
    // Success message state
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    // Track options for select dropdown
    const [options] = useState(MOCK_OPTIONS);
    
    /**
     * Handle changes to the first table's editable column
     * @param {number} rowIndex - Index of the row being edited
     * @param {string} value - New value for the cell
     */
    const handleTable1Change = (rowIndex: number, value: string) => {
        setTable1(prev => {
            const newTable = [...prev];
            newTable[rowIndex] = { ...newTable[rowIndex], col1: value };
            return newTable;
        });
    };
    
    /**
     * Handle changes to select dropdown in detail table
     * @param {number} parentRowIndex - Index of the parent row
     * @param {number} rowIndex - Index of the row in detail table
     * @param {string} value - New selection value
     */
    const handleSelectChange = (parentRowIndex: number, rowIndex: number, value: string) => {
        setTable2Data(prev => {
            const newData = [...prev];
            const dataIndex = newData.findIndex(d => d.parentRowIndex === parentRowIndex);
            
            if (dataIndex >= 0) {
                const newRows = [...newData[dataIndex].rows];
                newRows[rowIndex] = { ...newRows[rowIndex], select: value };
                newData[dataIndex] = { ...newData[dataIndex], rows: newRows };
            }
            
            return newData;
        });
    };
    
    /**
     * Handle changes to text inputs in detail table
     * @param {number} parentRowIndex - Index of the parent row
     * @param {number} rowIndex - Index of the row in detail table
     * @param {string} field - Name of the field (input1 or input2)
     * @param {string} value - New input value
     */
    const handleInputChange = (
        parentRowIndex: number, 
        rowIndex: number, 
        field: 'input1' | 'input2', 
        value: string
    ) => {
        setTable2Data(prev => {
            const newData = [...prev];
            const dataIndex = newData.findIndex(d => d.parentRowIndex === parentRowIndex);
            
            if (dataIndex >= 0) {
                const newRows = [...newData[dataIndex].rows];
                newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
                newData[dataIndex] = { ...newData[dataIndex], rows: newRows };
            }
            
            return newData;
        });
    };
    
    /**
     * Toggle expanded/collapsed state of a row's detail table
     * @param {number} rowIndex - Index of the parent row
     */
    const toggleExpandRow = (rowIndex: number) => {
        setExpandedRowIndex(prev => prev === rowIndex ? null : rowIndex);
    };
    
    /**
     * Save all table data (when integrating with backend)
     * For demo, just shows success message and logs data
     * @param {React.FormEvent} e - Form event
     */
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create a structured data object for submission
        const formData = {
            mainTable: table1,
            detailTables: table2Data,
            form1Id: form1Data?.id // Reference to parent form
        };
        
        // When integrating with backend, send this data to the server
        // const saveToBackend = async () => {
        //     try {
        //         const response = await fetch("/api/Forms/SaveFormTables", {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        //             },
        //             body: JSON.stringify(formData)
        //         });
        //         
        //         if (!response.ok) {
        //             throw new Error("Failed to save table data");
        //         }
        //         
        //         return await response.json();
        //     } catch (error) {
        //         console.error("Error saving table data:", error);
        //         throw error;
        //     }
        // };
        // 
        // saveToBackend()
        //     .then(data => {
        //         // Update state with server-assigned IDs if needed
        //         setSuccessMsg("تم حفظ البيانات بنجاح");
        //         setTimeout(() => setSuccessMsg(null), 2000);
        //     })
        //     .catch(err => {
        //         setErrorMsg("حدث خطأ أثناء حفظ البيانات");
        //         setTimeout(() => setErrorMsg(null), 2000);
        //     });
        
        // For demo, just log the data and show success message
        console.log("Form data to save:", formData);
        setSuccessMsg("تم حفظ البيانات بنجاح");
        setTimeout(() => setSuccessMsg(null), 2000);
    };

    // Labels for UI text
    const labels = {
        tabTitle: "إنشاء المكاتب و اللوائح",
        mainTable: "المكاتب لمركزية",
        col1: "إسم المكتب المركزي",
        col2: "رقم المكتب",
        detailTable: "الجدول التفصيلي",
        expand: "عرض التفاصيل",
        collapse: "إخفاء التفاصيل",
        t2sel: "الإنتماء السياسي",
        t2i1: "الإسم الشخصي و العائلي لوكيل الائحة",
        t2i2: "رقم الائحة",
        save: "حفظ",
        noTableSelected: "اختر صفاً من الجدول الرئيسي لعرض تفاصيله",
    };
    
    return (
        <div className="p-6 w-full" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-1">{labels.tabTitle}</h1>
                    </div>
                    
                    {/* Success message notification */}
                    {successMsg && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-center">
                            {successMsg}
                        </div>
                    )}
                    
                    <form onSubmit={handleSave}>
                        {/* Main table with collapsible detail tables */}
                        <div className="overflow-hidden border-b border-gray-200 shadow-sm rounded-lg mb-6">
                            <div className="bg-blue-50 p-3 text-lg font-semibold border-b border-blue-100">
                                {labels.mainTable}
                            </div>
                            
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="w-14 px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                            #
                                        </th>
                                        <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                            {labels.col1}
                                        </th>
                                        <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                            {labels.col2}
                                        </th>
                                        <th className="w-24 px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                                            
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {table1.map((row, rowIndex) => (
                                        <React.Fragment key={rowIndex}>
                                            {/* Main table row */}
                                            <tr className={rowIndex === expandedRowIndex ? "bg-blue-50" : ""}>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                                                    {rowIndex + 1}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        className="gov-input text-right border-0 bg-transparent focus:ring-0 focus:border-b-2 p-0"
                                                        value={row.col1}
                                                        onChange={(e) => handleTable1Change(rowIndex, e.target.value)}
                                                        placeholder="أدخل نصاً..."
                                                    />
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    {row.number}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                                                    <button
                                                        type="button"
                                                        className="gov-btn px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                        onClick={() => toggleExpandRow(rowIndex)}
                                                    >
                                                        {rowIndex === expandedRowIndex ? labels.collapse : labels.expand}
                                                    </button>
                                                </td>
                                            </tr>
                                            
                                            {/* Detail table row (expanded) */}
                                            {rowIndex === expandedRowIndex && (
                                                <tr>
                                                    <td colSpan={4} className="p-0">
                                                        <div className="bg-gray-50 p-4 border-t border-b border-gray-200">
                                                            <h4 className="text-base font-semibold mb-3 border-b pb-2">
                                                                {labels.detailTable}
                                                            </h4>
                                                            
                                                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded overflow-hidden">
                                                                <thead className="bg-gray-100">
                                                                    <tr>
                                                                        <th className="w-12 px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                                                            #
                                                                        </th>
                                                                        <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                                                            {labels.t2sel}
                                                                        </th>
                                                                        <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                                                            {labels.t2i1}
                                                                        </th>
                                                                        <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                                                            {labels.t2i2}
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                    {table2Data
                                                                        .find(d => d.parentRowIndex === rowIndex)
                                                                        ?.rows.map((detailRow, detailRowIndex) => (
                                                                            <tr key={detailRowIndex}>
                                                                                <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                                                                    {detailRowIndex + 1}
                                                                                </td>
                                                                                <td className="px-2 py-2 whitespace-nowrap">
                                                                                    <select
                                                                                        className="gov-select border-0 bg-transparent focus:ring-0 focus:border-b-2 p-0 text-right"
                                                                                        value={detailRow.select}
                                                                                        onChange={(e) => handleSelectChange(
                                                                                            rowIndex, 
                                                                                            detailRowIndex, 
                                                                                            e.target.value
                                                                                        )}
                                                                                    >
                                                                                        <option value="">اختر...</option>
                                                                                        {options.map((opt) => (
                                                                                            <option key={opt.value} value={opt.value}>
                                                                                                {opt.label}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                </td>
                                                                                <td className="px-2 py-2 whitespace-nowrap">
                                                                                    <input
                                                                                        type="text"
                                                                                        className="gov-input border-0 bg-transparent focus:ring-0 focus:border-b-2 p-0 text-right"
                                                                                        value={detailRow.input1}
                                                                                        onChange={(e) => handleInputChange(
                                                                                            rowIndex, 
                                                                                            detailRowIndex, 
                                                                                            'input1', 
                                                                                            e.target.value
                                                                                        )}
                                                                                        placeholder="أدخل نصاً..."
                                                                                    />
                                                                                </td>
                                                                                <td className="px-2 py-2 whitespace-nowrap">
                                                                                    <input
                                                                                        type="text"
                                                                                        className="gov-input border-0 bg-transparent focus:ring-0 focus:border-b-2 p-0 text-right"
                                                                                        value={detailRow.input2}
                                                                                        onChange={(e) => handleInputChange(
                                                                                            rowIndex, 
                                                                                            detailRowIndex, 
                                                                                            'input2', 
                                                                                            e.target.value
                                                                                        )}
                                                                                        placeholder="أدخل رقماً..."
                                                                                    />
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* No detail table selected message */}
                        {expandedRowIndex === null && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-700 text-center mb-6">
                                {labels.noTableSelected}
                            </div>
                        )}
                        
                        {/* Save button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="gov-btn px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
                            >
                                {labels.save}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}