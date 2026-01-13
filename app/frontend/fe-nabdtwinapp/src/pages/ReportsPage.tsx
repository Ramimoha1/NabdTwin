import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    ChevronDown, Building2, Info, FileDown, FileText, Search, X, RotateCcw,
    Users, BookmarkPlus, Edit2, Trash2, Calendar, Play, Download, Eye, Clock, User, AlertCircle
} from "lucide-react";
import MainPageHeader from "../components/MainPageHeader.tsx";
import { generateBranchReport, generateEmployeeReport, fetchReportHistory, downloadReportById, fetchBranches, fetchEmployees, fetchReportTemplates, saveReportTemplate, updateReportTemplate, deleteReportTemplate } from '../services/API/reportsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BRANCH_METRICS, EMPLOYEE_METRICS, migrateTemplateMetrics, normalizeMetricName } from '../constants/reportMetrics';

// Types
type Template = {
    id: string;
    name: string;
    type: "Branch" | "Employee";
    createdDate: string;
    // ✅ Support both 'metrics' (new) and 'kpis' (legacy) for backward compatibility
    metrics?: string[];
    kpis?: string[];
    branches?: string[];
    employees?: string[];
    dateRange: string;
    // ✅ Support both 'branch' and 'branchName' for backward compatibility
    branch?: string;
    branchName?: string;
};

type ReportHistory = {
    id: string;
    name: string;
    type: "Branch" | "Employee";
    generatedDate: string;
    generatedBy: string;
    format: "PDF" | "CSV";
    branch?: string;
    employees?: string[];
    kpis: string[];
    dateRange: string;
};

// Custom Date Picker
function CustomDatePicker({ value, onChange, min, max, label }: { value: string; onChange: (date: string) => void; min?: string; max?: string; label: string; }) {
    const [month, setMonth] = useState(""); const [day, setDay] = useState(""); const [year, setYear] = useState("");
    const months = [{ value: "01", label: "January" }, { value: "02", label: "February" }, { value: "03", label: "March" }, { value: "04", label: "April" }, { value: "05", label: "May" }, { value: "06", label: "June" }, { value: "07", label: "July" }, { value: "08", label: "August" }, { value: "09", label: "September" }, { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" }];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    const getDaysInMonth = (m: string, y: string) => new Date(parseInt(y || `${currentYear}`), parseInt(m), 0).getDate();
    const days = Array.from({ length: month ? getDaysInMonth(month, year) : 31 }, (_, i) => i + 1);
    useEffect(() => { if (value) { const [y, m, d] = value.split("-"); setYear(y); setMonth(m); setDay(d); } }, [value]);
    useEffect(() => { if (month && day && year) onChange(`${year}-${month}-${day.padStart(2, "0")}`); }, [month, day, year, onChange]);
    const handleMonthChange = (m: string) => { setMonth(m); if (day && year && parseInt(day) > getDaysInMonth(m, year)) setDay(getDaysInMonth(m, year).toString()); };
    return (
        <div>
            <label className="block text-xs text-slate-600 mb-1">{label}</label>
            <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                    <select value={month} onChange={(e) => handleMonthChange(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Month</option>{months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={day} onChange={(e) => setDay(e.target.value)} disabled={!month} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50">
                        <option value="">Day</option>{days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Year</option>{years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

// Branch Report Export
function BranchReportExport({ loadedTemplate, onTemplateClear }: { loadedTemplate: Template | null; onTemplateClear: () => void; }) {
    const [selectedBranch, setSelectedBranch] = useState("All");
    const [selectedKPIs, setSelectedKPIs] = useState<string[]>(["Productivity Score", "Revenue"]);
    const [dateRange, setDateRange] = useState("Last 30 days");
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(""); const [customEndDate, setCustomEndDate] = useState("");
    const [exportError, setExportError] = useState<string>("");
    const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);

    // ✅ Fetch real branches from API
    const { data: branchesData = [] } = useQuery({
        queryKey: ['branches'],
        queryFn: fetchBranches,
    });
    const branches = ["All", ...branchesData.map(b => b.name)];
    const branchesLoaded = branchesData.length > 0;

    // ✅ Use centralized BRANCH_METRICS from constants
    const availableKPIs = BRANCH_METRICS as any;
    const datePresets = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom Range"];
    
    // ✅ FIX: "Detach on Edit" - Clear template when user manually changes any filter
    const toggleKPI = (kpi: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setSelectedKPIs(prev => prev.includes(kpi) ? prev.filter(k => k !== kpi) : [...prev, kpi]);
    };
    const toggleAllKPIs = () => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setSelectedKPIs(selectedKPIs.length === availableKPIs.length ? [] : [...availableKPIs]);
    };
    const handleDateRangeChange = (range: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setDateRange(range); 
        setShowCustomDate(range === "Custom Range"); 
        if (range !== "Custom Range") { setCustomStartDate(""); setCustomEndDate(""); }
    };
    const handleBranchChange = (branch: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setSelectedBranch(branch);
    };
    const handleCustomStartDateChange = (date: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setCustomStartDate(date);
    };
    const handleCustomEndDateChange = (date: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setCustomEndDate(date);
    };
    const previewData: Record<string, string> = { "Productivity Score": "87%", "Revenue": "$2.5M", "Revenue Target": "$3M", "Revenue Achievement %": "83%", "Satisfaction Score": "92%", "Growth Rate": "12%", "Employee Count": "45", "Joined This Month": "3", "Left This Month": "1", "Overdue Tasks": "8", "Performance Rating": "8.5/10" };

    // Get effective date range for display and payload
    const getEffectiveDateRange = () => {
        if (showCustomDate && customStartDate && customEndDate) {
            return {
                from: customStartDate,
                to: customEndDate,
                label: `${new Date(customStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(customEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            };
        }
        // For presets, still return label string for backward compatibility
        return dateRange;
    };

    // Get display label for preview panel
    const getDisplayLabel = () => {
        if (showCustomDate && customStartDate && customEndDate) {
            const range = getEffectiveDateRange();
            return typeof range === 'string' ? range : range.label;
        }
        return dateRange;
    };

    // Check if branch selection is valid (not "All")
    const isBranchValid = selectedBranch && selectedBranch !== "All";

    // ✅ Helper: normalize values for comparison
    const normalize = (v: unknown) => String(v ?? '').trim().toLowerCase();

    // ✅ Apply template with robust error handling
    const applyTemplate = (template: Template) => {
        try {
            // Step 1: Normalize template fields for backward compatibility
            // Use migrateTemplateMetrics to handle legacy metric names
            const rawMetrics = template.metrics ?? template.kpis ?? [];
            const templateMetrics = migrateTemplateMetrics(rawMetrics, "Branch");
            const templateBranch = template.branch ?? template.branchName ?? null;
            const templateDateRange = template.dateRange ?? "Last 30 days";

            // Step 2: Match metrics by label (case-insensitive)
            const metricOptionMap = new Map(
                availableKPIs.map(m => [normalizeMetricName(m), m])
            );
            const resolvedMetrics = templateMetrics
                .map((m: any) => metricOptionMap.get(normalizeMetricName(m)))
                .filter((m: any): m is string => m !== undefined);

            // ✅ ALWAYS set metrics (overwrite old selections, don't merge)
            setSelectedKPIs(resolvedMetrics.length > 0 ? resolvedMetrics : []);
            if (templateMetrics.length > 0 && resolvedMetrics.length === 0) {
                console.warn('🟡 [Template apply - Branch] No metrics could be resolved from:', templateMetrics);
            }

            // Step 3: Match branch
            let resolvedBranchValue = "All"; // Default to "All"
            if (templateBranch && branches.length > 0) {
                const resolvedBranch = branches.find(
                    b => normalizeMetricName(b) === normalizeMetricName(templateBranch)
                );
                if (resolvedBranch) {
                    resolvedBranchValue = resolvedBranch;
                } else {
                    console.warn('🟡 [Template apply - Branch] Branch not found:', templateBranch, 'available:', branches);
                }
            }
            // ✅ ALWAYS set branch (overwrite old selections)
            setSelectedBranch(resolvedBranchValue);

            // Step 4: Set date range
            setDateRange(templateDateRange);
            setShowCustomDate(templateDateRange === "Custom Range");
            if (templateDateRange?.includes(" - ")) {
                const [start, end] = templateDateRange.split(" - ");
                setCustomStartDate(start.trim());
                setCustomEndDate(end.trim());
            } else {
                setCustomStartDate("");
                setCustomEndDate("");
            }

            setExportError("");

            console.log('[Template apply - Branch]', {
                template,
                migratedMetrics: templateMetrics,
                resolvedMetrics,
                resolvedBranch: resolvedBranchValue,
                dateRange: templateDateRange
            });
        } catch (error) {
            console.error('❌ [Template apply - Branch] Error:', error);
            setExportError('Failed to apply template');
        }
    };

    // ✅ Handle template application (wait for data)
    useEffect(() => {
        if (loadedTemplate) {
            if (!branchesLoaded) {
                setPendingTemplate(loadedTemplate);
            } else {
                applyTemplate(loadedTemplate);
                setPendingTemplate(null);
            }
        }
    }, [loadedTemplate]);

    // ✅ Apply pending template when data loads
    useEffect(() => {
        if (pendingTemplate && branchesLoaded) {
            applyTemplate(pendingTemplate);
            setPendingTemplate(null);
        }
    }, [pendingTemplate, branchesLoaded]);

    const handleExport = async (format: 'PDF' | 'CSV') => {
        setExportError("");

        // Validate branch selection first
        if (!isBranchValid) {
            setExportError("Please select a specific branch to generate a report.");
            return;
        }

        if (selectedKPIs.length === 0) {
            setExportError("Please select at least one KPI.");
            return;
        }

        try {
            await generateBranchReport({
                branch: selectedBranch,
                kpis: selectedKPIs,
                dateRange: getEffectiveDateRange(),
                format
            });
            setExportError("");
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate report. Please try again.';
            setExportError(errorMessage);
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {loadedTemplate && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-amber-900"><Info className="w-4 h-4" /><span>Template <span className="font-medium">{loadedTemplate.name}</span> loaded</span></div>
                    <button onClick={onTemplateClear} className="flex items-center gap-1 px-3 py-1 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 text-xs text-amber-900"><RotateCcw className="w-3 h-3" />Clear</button>
                </div>
            )}
            <div className="flex items-start gap-3 mb-6">
                <Building2 className="w-6 h-6 text-blue-600 mt-0.5" />
                <div className="flex-1">
                    <h2 className="text-lg text-slate-900 mb-1">Branch Performance Report</h2>
                    <p className="text-sm text-slate-500">Generate comprehensive performance reports for branches with selected KPIs and period.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm text-slate-700 mb-2">Select Branch</label>
                        <div className="relative">
                            <select value={selectedBranch} onChange={(e) => handleBranchChange(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        {/* Validation message: "All" is not allowed for branch reports */}
                        {selectedBranch === "All" && (
                            <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Please select a specific branch to generate a report.
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-3">Select KPIs</label>
                        <div className="grid grid-cols-2 gap-3">
                            {availableKPIs.map(kpi => (
                                <button key={kpi} onClick={() => toggleKPI(kpi)} className={`px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${selectedKPIs.includes(kpi) ? "bg-blue-50 border-blue-300 text-blue-900" : "bg-white border-gray-300 text-slate-700 hover:border-blue-200"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedKPIs.includes(kpi) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                                            {selectedKPIs.includes(kpi) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>{kpi}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button onClick={toggleAllKPIs} className="mt-2 px-4 py-2.5 rounded-lg border text-sm bg-blue-50 border-blue-300 text-blue-900">{selectedKPIs.length === availableKPIs.length ? "Deselect All" : "Select All"}</button>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-3">Date Range</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            {datePresets.map(preset => (
                                <button key={preset} onClick={() => handleDateRangeChange(preset)} className={`px-4 py-2 rounded-lg border text-sm transition-all ${dateRange === preset ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-slate-700 hover:border-blue-300"}`}>{preset}</button>
                            ))}
                        </div>
                        {showCustomDate && (
                            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-gray-200">
                                <CustomDatePicker label="Start Date" value={customStartDate} onChange={handleCustomStartDateChange} max={customEndDate} />
                                <CustomDatePicker label="End Date" value={customEndDate} onChange={handleCustomEndDateChange} min={customStartDate} />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => handleExport('PDF')}
                            disabled={!isBranchValid}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${isBranchValid
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <FileDown className="w-4 h-4" /><span className="text-sm">Export as PDF</span>
                        </button>
                        <button
                            onClick={() => handleExport('CSV')}
                            disabled={!isBranchValid}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${isBranchValid
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <FileText className="w-4 h-4" /><span className="text-sm">Export as CSV</span>
                        </button>
                    </div>

                    {/* Error message display */}
                    {exportError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-900">{exportError}</p>
                            </div>
                            <button
                                onClick={() => setExportError("")}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-blue-100 p-4">
                        <div className="flex items-center gap-2 mb-4"><Info className="w-4 h-4 text-blue-600" /><h3 className="text-sm text-slate-900">Report Preview</h3></div>
                        <div className="space-y-3 text-xs text-slate-600">
                            <div><span className="text-slate-500">Branch:</span> {selectedBranch}</div>
                            <div><span className="text-slate-500">Period:</span> {getDisplayLabel()}</div>
                            <div><span className="text-slate-500">KPIs Selected:</span> {selectedKPIs.length}</div>
                            {selectedKPIs.length > 0 && (
                                <div className="border-t border-blue-200 pt-3 mt-3 space-y-2">
                                    <div className="text-xs text-slate-700">Selected Metrics:</div>
                                    {selectedKPIs.map(kpi => (
                                        <div key={kpi} className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">{kpi}</span>
                                            <span className="text-slate-900">{previewData[kpi] || "--"}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedKPIs.length === 0 && <div className="mt-4 text-xs text-slate-500 italic">Select at least one KPI to preview</div>}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-900">Reports include charts, trend analysis, and comparative data for selected metrics.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Employee Report Export
function EmployeeReportExport({ loadedTemplate, onTemplateClear }: { loadedTemplate: Template | null; onTemplateClear: () => void; }) {
    const [searchTerm, setSearchTerm] = useState(""); const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["Tasks Completed", "Task Completion Rate %"]);
    const [dateRange, setDateRange] = useState("Last 30 days"); const [showCustomDate, setShowCustomDate] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(""); const [customEndDate, setCustomEndDate] = useState("");
    const [filterBranch, setFilterBranch] = useState("All");
    const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);

    // ✅ Fetch real employees from API
    const { data: employeesData = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: fetchEmployees,
    });
    const employeesLoaded = employeesData.length > 0;

    // ✅ Use actual employee data with branch from API (don't override)
    const employees = employeesData.map(emp => ({
        id: emp.id,
        documentId: emp.documentId,  // Strapi v5 identifier for backend API
        name: emp.name,
        branch: emp.branch?.name || "Unassigned",  // Use actual branch from API
        branchId: emp.branch?.id,  // Include branchId for filtering
        role: "Employee",
        email: (emp as any).email,
    }));

    // ✅ Fetch real branches from API
    const { data: branchesData = [] } = useQuery({
        queryKey: ['branches'],
        queryFn: fetchBranches,
    });
    const branches = ["All", ...branchesData.map(b => b.name)];
    const branchesLoaded = branchesData.length > 0;

    // ✅ Use centralized EMPLOYEE_METRICS from constants
    const availableMetrics = EMPLOYEE_METRICS as any;
    const datePresets = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom Range"];

    // ✅ Filter employees by branch - comparing branch names
    const employeesByBranch = filterBranch === "All"
        ? employees
        : employees.filter(emp => emp.branch === filterBranch);

    // ✅ Further filter by search term
    const filteredEmployees = employeesByBranch.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // ✅ FIX: "Detach on Edit" - Clear template when user manually changes any filter
    const toggleEmployee = (id: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };
    const toggleAllEmployees = () => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        const ids = filteredEmployees.map(emp => emp.id);
        const allSelected = ids.every(id => selectedEmployees.includes(id));
        setSelectedEmployees(allSelected ? selectedEmployees.filter(id => !ids.includes(id)) : Array.from(new Set([...selectedEmployees, ...ids])));
    };
    const toggleMetric = (m: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setSelectedMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
    };
    const toggleAllMetrics = () => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setSelectedMetrics(selectedMetrics.length === availableMetrics.length ? [] : [...availableMetrics]);
    };
    const handleDateRangeChange = (range: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setDateRange(range); 
        setShowCustomDate(range === "Custom Range"); 
        if (range !== "Custom Range") { setCustomStartDate(""); setCustomEndDate(""); }
    };
    const handleBranchFilterChange = (branch: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setFilterBranch(branch);
    };
    const handleSearchChange = (term: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setSearchTerm(term);
    };
    const handleCustomStartDateChange = (date: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setCustomStartDate(date);
    };
    const handleCustomEndDateChange = (date: string) => {
        if (loadedTemplate) onTemplateClear();  // Detach template on manual edit
        setCustomEndDate(date);
    };
    const getSelectedEmployeeNames = () => employees.filter(emp => selectedEmployees.includes(emp.id)).map(emp => emp.name);

    // Get effective date range for display and payload (matches Branch report format)
    const getEffectiveDateRange = () => {
        if (showCustomDate && customStartDate && customEndDate) {
            return {
                from: customStartDate,
                to: customEndDate,
                label: `${new Date(customStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(customEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            };
        }
        // For presets, return string for backward compatibility
        return dateRange;
    };

    // Get display label for preview panel
    const getDisplayLabel = () => {
        if (showCustomDate && customStartDate && customEndDate) {
            const range = getEffectiveDateRange();
            return typeof range === 'string' ? range : range.label;
        }
        return dateRange;
    };

    // ✅ Helper: normalize values for comparison
    const normalize = (v: unknown) => String(v ?? '').trim().toLowerCase();

    // ✅ Apply template with robust error handling
    const applyTemplate = (template: Template) => {
        try {
            // Step 1: Normalize template fields for backward compatibility
            // Use migrateTemplateMetrics to handle legacy metric names
            const rawMetrics = template.metrics ?? template.kpis ?? [];
            const templateMetrics = migrateTemplateMetrics(rawMetrics, "Employee");
            const templateEmployees = template.employees ?? [];
            const templateDateRange = template.dateRange ?? "Last 30 days";

            // Step 2: Match metrics by label (case-insensitive)
            const metricOptionMap = new Map(
                availableMetrics.map(m => [normalizeMetricName(m), m])
            );
            const resolvedMetrics = templateMetrics
                .map((m: any) => metricOptionMap.get(normalizeMetricName(m)))
                .filter((m: any): m is string => m !== undefined);

            // ✅ ALWAYS set metrics (overwrite old selections, don't merge)
            setSelectedMetrics(resolvedMetrics.length > 0 ? resolvedMetrics : []);
            if (templateMetrics.length > 0 && resolvedMetrics.length === 0) {
                console.warn('🟡 [Template apply - Employee] No metrics could be resolved from:', templateMetrics);
            }

            // Step 3: Resolve employees (by id, documentId, name, email)
            const employeeKeyMap = new Map<string, typeof employees[0]>();
            employees.forEach(e => {
                if (e.documentId) employeeKeyMap.set(normalizeMetricName(e.documentId), e);
                if (e.email) employeeKeyMap.set(normalizeMetricName(e.email), e);
                if (e.name) employeeKeyMap.set(normalizeMetricName(e.name), e);
                if (e.id != null) employeeKeyMap.set(normalizeMetricName(String(e.id)), e);
            });

            const resolvedEmployeeIds = templateEmployees
                .map((x: any) => {
                    const emp = employeeKeyMap.get(normalizeMetricName(x));
                    return emp?.id;
                })
                .filter((id: any): id is string => id !== undefined);

            // ✅ ALWAYS set employees (overwrite old selections, don't merge)
            setSelectedEmployees(resolvedEmployeeIds.length > 0 ? resolvedEmployeeIds : []);
            if (templateEmployees.length > 0 && resolvedEmployeeIds.length === 0) {
                console.warn('🟡 [Template apply - Employee] No employees could be resolved from:', templateEmployees);
            }

            // Step 4: Set date range
            setDateRange(templateDateRange);
            setShowCustomDate(templateDateRange === "Custom Range");
            if (templateDateRange?.includes(" - ")) {
                const [start, end] = templateDateRange.split(" - ");
                setCustomStartDate(start.trim());
                setCustomEndDate(end.trim());
            } else {
                setCustomStartDate("");
                setCustomEndDate("");
            }

            // ✅ Clear search and branch filter for clean template view
            setSearchTerm("");
            setFilterBranch("All");

            console.log('[Template apply - Employee]', {
                template,
                migratedMetrics: templateMetrics,
                resolvedMetrics,
                resolvedEmployeeCount: resolvedEmployeeIds.length,
                dateRange: templateDateRange
            });
        } catch (error) {
            console.error('❌ [Template apply - Employee] Error:', error);
        }
    };

    // ✅ Handle template application (wait for data)
    useEffect(() => {
        if (loadedTemplate) {
            if (!employeesLoaded || !branchesLoaded) {
                setPendingTemplate(loadedTemplate);
            } else {
                applyTemplate(loadedTemplate);
                setPendingTemplate(null);
            }
        }
    }, [loadedTemplate]);

    // ✅ Apply pending template when data loads
    useEffect(() => {
        if (pendingTemplate && employeesLoaded && branchesLoaded) {
            applyTemplate(pendingTemplate);
            setPendingTemplate(null);
        }
    }, [pendingTemplate, employeesLoaded, branchesLoaded]);

    // Debug: Log branch filtering with detailed employee info
    useEffect(() => {
        if (employees.length > 0) {
            console.log("🔍 [Employee Filter Debug]", {
                filterBranch,
                totalEmployees: employees.length,
                uniqueBranches: [...new Set(employees.map(e => e.branch))],
                filteredByBranch: employeesByBranch.length,
                filteredBySearch: filteredEmployees.length,
                sampleEmployee: employees[0],
                sampleFiltered: employeesByBranch[0]
            });
        }
    }, [filterBranch, employees, employeesByBranch, filteredEmployees]);

    const handleExport = async (format: 'PDF' | 'CSV') => {
        if (selectedEmployees.length === 0) {
            alert('Please select at least one employee');
            return;
        }
        if (selectedMetrics.length === 0) {
            alert('Please select at least one metric');
            return;
        }

        try {
            // Map selectedEmployees (numeric IDs) to documentId values for backend API
            const employeeDocIds = selectedEmployees.map(empId => {
                const employee = employees.find(e => e.id === empId);
                return employee?.documentId || empId;
            });

            await generateEmployeeReport({
                employees: employeeDocIds,  // Send documentIds, not numeric IDs
                metrics: selectedMetrics,
                dateRange: getEffectiveDateRange(),
                format
            });
        } catch (error) {
            alert('Failed to generate report. Please try again.');
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {loadedTemplate && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-amber-900"><Info className="w-4 h-4" /><span>Template <span className="font-medium">{loadedTemplate.name}</span> loaded</span></div>
                    <button onClick={onTemplateClear} className="flex items-center gap-1 px-3 py-1 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 text-xs text-amber-900"><RotateCcw className="w-3 h-3" />Clear</button>
                </div>
            )}
            <div className="flex items-start gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-600 mt-0.5" />
                <div className="flex-1">
                    <h2 className="text-lg text-slate-900 mb-1">Employee KPI Report</h2>
                    <p className="text-sm text-slate-500">Generate detailed KPI reports for employees with metrics and time periods.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm text-slate-700 mb-2">Select Employees</label>
                        <div className="relative mb-3">
                            <select value={filterBranch} onChange={(e) => handleBranchFilterChange(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500">
                                {branches.map(b => <option key={b} value={b}>{b === "All" ? "All Branches" : `${b} Branch`}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search by name, branch, or role..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        {selectedEmployees.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="text-xs text-purple-900 w-full mb-1">{selectedEmployees.length} selected</div>
                                {getSelectedEmployeeNames().map(name => {
                                    const emp = employees.find(e => e.name === name);
                                    return (
                                        <div key={emp?.id} className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-purple-200 text-xs text-slate-700">
                                            <span>{name}</span>
                                            <button onClick={() => setSelectedEmployees(sel => sel.filter(id => id !== (emp?.id || "")))} className="hover:bg-purple-100 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-2 bg-slate-50 border-b border-gray-200">
                                <button onClick={toggleAllEmployees} className="w-full px-3 py-2 rounded-lg border text-sm text-left bg-white border-purple-300 text-purple-900 hover:bg-purple-50">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployees.includes(emp.id)) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                                            {filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployees.includes(emp.id)) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>{filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployees.includes(emp.id)) ? "Deselect All" : "Select All"} ({filteredEmployees.length})</span>
                                    </div>
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                                {filteredEmployees.length === 0 ? <div className="p-4 text-sm text-slate-500 text-center">No employees found</div> : filteredEmployees.map(emp => (
                                    <button key={emp.id} onClick={() => toggleEmployee(emp.id)} className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${selectedEmployees.includes(emp.id) ? "bg-purple-50" : ""}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedEmployees.includes(emp.id) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                                                {selectedEmployees.includes(emp.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-slate-900">{emp.name}</div>
                                                <div className="text-xs text-slate-500">{emp.role} • {emp.branch}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{filterBranch === "All" ? `Showing all ${filteredEmployees.length} employees` : `Showing ${filteredEmployees.length} employees from ${filterBranch}`}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-3">Select Metrics</label>
                        <div className="grid grid-cols-2 gap-3">
                            {availableMetrics.map(metric => (
                                <button key={metric} onClick={() => toggleMetric(metric)} className={`px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${selectedMetrics.includes(metric) ? "bg-purple-50 border-purple-300 text-purple-900" : "bg-white border-gray-300 text-slate-700 hover:border-purple-200"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedMetrics.includes(metric) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                                            {selectedMetrics.includes(metric) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>{metric}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button onClick={toggleAllMetrics} className="mt-2 px-4 py-2.5 rounded-lg border text-sm bg-purple-50 border-purple-300 text-purple-900">{selectedMetrics.length === availableMetrics.length ? "Deselect All" : "Select All"}</button>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-3">Date Range</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            {datePresets.map(preset => (
                                <button key={preset} onClick={() => handleDateRangeChange(preset)} className={`px-4 py-2 rounded-lg border text-sm transition-all ${dateRange === preset ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-gray-300 text-slate-700 hover:border-purple-300"}`}>{preset}</button>
                            ))}
                        </div>
                        {showCustomDate && (
                            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-gray-200">
                                <CustomDatePicker label="Start Date" value={customStartDate} onChange={handleCustomStartDateChange} max={customEndDate} />
                                <CustomDatePicker label="End Date" value={customEndDate} onChange={handleCustomEndDateChange} min={customStartDate} />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => handleExport('PDF')} disabled={selectedEmployees.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"><FileDown className="w-4 h-4" /><span className="text-sm">Export as PDF</span></button>
                        <button onClick={() => handleExport('CSV')} disabled={selectedEmployees.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"><FileText className="w-4 h-4" /><span className="text-sm">Export as CSV</span></button>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-gradient-to-br from-slate-50 to-purple-50 rounded-lg border border-purple-100 p-4">
                        <div className="flex items-center gap-2 mb-4"><Info className="w-4 h-4 text-purple-600" /><h3 className="text-sm text-slate-900">Report Preview</h3></div>
                        <div className="space-y-3 text-xs text-slate-600">
                            <div><span className="text-slate-500">Employees Selected:</span> {selectedEmployees.length}</div>
                            <div><span className="text-slate-500">Period:</span> {getDisplayLabel()}</div>
                            <div><span className="text-slate-500">Metrics Selected:</span> {selectedMetrics.length}</div>
                            {selectedEmployees.length > 0 && (
                                <div className="border-t border-purple-200 pt-3 mt-3">
                                    <div className="text-xs text-slate-700 mb-2">Employees:</div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {getSelectedEmployeeNames().map((name, i) => (
                                            <div key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />{name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedMetrics.length > 0 && (
                                <div className="border-t border-purple-200 pt-3 mt-3">
                                    <div className="text-xs text-slate-700 mb-2">Metrics:</div>
                                    <div className="space-y-1">
                                        {selectedMetrics.map((metric, i) => (
                                            <div key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />{metric}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {selectedEmployees.length === 0 && <div className="mt-4 text-xs text-slate-500 italic">Select at least one employee to generate a report</div>}
                    </div>
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-purple-900">
                                <div className="mb-1">Employee reports include:</div>
                                <ul className="list-disc list-inside space-y-0.5 text-purple-800">
                                    <li>Individual performance trends</li><li>Task completion analytics</li><li>Quality and efficiency metrics</li><li>Comparative benchmarking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Template Modal (using React Portal to escape transform context)
function TemplateModal({ template, onSave, onClose }: { template: Template | null; onSave: (t: Template) => void; onClose: () => void; }) {
    const [name, setName] = useState(template?.name || "");
    const [type, setType] = useState<"Branch" | "Employee">(template?.type || "Branch");

    // ✅ FIX: Prioritize 'metrics' if it has items, otherwise fall back to 'kpis'
    // This fixes the bug where empty [] kpis array was truthy and ignored metrics
    const getTemplateMetrics = (t: Template | null) => {
        if (!t) return [];
        const rawMetrics = (t.metrics && t.metrics.length > 0) 
            ? t.metrics 
            : (t.kpis && t.kpis.length > 0 ? t.kpis : []);
        return migrateTemplateMetrics(rawMetrics, t.type || "Branch");
    };

    const [selectedKPIs, setSelectedKPIs] = useState<string[]>(getTemplateMetrics(template));

    const [selectedBranches, setSelectedBranches] = useState<string[]>(template?.branches || []);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>(template?.employees || []);
    const [dateRange, setDateRange] = useState(template?.dateRange || "Last 30 days");

    // ✅ FIX: Reset all state when template prop changes (fixes edit modal showing stale data)
    useEffect(() => {
        if (template) {
            // Editing an existing template - reset all fields to template values
            setName(template.name || "");
            setType(template.type || "Branch");
            // Use the same fixed logic for metrics
            setSelectedKPIs(getTemplateMetrics(template));
            setSelectedBranches(template.branches || []);
            setSelectedEmployees(template.employees || []);
            setDateRange(template.dateRange || "Last 30 days");
        } else {
            // Creating a new template - reset to defaults
            setName("");
            setType("Branch");
            setSelectedKPIs([]);
            setSelectedBranches([]);
            setSelectedEmployees([]);
            setDateRange("Last 30 days");
        }
    }, [template]);

    // ✅ Fetch real branches from API (same as Branch Performance Report)
    const { data: branchesData = [], isLoading: branchesLoading, error: branchesError } = useQuery({
        queryKey: ['branches'],
        queryFn: fetchBranches,
        staleTime: 5 * 60 * 1000,
    });
    const branchOptions = branchesData.map(b => b.name);

    // ✅ Use centralized metric constants
    const branchMetrics = BRANCH_METRICS;
    const employeeMetrics = EMPLOYEE_METRICS;

    // ✅ Fetch real employees from API (keep full objects for modal)
    const { data: employeesData = [], isLoading: employeesLoading, error: employeesError } = useQuery({
        queryKey: ['employees'],
        queryFn: fetchEmployees,
        staleTime: 5 * 60 * 1000,
    });

    const datePresets = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom Range"];

    // ✅ Get available KPIs based on report type
    const availableKPIs = type === "Branch" ? branchMetrics : employeeMetrics;

    const toggle = (list: string[], setter: (v: string[]) => void, item: string, all?: boolean) => {
        if (all && item === "All") return setter(["All"]);
        setter(list.includes(item) ? list.filter(x => x !== item && (!all || x !== "All")) : [...list.filter(x => x !== "All"), item]);
    };

    const handleSave = () => {
        if (!name.trim()) return alert("Template name required");
        if (selectedKPIs.length === 0) return alert("Select at least one KPI");
        if (type === "Branch" && selectedBranches.length === 0) return alert("Select at least one branch");
        if (type === "Employee" && selectedEmployees.length === 0) return alert("Select at least one employee");

        const newId = template?.id ?? Date.now().toString();
        onSave({
            id: newId,
            name,
            type,
            metrics: selectedKPIs, // ✅ Save as 'metrics' (new format) instead of 'kpis'
            dateRange,
            ...(type === "Branch" ? { branches: selectedBranches } : { employees: selectedEmployees }),
            createdDate: template?.createdDate || new Date().toISOString().split("T")[0]
        });
    };

    // ✅ Render using React Portal to escape transform context
    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto z-[10000]">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg text-slate-900">{template ? "Edit Template" : "Create New Template"}</h3>
                        <p className="text-sm text-slate-500">Configure and save a reusable report template</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm text-slate-700 mb-2">Template Name *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-2">Report Type *</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => {
                                setType("Branch");
                                // Migrate if coming from Employee type
                                if (type === "Employee" && selectedKPIs.length > 0) {
                                    const migrated = migrateTemplateMetrics(selectedKPIs, "Branch");
                                    setSelectedKPIs(migrated);
                                }
                            }} className={`p-4 rounded-lg border text-left transition-all ${type === "Branch" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300 hover:border-blue-200"}`}>
                                <div className="flex items-center gap-3"><Building2 className={`w-5 h-5 ${type === "Branch" ? "text-blue-600" : "text-slate-400"}`} /><div><div className={`text-sm ${type === "Branch" ? "text-blue-900" : "text-slate-700"}`}>Branch Performance</div><div className="text-xs text-slate-500">Branch-level metrics</div></div></div>
                            </button>
                            <button onClick={() => {
                                setType("Employee");
                                // Migrate if coming from Branch type
                                if (type === "Branch" && selectedKPIs.length > 0) {
                                    const migrated = migrateTemplateMetrics(selectedKPIs, "Employee");
                                    setSelectedKPIs(migrated);
                                }
                            }} className={`p-4 rounded-lg border text-left transition-all ${type === "Employee" ? "bg-purple-50 border-purple-300" : "bg-white border-gray-300 hover:border-purple-200"}`}>
                                <div className="flex items-center gap-3"><Users className={`w-5 h-5 ${type === "Employee" ? "text-purple-600" : "text-slate-400"}`} /><div><div className={`text-sm ${type === "Employee" ? "text-purple-900" : "text-slate-700"}`}>Employee KPIs</div><div className="text-xs text-slate-500">Individual metrics</div></div></div>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-2">Select KPIs *</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-gray-200">
                            {availableKPIs.map(kpi => (
                                <button key={kpi} onClick={() => toggle(selectedKPIs, setSelectedKPIs, kpi)} className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${selectedKPIs.includes(kpi) ? (type === "Branch" ? "bg-blue-50 border-blue-300 text-blue-900" : "bg-purple-50 border-purple-300 text-purple-900") : "bg-white border-gray-300 text-slate-700 hover:border-gray-400"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selectedKPIs.includes(kpi) ? (type === "Branch" ? "bg-blue-600 border-blue-600" : "bg-purple-600 border-purple-600") : "border-gray-300"}`}>
                                            {selectedKPIs.includes(kpi) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className="text-xs">{kpi}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {type === "Branch" && (
                        <div>
                            <label className="block text-sm text-slate-700 mb-2">Select Branches *</label>
                            {branchesError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                                    <p className="text-sm text-red-700">Error loading branches. Please try again.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                {branchesLoading ? (
                                    <p className="text-sm text-slate-500 col-span-2">Loading branches...</p>
                                ) : branchOptions.length === 0 ? (
                                    <p className="text-sm text-slate-500 col-span-2">No branches available</p>
                                ) : (
                                    branchOptions.map(branch => (
                                        <button key={branch} onClick={() => toggle(selectedBranches, setSelectedBranches, branch)} className={`px-3 py-2 rounded-lg border text-sm transition-all ${selectedBranches.includes(branch) ? "bg-blue-50 border-blue-300 text-blue-900" : "bg-white border-gray-300 text-slate-700 hover:border-blue-200"}`}>{branch}</button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {type === "Employee" && (
                        <div>
                            <label className="block text-sm text-slate-700 mb-2">Select Employees *</label>
                            {employeesError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                                    <p className="text-sm text-red-700">Error loading employees. Please try again.</p>
                                </div>
                            )}
                            <div className="max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-gray-200 space-y-2">
                                {employeesLoading ? (
                                    <p className="text-sm text-slate-500">Loading employees...</p>
                                ) : employeesData.length === 0 ? (
                                    <p className="text-sm text-slate-500">No employees available</p>
                                ) : (
                                    employeesData.map(employee => (
                                        <button key={employee.id} onClick={() => toggle(selectedEmployees, setSelectedEmployees, employee.id)} className={`w-full px-3 py-2 rounded-lg border text-sm text-left transition-all ${selectedEmployees.includes(employee.id) ? "bg-purple-50 border-purple-300 text-purple-900" : "bg-white border-gray-300 text-slate-700 hover:border-purple-200"}`}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selectedEmployees.includes(employee.id) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                                                    {selectedEmployees.includes(employee.id) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <span className="text-xs">{employee.name}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm text-slate-700 mb-2">Preferred Date Range</label>
                        <div className="relative">
                            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500">
                                {datePresets.map(preset => <option key={preset} value={preset}>{preset}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-slate-50 border-t border-gray-200 px-6 py-4 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                    <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">{template ? "Update Template" : "Create Template"}</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Saved Templates
function SavedTemplates({ onUseTemplate }: { onUseTemplate: (template: Template) => void; }) {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // ✅ Fetch templates from backend
    const { data: templates = [], isLoading, error } = useQuery({
        queryKey: ['report-templates'],
        queryFn: fetchReportTemplates,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // ✅ Mutations for CRUD operations
    const createMutation = useMutation({
        mutationFn: saveReportTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['report-templates'] });
            setIsModalOpen(false);
        },
        onError: (error) => {
            console.error('❌ Error creating template:', error);
            alert('Failed to save template');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, template }: { id: string; template: Partial<Template> }) =>
            updateReportTemplate(id, template),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['report-templates'] });
            setIsModalOpen(false);
        },
        onError: (error) => {
            console.error('❌ Error updating template:', error);
            alert('Failed to update template');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteReportTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['report-templates'] });
        },
        onError: (error) => {
            console.error('❌ Error deleting template:', error);
            alert('Failed to delete template');
        }
    });

    const handleCreateTemplate = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const handleEditTemplate = (t: Template) => {
        setEditingTemplate(t);
        setIsModalOpen(true);
    };

    const handleDeleteTemplate = (id: string) => {
        if (window.confirm("Delete this template?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleSaveTemplate = (t: Template) => {
        console.log('💾 Saving template:', {
            isUpdate: !!editingTemplate,
            templateName: t.name,
            type: t.type,
            metricsCount: t.metrics?.length || 0,
            payload: t
        });
        
        if (editingTemplate) {
            console.log('🔄 Updating existing template with ID:', editingTemplate.id);
            updateMutation.mutate({
                id: editingTemplate.id,
                template: {
                    name: t.name,
                    type: t.type,
                    metrics: t.metrics || [],
                    branches: t.branches || [],
                    employees: t.employees || [],
                    dateRange: t.dateRange,
                    createdDate: t.createdDate,
                }
            }, {
                onSuccess: () => {
                    console.log('✅ Template updated successfully');
                    // Show success toast
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-[10001] animate-in fade-in slide-in-from-bottom-4';
                    toast.textContent = 'Template Updated Successfully!';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                },
                onError: (error: any) => {
                    const errorMsg = error?.message || 'Unknown error';
                    console.error('❌ Error updating template:', errorMsg);
                    // Show error toast
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[10001] animate-in fade-in slide-in-from-bottom-4';
                    toast.textContent = `Failed to update template: ${errorMsg}`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                }
            });
        } else {
            console.log('🆕 Creating new template');
            createMutation.mutate({
                name: t.name,
                type: t.type,
                metrics: t.metrics || [],
                branches: t.branches || [],
                employees: t.employees || [],
                dateRange: t.dateRange,
                createdDate: t.createdDate || new Date().toISOString().split('T')[0]
            }, {
                onSuccess: () => {
                    console.log('✅ Template created successfully');
                    // Show success toast
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-[10001] animate-in fade-in slide-in-from-bottom-4';
                    toast.textContent = 'Template Saved Successfully!';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                },
                onError: (error: any) => {
                    const errorMsg = error?.message || 'Unknown error';
                    console.error('❌ Error creating template:', errorMsg);
                    // Show error toast
                    const toast = document.createElement('div');
                    toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-[10001] animate-in fade-in slide-in-from-bottom-4';
                    toast.textContent = `Failed to save template: ${errorMsg}`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                }
            });
        }
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-3">
                        <BookmarkPlus className="w-6 h-6 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <h2 className="text-lg text-slate-900 mb-1">Saved Report Templates</h2>
                            <p className="text-sm text-slate-500">Create and manage reusable report templates.</p>
                        </div>
                    </div>
                    <button onClick={handleCreateTemplate} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm whitespace-nowrap">
                        <BookmarkPlus className="w-4 h-4" />Create Template
                    </button>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="text-center py-12">
                        <p className="text-sm text-slate-500">Loading templates...</p>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-900">Failed to load templates. Please try again.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && templates.length === 0 && !error && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <BookmarkPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 mb-4">No saved templates yet</p>
                        <button onClick={handleCreateTemplate} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm">Create Your First Template</button>
                    </div>
                )}

                {/* Templates grid */}
                {!isLoading && templates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(template => (
                            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {template.type === "Branch" ? <Building2 className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-purple-600" />}
                                        <h3 className="text-sm text-slate-900">{template.name}</h3>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs ${template.type === "Branch" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>{template.type}</span>
                                </div>
                                <div className="space-y-2 mb-4 text-xs text-slate-600">
                                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>Created: {new Date(template.createdDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                                    {(() => {
                                        const metrics = template.metrics ?? template.kpis ?? [];
                                        return (
                                            <>
                                                <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-400" /><span>{metrics.length} KPIs • {template.dateRange}</span></div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {metrics.slice(0, 3).map((kpi, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">{kpi}</span>)}
                                                    {metrics.length > 3 && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">+{metrics.length - 3} more</span>}
                                                </div>
                                            </>
                                        );
                                    })()}
                                    {template.branches && template.branches.length > 0 && <div className="text-xs text-slate-500">Branches: {template.branches.join(", ")}</div>}
                                    {template.employees && template.employees.length > 0 && <div className="text-xs text-slate-500">Employees: {template.employees.length} selected</div>}
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button onClick={() => onUseTemplate(template)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs"><Play className="w-3.5 h-3.5" />Use</button>
                                    <button onClick={() => handleEditTemplate(template)} className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteTemplate(template.id)} disabled={deleteMutation.isPending} className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-xs disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isModalOpen && (
                <TemplateModal template={editingTemplate} onSave={handleSaveTemplate} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
}

// Reports History Component
function ReportsHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"All" | "Branch" | "Employee">("All");
    const [filterFormat, setFilterFormat] = useState<"All" | "PDF" | "CSV">("All");

    const { data: reportHistory = [], isLoading, refetch } = useQuery({
        queryKey: ['report-history'],
        queryFn: fetchReportHistory,
        refetchInterval: 5000
    });

    const filteredHistory = reportHistory.filter((report: any) => {
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "All" || report.type === filterType;
        const matchesFormat = filterFormat === "All" || report.format === filterFormat;
        return matchesSearch && matchesType && matchesFormat;
    });

    const handleView = (id: string, format: string, name: string) => {
        if (format === 'PDF') {
            downloadReportById(id, format, name)
                .then(url => {
                    window.open(url, '_blank');
                })
                .catch(error => {
                    console.error('Failed to view report:', error);
                    alert('Failed to open report');
                });
        } else {
            alert(`View not available for ${format} format. Please download instead.`);
        }
    };

    const handleDownload = (id: string, format: string, name: string) => {
        downloadReportById(id, format, name)
            .catch(error => {
                console.error('Failed to download report:', error);
                alert('Failed to download report');
            });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Branch">Branch Reports</option>
                            <option value="Employee">Employee Reports</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={filterFormat}
                            onChange={(e) => setFilterFormat(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Formats</option>
                            <option value="PDF">PDF Only</option>
                            <option value="CSV">CSV Only</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg text-slate-900">Report History</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {isLoading ? 'Loading...' : `${filteredHistory.length} report${filteredHistory.length !== 1 ? "s" : ""} found`}
                    </p>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <p className="text-sm text-slate-500">Loading reports...</p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No reports found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredHistory.map((report: any) => (
                            <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {report.type === "Branch" ? (
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Users className="w-5 h-5 text-purple-600" />
                                            )}
                                            <h4 className="text-base text-slate-900 font-medium">{report.name}</h4>
                                            <span className={`px-2 py-0.5 rounded text-xs ${report.type === "Branch" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                                                {report.type}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                                                {report.format}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 mt-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{formatDate(report.generatedDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{report.generatedBy}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{report.dateRange}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Info className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{report.kpis.length} KPIs</span>
                                            </div>
                                        </div>

                                        {report.branch && (
                                            <div className="mt-2 text-xs text-slate-500">Branch: {report.branch}</div>
                                        )}
                                        {report.employees && (
                                            <div className="mt-2 text-xs text-slate-500">
                                                Employees: {report.employees.join(", ")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleView(report.id, report.format || 'PDF', report.name)}
                                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(report.id, report.format || 'PDF', report.name)}
                                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Main Reports Page
export default function ReportsPage() {
    const [loadedTemplate, setLoadedTemplate] = useState<Template | null>(null);
    const [activeView, setActiveView] = useState<"reports" | "history">("reports");
    const title = "Reports";
    const description = "Generate, export, and manage organizational performance reports with customizable metrics and timeframes";

    const handleUseTemplate = (template: Template) => {
        setLoadedTemplate(template);
        setActiveView("reports"); // Switch to reports view when using a template
        setTimeout(() => {
            document.getElementById(template.type === "Branch" ? "branch-report" : "employee-report")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    return (
        <div className="min-h-0 bg-slate-50">
            <MainPageHeader title={title} description={description} />

            {/* Tab Switcher */}
            <div className="px-6 md:px-8 pt-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
                    <button
                        onClick={() => setActiveView("reports")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "reports"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Reports
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveView("history")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "history"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            History
                        </div>
                    </button>
                </div>
            </div>

            {/* Content with slide animation */}
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: activeView === "reports" ? "translateX(0)" : "translateX(-100%)" }}
                >
                    {/* Reports View */}
                    <div
                        className={`w-full flex-shrink-0 px-6 md:px-8 py-6 space-y-6 ${activeView === "reports" ? "h-auto pointer-events-auto" : "h-0 overflow-hidden pointer-events-none"}`}
                    >
                        <div id="branch-report">
                            <BranchReportExport
                                loadedTemplate={loadedTemplate?.type === "Branch" ? loadedTemplate : null}
                                onTemplateClear={() => setLoadedTemplate(null)}
                            />
                        </div>
                        <div id="employee-report">
                            <EmployeeReportExport
                                loadedTemplate={loadedTemplate?.type === "Employee" ? loadedTemplate : null}
                                onTemplateClear={() => setLoadedTemplate(null)}
                            />
                        </div>
                        <SavedTemplates onUseTemplate={handleUseTemplate} />
                    </div>

                    {/* History View */}
                    <div
                        className={`w-full flex-shrink-0 px-6 md:px-8 py-6 ${activeView === "history" ? "h-auto pointer-events-auto" : "h-0 overflow-hidden pointer-events-none"}`}
                    >
                        <ReportsHistory />
                    </div>
                </div>
            </div>
        </div>
    );
}

