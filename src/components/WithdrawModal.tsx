"use client";

import { useState } from "react";

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    onSubmit: (details: { amount: number; method: "mpesa" | "bank"; phone?: string; bank?: string; account?: string }) => void;
}

export default function WithdrawModal({ isOpen, onClose, availableBalance, onSubmit }: WithdrawModalProps) {
    const [method, setMethod] = useState<"mpesa" | "bank">("mpesa");
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("+254 712 345 678");
    const [account, setAccount] = useState("");
    const [bank, setBank] = useState("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount < 500 || numericAmount > availableBalance) return;

        setIsWithdrawing(true);
        onSubmit({
            amount: numericAmount,
            method,
            phone: method === 'mpesa' ? phone : undefined,
            bank: method === 'bank' ? bank : undefined,
            account: method === 'bank' ? account : undefined,
        });
        // Parent component will handle closing and resetting state after submission promise resolves
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[color:var(--color-text)] text-lg">Withdraw Funds</h3>
                    <button onClick={() => !isWithdrawing && onClose()} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors" disabled={isWithdrawing}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount to Withdraw</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" min="500" max={availableBalance} disabled={isWithdrawing} className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] font-bold focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all" />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500 font-medium">Balance: KES {availableBalance.toLocaleString()}</p>
                            {parseFloat(amount) < 500 && amount !== "" && (<p className="text-xs text-amber-600 font-bold">Min. withdrawal is KES 500</p>)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                            <button type="button" onClick={() => setMethod("mpesa")} disabled={isWithdrawing} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${method === "mpesa" ? "bg-white text-[color:var(--color-text)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> M-Pesa
                            </button>
                            <button type="button" onClick={() => setMethod("bank")} disabled={isWithdrawing} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${method === "bank" ? "bg-white text-[color:var(--color-text)] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> Bank Transfer
                            </button>
                        </div>
                        {method === "mpesa" ? (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">M-Pesa Number</label>
                                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isWithdrawing} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all font-mono text-sm tracking-wide" />
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bank Name</label>
                                    <input type="text" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. Equity Bank" disabled={isWithdrawing} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Number</label>
                                    <input type="text" value={account} onChange={(e) => setAccount(e.target.value)} disabled={isWithdrawing} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[color:var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all font-mono text-sm tracking-wide" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={isWithdrawing} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                        <button type="submit" disabled={isWithdrawing || parseFloat(amount) < 500 || (method === "mpesa" ? phone.length < 10 : (!bank || !account))} className="flex-[2] py-3 bg-[color:var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#1a553a] transition-all text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none">
                            {isWithdrawing ? "Processing..." : "Confirm Withdrawal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}