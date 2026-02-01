'use client';

import { CheckCircle2, Check } from "lucide-react";
import { completeSwap } from "./actions";
import { toast } from "sonner";
import { useState } from "react";

interface CompleteSwapButtonProps {
    swapId: string;
    initialStatus: string;
}

export default function CompleteSwapButton({ swapId, initialStatus }: CompleteSwapButtonProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            const result = await completeSwap(swapId);
            if (result.success) {
                setStatus('completed');
                toast.success("Swap marked as completed! Stats updated.");
            } else {
                toast.error(result.message || "Failed to complete swap");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'completed') {
        return (
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Completed</span>
            </div>
        );
    }

    if (status === 'accepted') {
        return (
            <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#137fec] hover:bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
                {isLoading ? (
                    <span className="animate-pulse">Updating...</span>
                ) : (
                    <>
                        <Check className="w-4 h-4" />
                        Mark Complete
                    </>
                )}
            </button>
        );
    }

    // Pending or canceled - don't show anything (or appropriate status)
    return null;
}
