import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployeePerformance } from '../services/API/insightsService';
import { X } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function EmployeeDetailsModal({ employee, onClose }: { employee: any, onClose: () => void }) {
    const { data: performanceData = [], isLoading: isLoadingPerformance } = useQuery({
        queryKey: ['employeePerformance', employee.id],
        queryFn: () => fetchEmployeePerformance(employee.id),
        enabled: !!employee.id
    });

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                            {employee.avatar}
                        </div>
                        <div>
                            <h3 className="text-lg text-slate-900">{employee.name}</h3>
                            <p className="text-sm text-slate-500">{employee.branch} Branch • Score: {employee.score}%</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-sm text-blue-600">Total Tasks</div>
                            <div className="text-2xl text-blue-900 mt-1">{employee.tasks}</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-sm text-green-600">Performance Score</div>
                            <div className="text-2xl text-green-900 mt-1">{employee.score}%</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="text-sm text-purple-600">Branch</div>
                            <div className="text-2xl text-purple-900 mt-1">{employee.branch}</div>
                        </div>
                    </div>

                    {isLoadingPerformance ? (
                        <div className="text-center py-8 text-slate-500">Loading performance data...</div>
                    ) : performanceData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[
                                { title: 'Task Completion Trend', dataKey: 'completion', color: '#3b82f6' },
                                { title: 'Utilization Rate', dataKey: 'utilization', color: '#10b981' },
                                { title: 'Late Tasks', dataKey: 'lateTasks', color: '#ef4444' },
                                { title: 'Tasks In Progress', dataKey: 'inProgress', color: '#f59e0b' }
                            ].map(chart => (
                                <div key={chart.title} className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="text-sm text-slate-900 mb-4">{chart.title}</h4>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <LineChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '10px' }} interval={6} />
                                            <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} width={35} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                                            <Line type="monotone" dataKey={chart.dataKey} stroke={chart.color} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-gray-200 rounded-lg p-6 text-center">
                            <p className="text-slate-600">No performance data available for this employee.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}