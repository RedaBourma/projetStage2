import React, { useState, useEffect } from "react";
import { useAuth } from "@/App"; 
import { useToast } from "@/hooks/use-toast";


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
    update:"تحديث",
    noTableSelected: "اختر صفاً من الجدول الرئيسي لعرض تفاصيله",
};

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

interface PartisDto {
    id: number;
    name: string;
}

interface ListeDto {
    Id: number;
    pnAgentListe?: string;
    numListe: number;
    parti?: PartisDto
}

interface BereauDetailsDto {
    id: number;
    name?: string;
    dashboardEntryId?: number
    listes: ListeDto[];
}

interface BureauDataResponse {
    bureauDetails: BereauDetailsDto[];
    isNew: boolean;
}

interface table1 {
    col: string;
    number: number;
}
interface table2 {
    parentRowIndex: number;
    rows: {
        select: string,
        input1: string,
        input2: string, 
    }[];
}

interface tablesSize {
    nombreBureaux: number,
    nombreListes: number
}
export default function FormTab2({ form1Data, entryId }: FormTab2Props) {
    const { toast } = useToast();
    const { logout } = useAuth();
    // State for table dimensions from backend
    const [tableDimensions, setTableDimensions] = useState<tablesSize>({ 
        nombreBureaux: 0,
        nombreListes:0 
    });
    // const { n1, n2 } = tableDimensions;
    const [table1, setTable1] = useState<table1[]>([]);
    const [table2Data, setTable2Data] = useState<table2[]>([]);
    // Track which row in table1 is expanded to show its detail table
    const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
    // Success message state
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    // Track options for select dropdown
    const [partieSelect, setPartieSelect] = useState<PartisDto[]>([]);
    const [isNewEntryForBureaux, setIsNewEntryForBureaux] = useState<boolean>(true);

    const loadTablesSize = async () => {
        if(!entryId) return;

        const token = localStorage.getItem("auth_token");
                if (!token) {
                    toast({
                        title: "Authentication Required",
                        description: "Please log in to view prefectures.",
                        variant: "destructive",
                    });
                    logout();
                    return;
                }

        fetch(`/api/Dashboard/getBureauxListes/${entryId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch table sizes: ${response.statusText}`);
            return response.json();
        })
        .then((data: tablesSize) => {
           const mainTablecount = data.nombreBureaux;
           const secondtablecount = data.nombreListes;

           console.log("tables count: ",mainTablecount, secondtablecount)

           setTableDimensions({
            nombreBureaux: mainTablecount,
            nombreListes: secondtablecount
           })
           
           // Table initialization moved to useEffect
        })
    }

    const fetchAllParties = async () => {
        const token = localStorage.getItem("auth_token");
        if(!token) {
            toast({
                title: "Authentication Required",
                description: "login to fetch parties",
                variant: "destructive",
            });
            logout();
            return;
        }

        try {
            const response = await fetch("/api/Partis/getPartis", {
                method: "GET",
                headers: {"Authorization": `Bearer ${token}`}
            });
            if(!response.ok) {
                const errorDetail = await response.text();
                if(response.status === 401) {logout(); return;}
                throw new Error(`failed to fetch parties: ${response.status} - ${errorDetail}`)
            }
            const data: PartisDto[] = await response.json();
            console.log("first element id of data: " + data[0].id)
            setPartieSelect(data)
        }catch(error: any) {

        }
    }

    const loadData = async () => {
        if(!entryId) return;

        const token = localStorage.getItem("auth_token");
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "Please log in to view prefectures.",
                variant: "destructive",
            });
            logout();
            return;
        }

        try{
            const response = await fetch(`/api/Bureaux/getBureauById/${entryId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch table sizes: ${response.statusText}`);

            const responseData: BureauDataResponse = await response.json();
            const data: BereauDetailsDto[] = responseData.bureauDetails;
            const isNewR: boolean = responseData.isNew
            isNewR? setIsNewEntryForBureaux(true) : setIsNewEntryForBureaux(false);
            console.log("xooooof", responseData, isNewR)
            // console.log(data)
            // console.log(response.statusText)
            
            if (data && Array.isArray(data)){
                setTable1(Array.from({ length: tableDimensions.nombreBureaux }, (_, i) => ({
                    col: data[i]?.name || ` المكتب المركزي رقم ${i + 1}`,
                    number: i + 1
                })));

            setTable2Data(Array.from({ length: tableDimensions.nombreBureaux }, (_, bureauIndex) => {
                const bureau = data[bureauIndex];
                const rows = Array.from({ length: tableDimensions.nombreListes }, (_, listeIndex) => {
                    const liste = bureau?.listes?.[listeIndex];
                    return {
                        select: liste?.parti?.id?.toString() || "", // Convert party ID to string
                        input1: liste?.pnAgentListe || "",
                        input2: liste?.numListe?.toString() || ""
                    };
                });

                return {
                    parentRowIndex: bureauIndex,
                    rows: rows
                };
            }));
            }

            
        }catch(error: any){
            console.error("Error fetching data for tables:", error);
            toast({
                title: "Error",
                description: `Failed to load data for tables: ${error.message}`,
                variant: "destructive",
            });
        }

    }

    useEffect(() => {
        loadTablesSize();
        fetchAllParties();
        // Moved loadData to a separate useEffect that depends on tableDimensions
    }, []);

    // This effect runs when tableDimensions changes
    useEffect(() => {
        // Only load data when dimensions are properly set
        if (tableDimensions.nombreBureaux > 0 && tableDimensions.nombreListes > 0) {
            loadData();
        }
    }, [tableDimensions]);


      
    
    /**
     * Handle changes to the first table's editable column
     * @param {number} rowIndex - Index of the row being edited
     * @param {string} value - New value for the cell
     */
    const handleTable1Change = (rowIndex: number, value: string) => {
        setTable1(prev => {
            const newTable = [...prev];
            newTable[rowIndex] = { ...newTable[rowIndex], col: value };
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
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        

        const token = localStorage.getItem("auth_token");
        if (!token) {
            toast({
                title: "Authentication Required",
                description: "Please log in to view prefectures.",
                variant: "destructive",
            });
            logout();
            return;
        }

        // // Prepare data for backend submission
        const dataToSave = table1.map((bureauRow, bureauIndex) => ({
            name: bureauRow.col,
            dashboardEntryGUID: entryId, // This is the string GUID
            listes: table2Data[bureauIndex].rows.map(listRow => ({
                // id: listRow.selec, // Will be undefined for new lists
                pnAgentListe: listRow.input1,
                parti: {id:parseInt(listRow.select)},
            }))
        }));

        let method: "POST" | "PUT";
        let url: string;

        // This `isNewEntryForBureaux` state correctly determines if it's a new creation
        if (isNewEntryForBureaux) {
            method = "POST";
            url = `/api/Bureaux/saveBureauAndLists`; // <--- This endpoint is called
        } else {
            method = "PUT";
            url = `/api/Bureaux/updateBureauxAndLists/${entryId}`;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSave),
            });

            // ... (Success/Error handling) ...

            if (!response.ok) {
                    const errorDetail = await response.text();
                    
                    if (response.status === 401) {
                        toast({
                            title: "Session Expired",
                            description: "Your session has expired. Please log in again.",
                            variant: "destructive",
                        });
                        logout();
                        return;
                    }
                    
                    throw new Error(`Failed to save data: ${response.status} - ${errorDetail}`);
                }

        } catch (error: any) {
            console.error("Error saving data:", error);
            toast({
                title: "Error",
                description: `failed to save data: ${error.message}`,
                variant: "destructive",
            });
        }
        // console.log("Form data to save:", formData);
        setSuccessMsg("تم حفظ البيانات بنجاح");
        setTimeout(() => setSuccessMsg(null), 2000);
    };

    // Labels for UI text
    
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
                                                        value={row.col}
                                                        onChange={(e) => handleTable1Change(rowIndex, e.target.value)}
                                                        placeholder="أدخل نصاً..."
                                                    />
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {row.number}
                                                        {table2Data
                                                            .find(d => d.parentRowIndex === rowIndex)
                                                            ?.rows.every(row => row.select && row.input1 && row.input2) && (
                                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
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
                                                                                            e.target.value,
                                                                                        )}
                                                                                    >
                                                                                        <option value="" key={"default"}>اختر...</option>
                                                                                        {partieSelect.map((opt) => (
                                                                                            <option key={opt.id} value={opt.id}>
                                                                                                {opt.name}
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
                                                                                        type="numeric"
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
                                {isNewEntryForBureaux ? labels.save : labels.update}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}