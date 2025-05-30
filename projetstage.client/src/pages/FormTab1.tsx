import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App"; 
import type { DashboardEntry } from "./DashboardTab";

const LABELS = {
    title: "الإعدادات الأساسية",
    option1Label:"العمالة أو الإقليم أو عمالة المقاطعات",
        option1Placeholder: "اختر قيمة",
    option2Label: "الدائرة الإنتخابية المحلية",
        option2Placeholder: "اختر خيار",
    num1Label: "عدد المكاتب المركزية",
    num2Label: "عدد المقاعد",
    num3Label: "عدد اللوائح",
        numPlaceholder: "...",
    saveBtn: "تسجيل",
    updateBtn:"تحديث",
    // updateButton label
    dropdown1: ["كلميم", "الرباط"], // Arabic regions - replace with API data
    dropdown2: ["كلميم", "كلميم"],  // Arabic districts - replace with API data
        errorDropdown1: "يرجى اختيار قيمة",
        errorDropdown2: "يرجى اختيار خيار",
        errorNum: "يجب إدخال رقم أكبر من 0",
};

// Define interfaces based on the backend models
interface Prefecture {
    id: number;
    name: string;
}

interface Circonscription {
    id: number;
    name: string;
    prefectureId: number;
}

interface Props {
    onSubmit: (values: any) => void; // Function to call when form is submitted
    onUpdate: (values: any) => void;
    initialValues?: any | null;                          // Optional initial values for form fields
    entryId: string | null;                                    // Unique entry ID from parent
    isCreating: boolean
}

export default function FormTab1({ onSubmit, onUpdate,initialValues, entryId, isCreating}: Props) {
    const { toast } = useToast();
    const { logout } = useAuth();
    // Form state variables
    const [dropdown1, setDropdown1] = useState(initialValues?.dropdown1 ?? "");
    const [dropdown2, setDropdown2] = useState(initialValues?.dropdown2 ?? "");
    const [num1, setNum1] = useState(initialValues?.num1?.toString() ?? "");
    const [num2, setNum2] = useState(initialValues?.num2?.toString() ?? "");
    const [num3, setNum3] = useState(initialValues?.num3?.toString() ?? "");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
    const [circonscriptions, setCirconscriptions] = useState<Circonscription[]>([]);
    const [selectedPrefectureId, setSelectedPrefectureId] = useState<number | null>(null);
    const [isLoadingPrefectures, setIsLoadingPrefectures] = useState(false);
    const [isLoadingCirconscriptions, setIsLoadingCirconscriptions] = useState(false);
    
    const [initialCirconscriptionName, setInitialCirconscriptionName] = useState<string | null>(null);

    
    useEffect(() =>{
        const fetchFormDataForUpdate = async () => {
           if(entryId == null){
            return;
           } 

           try{

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

                const response = await fetch(`/api/Dashboard/getentry/${entryId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

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
                    
                    throw new Error(`Failed to fetch formdata: ${response.status} - ${errorDetail}`);
                }
                
                const data: DashboardEntry = await response.json();
                setDropdown1(data.prefectureName)
                setSelectedPrefectureId(data.prefectureId)
                setInitialCirconscriptionName(data.circonscriptionName)
                setNum1(data.nombreBureaux)
                setNum2(data.nombreSieges)
                setNum3(data.nombreListes)
                // setDropdown2()
                

           }catch(error: any){

           }
        }
        fetchFormDataForUpdate();
    },[])
    // Fetch prefectures from backend when component mounts
    useEffect(() => {
        const fetchPrefectures = async () => {
            setIsLoadingPrefectures(true);
            try {
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
                
                const response = await fetch("/api/Prefecture/getprefectures", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });
                
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
                    
                    throw new Error(`Failed to fetch prefectures: ${response.status} - ${errorDetail}`);
                }
                
                const data = await response.json();
                console.log("getprefectures data: ",data)
                setPrefectures(data);
                
                // If initialValues has a dropdown1 value, set the selectedPrefectureId
                if (initialValues?.dropdown1) {
                    const prefecture = data.find((p: any) => p.name === initialValues.dropdown1);
                    if (prefecture) {
                        setSelectedPrefectureId(prefecture.id);
                    }
                }
            } catch (error: any) {
                console.error("Error fetching prefectures:", error);
                toast({
                    title: "Error",
                    description: `Failed to load prefectures: ${error.message}`,
                    variant: "destructive",
                });
                // Show error but don't set any fallback data
                setPrefectures([]);
            } finally {
                setIsLoadingPrefectures(false);
            }
        };
        
        fetchPrefectures();
    }, []);
    
    // Fetch circonscriptions when selectedPrefectureId changes
    useEffect(() => {
        if (!selectedPrefectureId) {
            setCirconscriptions([]);
            setDropdown2("");
            return;
        }
        
        const fetchCirconscriptions = async () => {
            setIsLoadingCirconscriptions(true);
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    return;
                }
                
                console.log(selectedPrefectureId)

                const response = await fetch(`/api/Circonscription/GetCirconscriptionById?preId=${selectedPrefectureId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });
                
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
                    
                    throw new Error(`Failed to fetch circonscriptions: ${response.status} - ${errorDetail}`);
                }
                
                const data = await response.json();
                console.log("GetCirconscriptionById data: ", data)
                setCirconscriptions(data);
                
                // If initialValues has a dropdown2 value and we're editing, select the matching circonscription
                if (initialCirconscriptionName && data.length > 0) {
                    const circonscriptionToSelect = data.find((c: any) => c.name === initialCirconscriptionName);
                    if (circonscriptionToSelect) {
                        setDropdown2(circonscriptionToSelect.name);
                        setInitialCirconscriptionName(null);
                    }
                } else {
                    // Clear dropdown2 if we're not editing or if there's no matching circonscription
                    setDropdown2("");
                }
            } catch (error: any) {
                console.error("Error fetching circonscriptions:", error);
                toast({
                    title: "Error",
                    description: `Failed to load circonscriptions: ${error.message}`,
                    variant: "destructive",
                });
                // Show error but don't set any fallback data
                setCirconscriptions([]);
            } finally {
                setIsLoadingCirconscriptions(false);
            }
        };
        
        fetchCirconscriptions();
    }, [selectedPrefectureId, initialValues, logout, toast]);
    
    /**
     * Handle prefecture selection change
     * This function:
     * 1. Extracts the selected prefecture ID from the dropdown
     * 2. Updates the form state with the appropriate display name
     * 3. Triggers the circonscription loading via the useEffect above
     */
    const handlePrefectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) {
            setDropdown1("");
            setSelectedPrefectureId(null);
            return;
        }
        
        const prefectureId = parseInt(value, 10);
        const selectedPrefecture = prefectures.find(prefecture => prefecture.id === prefectureId);
        if (selectedPrefecture) {
            setSelectedPrefectureId(prefectureId);
            setDropdown1(selectedPrefecture.name);
        }
    };
    
    /**
     * Handle circonscription selection change
     * This function:
     * 1. Extracts the selected circonscription ID from the dropdown
     * 2. Updates the form state with the appropriate display name
     */
    const handleCirconscriptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!value) {
            setDropdown2("");
            return;
        }
        
        const circonscriptionId = parseInt(value, 10);
        const selectedCirconscription = circonscriptions.find(circonscription => circonscription.id === circonscriptionId);
        if (selectedCirconscription) {
            setDropdown2(selectedCirconscription.name);
        }
    };
    
    /**
     * Form validation function
     * Validates that all required fields are filled and numbers are greater than 0
     * @returns {Object} - Object containing validation errors, if any
     */
    const validateForm = () => {
        let newErrors: { [k: string]: string } = {};
        
        // Validate first dropdown
        if (!dropdown1) {
            newErrors.dropdown1 = LABELS.errorDropdown1;
        }
        
        // Validate second dropdown
        if (!dropdown2) {
            newErrors.dropdown2 = LABELS.errorDropdown2;
        }
        
        // Validate numeric fields
        for (const [key, value] of Object.entries({ num1, num2, num3 })) {
            if (!value || parseInt(value) <= 0) {
                newErrors[key] = LABELS.errorNum;
            }
        }
        
        return newErrors;
    };
    
    /**
     * @param {React.FormEvent} e
     */
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({} as { [k: string]: string });

        try {
            const selectedPrefecture = prefectures.find(p => p.name === dropdown1);
            const selectedCirconscription = circonscriptions.find(c => c.name === dropdown2);
            
            if (!selectedPrefecture || !selectedCirconscription) {
                throw new Error("Invalid prefecture or circonscription selection");
            }
            
            // Prepare form data
            const formData = {
                prefectureId: selectedPrefecture.id,
                circonscriptionId: selectedCirconscription.id,
                nombreSieges: parseInt(num2),
                nombreBureaux: parseInt(num1),
                nombreListes: parseInt(num3)
            };

            await onUpdate(formData);

        }catch(error: any){
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to submit form",
                variant: "destructive",
            });
        }

    }

    /**
     * Form submission handler
     * Validates the form and calls the onSubmit callback with form values
     * If there's no entryId (new entry), it will first call the backend to initialize a new entry
     * @param {React.FormEvent} e - Form submit event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        // Clear any previous errors by setting an empty object
        setErrors({} as { [k: string]: string });
        
        try {
            // Get the selected prefecture and circonscription objects
            const selectedPrefecture = prefectures.find(p => p.name === dropdown1);
            const selectedCirconscription = circonscriptions.find(c => c.name === dropdown2);
            
            if (!selectedPrefecture || !selectedCirconscription) {
                throw new Error("Invalid prefecture or circonscription selection");
            }
            
            // Prepare form data
            const formData = {
                prefectureId: selectedPrefecture.id,
                circonscriptionId: selectedCirconscription.id,
                nombreSieges: parseInt(num2),
                nombreBureaux: parseInt(num1),
                nombreListes: parseInt(num3)
            };
            
            // Call the parent's onSubmit with the form data
            await onSubmit(formData);
            
            // Clear form if it's a new entry (no entryId)
            // if (!entryId) {
            //     setDropdown1("");
            //     setDropdown2("");
            //     setNum1("");
            //     setNum2("");
            //     setNum3("");
            //     setSelectedPrefectureId(null);
            // }
            
            isCreating = true;
        } catch (error: any) {
            console.error("Error submitting form:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to submit form",
                variant: "destructive",
            });
        }
    };
    
    return (
        <div className="p-6 w-full">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">{LABELS.title}</h1>
                
                <form className="bg-white shadow-md rounded-lg p-6" onSubmit={entryId == null?handleSubmit : handleUpdate }>

                    <p>{"المعرّف:  "}{ entryId == null ?"قيد الإنشاء": entryId}{}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* First dropdown - Regions/Provinces */}
            <div>
                            <label className="gov-label">{LABELS.option1Label}</label>
                <select
                                className={`gov-select ${errors.dropdown1 ? "border-red-500" : ""}`}
                    value={selectedPrefectureId?.toString() || ""}
                                onChange={handlePrefectureChange}
                                disabled={isLoadingPrefectures}
                >
                                <option value="">{isLoadingPrefectures ? "جاري تحميل البيانات..." : LABELS.option1Placeholder}</option>
                                {!isLoadingPrefectures && prefectures.map((prefecture) => (
                                    <option key={prefecture.id} value={prefecture.id}>
                                        {prefecture.name}
                                    </option>
                    ))}
                </select>
                            {errors.dropdown1 && <div className="text-red-500 text-sm mt-1">{errors.dropdown1}</div>}
            </div>
                        
                        {/* Second dropdown - Districts (dependent on first selection) */}
            <div>
                            <label className="gov-label">{LABELS.option2Label}</label>
                <select
                                className={`gov-select ${errors.dropdown2 ? "border-red-500" : ""}`}
                    value={circonscriptions.find(c => c.name === dropdown2)?.id.toString() || ""}
                                onChange={handleCirconscriptionChange}
                                disabled={isLoadingCirconscriptions || selectedPrefectureId === null}
                >
                                <option value="">
                                    {isLoadingCirconscriptions ? "جاري تحميل البيانات..." : 
                                     !selectedPrefectureId ? "الرجاء اختيار العمالة أو الإقليم أولاً" : 
                                     LABELS.option2Placeholder}
                                </option>
                                {!isLoadingCirconscriptions && circonscriptions.map((circonscription) => (
                                    <option key={circonscription.id} value={circonscription.id}>
                                        {circonscription.name}
                                    </option>
                    ))}
                </select>
                            {errors.dropdown2 && <div className="text-red-500 text-sm mt-1">{errors.dropdown2}</div>}
                        </div>
            </div>
                    
                    {/* Numeric input fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
                            <label className="gov-label">{LABELS.num1Label}</label>
                <input
                    type="number"
                                className={`gov-input ${errors.num1 ? "border-red-500" : ""}`}
                    value={num1}
                                onChange={(e) => setNum1(e.target.value)}
                                placeholder={LABELS.numPlaceholder}
                                min="1"
                />
                            {errors.num1 && <div className="text-red-500 text-sm mt-1">{errors.num1}</div>}
            </div>
                        
            <div>
                            <label className="gov-label">{LABELS.num2Label}</label>
                <input
                    type="number"
                                className={`gov-input ${errors.num2 ? "border-red-500" : ""}`}
                    value={num2}
                                onChange={(e) => setNum2(e.target.value)}
                                placeholder={LABELS.numPlaceholder}
                                min="1"
                />
                            {errors.num2 && <div className="text-red-500 text-sm mt-1">{errors.num2}</div>}
            </div>
                        
            <div>
                            <label className="gov-label">{LABELS.num3Label}</label>
                <input
                    type="number"
                                className={`gov-input ${errors.num3 ? "border-red-500" : ""}`}
                    value={num3}
                                onChange={(e) => setNum3(e.target.value)}
                                placeholder={LABELS.numPlaceholder}
                                min="1"
                />
                            {errors.num3 && <div className="text-red-500 text-sm mt-1">{errors.num3}</div>}
                        </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            className={`gov-btn px-6 py-3 ${entryId == null? "bg-blue-700 hover:bg-blue-800": "bg-green-700 hover:bg-green-800"} text-white font-bold rounded-md`}
                        >
                            {entryId == null ?LABELS.saveBtn:LABELS.updateBtn}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
