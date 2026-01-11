import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all ${isDangerous
                                ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-200'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
