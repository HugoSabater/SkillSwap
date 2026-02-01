'use client';

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateSwapStatus } from "./actions";

export function SwapActionButtons({ swapId }: { swapId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (status: 'accepted' | 'rejected') => {
        setIsLoading(true);
        try {
            await updateSwapStatus(swapId, status);
            toast.success(status === 'accepted' ? "Swap accepted!" : "Swap declined");
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleAction('rejected')}
                disabled={isLoading}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-red-400 transition-colors disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </button>
            <button
                onClick={() => handleAction('accepted')}
                disabled={isLoading}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
        </div>
    );
}
