import { useState } from "react";

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
