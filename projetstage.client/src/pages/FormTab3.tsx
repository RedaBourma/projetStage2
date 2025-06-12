import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast"; // Assuming you have shadcn/ui toast
import { useAuth } from "@/App"; // Import the auth context


interface FormTab3Props {
    // form1Data?: any | null; // Data from Form 1, if needed - RE-ADDED THIS PROP
    onNewEntry: () => void; // Callback for new entry logic
    entryId: string | null; // Unique entry ID from parent
}

const LABELS = {
    title: "إنتخاب أعضاء مجلس النواب",
    subtitle1: "إقتراع يوم الأربعاء 08 شتنبر 2021",
    subtitle2: "الإنتخابات على مستوى الدوائر الإنتخابية المحلية",
    choose: "اسم المكتب المركزي :",
    choosePlaceholder: "اختر",
    fieldX: "عدد المسجلين",
    fieldY: "عدد المصوتين",
    fieldZ: "عدد الأوراق الملغاة",
    fieldW: "عدد الأصوات المعبر عنها",
    calcError1: "يجب أن تساوي قيمة عدد المسجلين مجموع قيم عدد المصوتين, عدد الأوراق الملغاة, عدد الأصوات المعبر عنها",
    calcError2: "",
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
    summaryLab: {
        per: "العمالة أو الإقليم :",
        cir: "الدائرة الانتخابية :",
        selected: "عدد المقاعد :" // NEW LABEL FOR THE THIRD ITEM
    }

};

interface Summary {
    prefecture: string,
    Circonscription: string
    dropDown: BureauxSelected
}

interface PartisDto {
    id: number;
    name: string;
}

interface ListeDto {
    Id: number;
    pnAgentListe?: string;
    numListe: number;
    numVotes?: string;
    parti?: PartisDto
}

interface BureauxDto {
    id: number;
    name?: string;
    dashboardEntryId?: number
    nombreSieges?: number;
    listes: ListeDto[];
}

interface BureauxSelected {
    bureauxId: number,
    nombreSieges: number
}

interface BureauxdropdownStructure {
    key: number,
    value: string
}

interface ResultatsDto {
    
}


// Mock dropdown data - replace with backend data when integrating
// const MOCK_MAIN_DROPDOWN = ["عنصر ١", "عنصر ٢", "عنصر ٣"];

export default function FormTab3({ onNewEntry, entryId }: FormTab3Props) { // Re-added form1Data to props
    const { toast } = useToast();
    const { logout } = useAuth(); // Assuming useAuth is from App.tsx

    console.log("FormTab3 entryId:", entryId);
    const [X, setX] = useState("");
    const [Y, setY] = useState("");
    const [Z, setZ] = useState("");
    const [W, setW] = useState("");
    const [n, setN] = useState({
        id: 0,
        value: 0,
    })
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedItem, setSelectedItem] = useState<number | undefined>(undefined);
    // const [selectedItem, setSelectedItem] = useState<BureauxSelected>({
    //     bureauxId:0,
    //     nombreSieges: 0
    // }); 
    // State for the dropdown selection
    const [bureauxdropdown, setBureauxDropdown] = useState<BureauxdropdownStructure[]>([{key:0, value:""}]);
    const [bureaux, setBureaux] = useState<BureauxDto[]>([]);
    const [listes, setListes] = useState<ListeDto[]>([]);
    const [initData, setInitData] = useState<Summary>({
        prefecture: "اسم العمالة/الإقليم", 
        Circonscription: "اسم الدائرة الانتخابية", 
        dropDown: {
            bureauxId: 0,
            nombreSieges: 0
        }
    });
    const [clicked, setClicked] = useState<boolean>(false);

    useEffect(() => {
        const fetchBureaux = async () => {
            if(!entryId) {
                logout();
                return;
            }

            const token = localStorage.getItem("auth_token");
            if(!token){
                toast({
                    title: "Authentication Required",
                    description: "Please log in to view prefectures.",
                    variant: "destructive",
                });
                logout();
                return;
            }

            try {
                const response = await fetch(`api/Bureaux/getAllBureauxEntry/${entryId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                });

                if(!response.ok){
                    const errorDetail = await response.text();
                    if(response.status == 401) {logout(); return;}
                    throw new Error(`failed to  fetch bureaux: ${response.status} - ${errorDetail}`)
                }
                const data: BureauxDto[] = await response.json();

                setBureaux(data);
                const dropdownData : BureauxdropdownStructure[] = data.map(item => ({
                    key: item.id,
                    value: item.name ?? '',
                }))
                setBureauxDropdown(dropdownData)

                console.table(data);

            }catch(error: any){
            console.error("Error fetching Bureaux:", error);
            toast({
                title: "Error",
                description: `Failed to load Bureaux: ${error.message}`,
                variant: "destructive",
            });
            }
        }

        fetchBureaux()
    }, [])

    let selectedBureau = bureaux.find(b => b.id === selectedItem)
    useEffect(() => {
        selectedBureau = bureaux.find(b => b.id === selectedItem)

        const lis : ListeDto[] = selectedBureau?.listes ?? [];

        setListes(lis);
    }, [selectedItem])

    

    // Table sample data
    // const MOCK_TABLE_ROWS = [
    //     { readA: "قيمة ١", readB: "قيمة ٢", readC: "قيمة ٣" },
    //     { readA: "قيمة ٤", readB: "قيمة ٥", readC: "قيمة ٦" },
    // ];

    const handleCalc = () => {
        // Convert to numbers for calculation, handle potential empty strings as 0
        const numX = Number(X || 0);
        const numY = Number(Y || 0);
        const numZ = Number(Z || 0);
        const numW = Number(W || 0);

        if (numX !== numY + numZ + numW 
            || X === "" || Y === "" || Z === "" || W === "") {
            setError(LABELS.calcError1);
            toast({
                title: "خطأ في الحساب",
                description: LABELS.calcError1,
                variant: "destructive"
            });
            return;
        }

        if(listes.some(item => !item.numVotes || item.numVotes.trim() === "")){
            setError(LABELS.calcError2)
            toast({
                title: "خطأ في الحساب",
                description: LABELS.calcError2,
                variant: "destructive"
            });
            return;
        }
   
        setError("");
        setClicked(true);
        setSuccess("تم الحساب بنجاح");
        toast({
            title: "نجاح",
            description: "تم الحساب بنجاح",
            variant: "default"
        });
        setTimeout(() => setSuccess(""), 3000);
    };

 
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const val = e.target.value;
        if (val === "" || (/^\d+$/.test(val) && Number(val) >= 1)) {
            const updated = [...listes];
            updated[index].numVotes = val.replace(/^0+/, "");
            setListes(updated);
        }
        setClicked(false);
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
                    <div>
                        {clicked ? (
                            <p>true</p>
                        ): (
                            <p>false</p>
                        )}
                    </div>
                    {/* Summary Rectangle - ENHANCED DESIGN */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-right flex flex-col  grid grid-cols-1 md:grid-cols-4 gap-4 rtl gap-2">
                        {
                            <>
                                <div className="flex items-center gap-2 text-lg">
                                    <span className="font-semibold">{LABELS.summaryLab.per}</span>
                                    <span className="text-blue-800 font-bold">{"dsafas"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-lg">
                                    <span className="font-semibold">{LABELS.summaryLab.cir}</span>
                                    <span className="text-blue-800 font-bold">{"dafsafdf"}</span>
                                </div>
                                {/* New conditional display for selected item */}
 
                                {selectedItem && (
                                    <div className="flex items-center gap-2 text-lg">
                                        <span className="font-semibold">{LABELS.summaryLab.selected}</span>
                                        <span className="text-blue-800 font-bold">{selectedBureau?.nombreSieges}</span>
                                    </div>
                                )}
                                {/* <div className="text-base font-medium text-gray-700 mt-2">
                                    القيم العددية: {"dsafas"}, {"dsaf"}, {"sdfsdafsad"}
                                </div> */}
                            </>
                        }
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Main dropdown selection */}
                        <div>
                            <label className="gov-label">{LABELS.choose}</label>
                            <select
                                className="gov-select"
                                value={selectedItem}
                                onChange={e => {setSelectedItem(Number(e.target.value));
                                    setClicked(false);
                                    console.log(selectedItem);
                                }}
                            >
                                <option value="">{LABELS.choosePlaceholder}</option>
                                {bureauxdropdown.map((item) => <option key={item.key} value={item.key}>{item.value}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Input rectangle */}
                    <div className="mb-6 p-5 bg-green-50 rounded-lg border border-green-100">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rtl">
                            <div>
                                <label className="gov-label">{LABELS.fieldX}</label>
                                {clicked? (
                                    <span className="text-base">{X}</span>
                                ) : (
                                    <input className="gov-input" type="number" min={1} step={1} value={X}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === "" || (/^\d+$/.test(val) && Number(val) >= 1)){
                                                setX(val.replace(/^0+/, ""));
                                            }
                                            setClicked(false);
                                        }}
                                        placeholder="أدخل قيمة" />
                                )}
                            </div>
                            <div>
                                <label className="gov-label">{LABELS.fieldY}</label>
                                {clicked? (
                                    <span className="text-base">{Y}</span>
                                ) : (
                                    <input className="gov-input" type="number" min={1} step={1} value={Y}
                                        onChange={e => {

                                            const val = e.target.value;
                                            if (val === "" || (/^\d+$/.test(val) && Number(val) >= 1)){
                                                setY(val.replace(/^0+/, ""));
                                            }
                                            setClicked(false);
                                        }}
                                        placeholder="أدخل قيمة" />
                                )}
                            </div>
                            <div>
                                <label className="gov-label">{LABELS.fieldZ}</label>
                                {clicked? (
                                    <span className="text-base">{Z}</span>
                                ) : (
                                    <input className="gov-input" type="number" min={1} step={1} value={Z}
                                        onChange={e => {

                                            const val = e.target.value;
                                            if (val === "" || (/^\d+$/.test(val) && Number(val) >= 1)){
                                                setZ(val.replace(/^0+/, ""));
                                            }
                                            setClicked(false);
                                        }}
                                        placeholder="أدخل قيمة" />
                                )}
                            </div>
                            <div>
                                <label className="gov-label">{LABELS.fieldW}</label>
                                {clicked? (
                                    <span className="text-base">{W}</span>
                                ) : (
                                <input className="gov-input" type="number" min={1} step={1} value={W}
                                    onChange={e => {

                                        const val = e.target.value;
                                        if (val === "" || (/^\d+$/.test(val) && Number(val) >= 1)){
                                            setW(val.replace(/^0+/, ""));
                                        }
                                        setClicked(false);
                                    }}
                                    placeholder="أدخل قيمة" />
                                )}
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
                        {/* <button
                            className="gov-btn bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                            onClick={handleCreateDashboardEntry}
                        >
                            {LABELS.createDashboardEntry}
                        </button> */}

                        <button
                            className="gov-btn px-6 py-2"
                            onClick={handleCalc}
                        >
                            {LABELS.calcButton}
                        </button>

                        {/* <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                            <span className="text-md font-medium">{LABELS.resultFieldLabel}</span>
                            <span className="text-blue-600 font-bold">{LABELS.resultFieldValue}</span>
                        </div> */}

                    </div>

                    {/* Excel-style table - RTL order */}
                    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
                        <h3 className="text-lg font-semibold p-3 bg-gray-50 border-b">جدول النتائج</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse excel-table rtl-table text-base">
                                <thead className="bg-gray-100">
                                    <tr className="bg-gray-100">
                                        {/* Reverse the header order */}
                                        {LABELS.tableHeaders.slice().reverse().map((head, i) => (
                                            <th key={i} className="border border-gray-300 p-2 text-base">{head}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {listes?.map((item, index) => (
                                        <tr key={item.numListe} className="hover:bg-blue-50">
                                            {/* Ensure no whitespace between <td> tags */}
                                            <td className="border border-gray-300 p-2 text-base">{item.numListe}</td>
                                            <td className="border border-gray-300 p-2 text-base">{item.pnAgentListe}</td>
                                            <td className="border border-gray-300 p-2 text-base">{item.parti?.name}</td>
                                            <td className="border border-gray-300 p-2">
                                                {clicked? (
                                                    <span className="text-base">{item.numVotes}</span>
                                                ): (
                                                    <input type="number" min={1} step={1} onChange={(e) => handleInputChange(e, index)} className="text-base w-full" 
                                                    placeholder="أدخل قيمة"
                                                    />
                                                )}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-base">{
                                                
                                            }</td>
                                            <td className="border border-gray-300 p-2 text-base">{}</td>
                                            <td className="border border-gray-300 p-2 text-base">{}</td>
                                            <td className="border border-gray-300 p-2 text-base">{}</td>
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
