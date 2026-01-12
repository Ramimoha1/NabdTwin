import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar.tsx";
import { useDispatch, useSelector } from "react-redux";
import { AdvisoryPanel } from "../components/AdvisoryPanel.tsx";
import type { RootState, AppDispatch } from "../store/store.ts";
import { setAdvisoryOpen } from "../store/advisory/advisorySlice.ts";
import { askAdvisoryAI } from "../store/advisory/advisoryThunks.ts";

function MainLayout() {
    const dispatch = useDispatch<AppDispatch>();

    // Get Advisory state from Redux (messages persist even when modal closes)
    const { isOpen, messages, isLoading } = useSelector((state: RootState) => 
        state.advisory || { isOpen: false, messages: [], isLoading: false }
    );

    // Handler to dispatch the AI thunk
    const handleAskAI = (question?: string) => {
        dispatch(askAdvisoryAI(question));
    };

    return (
        <div className="flex h-screen w-full">
            {/* Pass the Open Trigger to Sidebar */}
            <Sidebar onOpenAI={() => dispatch(setAdvisoryOpen(true))} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="container mx-auto px-0 py-0 h-full">
                        <Outlet />
                    </div>
                </main>

                {/* The AI Panel - State persists via Redux */}
                <AdvisoryPanel
                    open={isOpen}
                    onOpenChange={(val) => dispatch(setAdvisoryOpen(val))}
                    chatHistory={messages}
                    isLoading={isLoading}
                    onAskAI={handleAskAI}
                />
            </div>
        </div>
    );
}

export default MainLayout;