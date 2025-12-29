import { Users, Award, TrendingUp } from 'lucide-react';

export function TopEmployees({ employees, onSelectEmployee }: { employees: any[], onSelectEmployee: (id: string) => void }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Top Performing Employees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {employees.map((employee, index) => (
                    <button
                        key={employee.id}
                        onClick={() => onSelectEmployee(employee.id.toString())}
                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm">{employee.avatar}</div>
                                {index < 3 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"><Award className="w-3 h-3 text-white" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-slate-900 truncate">{employee.name}</div>
                                <div className="text-xs text-slate-500">{employee.branch}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                                <div className="text-xs text-slate-500">Score</div>
                                <div className="text-lg text-slate-900">{employee.score}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Tasks</div>
                                <div className="text-lg text-slate-900">{employee.tasks}</div>
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}