import { UserPlus, UserMinus } from 'lucide-react';

export function EmployeeChanges({ changes }: { changes: any }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg text-slate-900 mb-4">Employee Changes</h3>
            <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <UserPlus className="w-5 h-5 text-emerald-600" />
                        <div className="text-2xl text-slate-900">{changes.joined.count}</div>
                        <span className="text-sm text-emerald-700">Joined</span>
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <UserMinus className="w-5 h-5 text-slate-600" />
                        <div className="text-2xl text-slate-900">{changes.resigned.count}</div>
                        <span className="text-sm text-slate-700">Resigned</span>
                    </div>
                </div>
            </div>
        </div>
    );
}