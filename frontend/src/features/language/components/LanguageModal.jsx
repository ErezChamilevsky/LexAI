import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../../services/api';
import { LANGUAGES } from '../constants';

import ConfirmationModal from '../../../components/ConfirmationModal';

const LanguageModal = ({ user, refreshUser, isOpen, onClose, currentLang }) => {
    // Default to 'add' if user has no languages, otherwise 'select'
    const [modalMode, setModalMode] = useState(user?.languages?.length > 0 ? 'select' : 'add');
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [langToDelete, setLangToDelete] = useState(null);

    if (!isOpen) return null;

    const userLanguages = user?.languages?.map(ul => LANGUAGES.find(l => l.code === ul.language_code)).filter(Boolean) || [];

    const handleAddLanguage = async (langCode) => {
        try {
            await api.post(`/users/${user._id}/languages`, {
                language_code: langCode,
                overall_level: 'A1',
                skills: { reading: 'A1', writing: 'A1', speaking: 'A1', listening: 'A1' }
            });

            await refreshUser();
            onClose(); // Close on successful add
        } catch (error) {
            console.error("Failed to add language:", error);
            const msg = error.response?.data?.message || error.message;
            if (msg && msg.includes("Limit reached")) {
                setShowPremiumModal(true);
            } else {
                alert("Failed to add language: " + msg);
            }
        }
    };

    const handleDeleteLanguage = (langCode) => {
        setLangToDelete(langCode);
    };

    const confirmDeleteLanguage = async () => {
        if (!langToDelete) return;
        try {
            await api.delete(`/users/${user._id}/languages/${langToDelete}`);
            await refreshUser();
            // Do NOT close, keep open as requested
        } catch (error) {
            console.error("Failed to delete language:", error);
            alert("Failed to delete language.");
        } finally {
            setLangToDelete(null);
        }
    };

    const handleLanguageSelect = async (langCode) => {
        // If it's already active, just close
        if (currentLang?.code === langCode) {
            onClose();
            return;
        }

        try {
            await api.patch(`/users/${user._id}/languages/${langCode}/active`);
            await refreshUser();
            onClose();
        } catch (error) {
            console.error("Failed to set active language", error);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* Main Modal */}
            {!showPremiumModal && (
                <div
                    className="bg-white/90 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">
                            {modalMode === 'select' ? 'Select Language' : 'Add New Language'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>

                    {/* Mode: SELECT */}
                    {modalMode === 'select' && (
                        <>
                            <div className="grid grid-cols-1 gap-3 mb-6">
                                {userLanguages.length === 0 ? (
                                    <p className="text-slate-500 italic text-center py-4">You haven't added any languages yet.</p>
                                ) : (
                                    userLanguages.map(lang => (
                                        <div
                                            key={lang.code}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                            className={clsx("flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer group relative",
                                                (currentLang?.code === lang.code)
                                                    ? "bg-pink-50 border-pink-200 ring-1 ring-pink-200"
                                                    : "bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200 shadow-sm hover:shadow-md"
                                            )}
                                        >
                                            <span className="text-4xl">{lang.flag}</span>
                                            <div className="flex-1">
                                                <span className="text-lg font-bold text-slate-800 block">{lang.name}</span>
                                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Level: {user.languages.find(ul => ul.language_code === lang.code)?.overall_level || 'A1'}</span>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteLanguage(lang.code);
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Language"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            {currentLang?.code === lang.code && <div className="text-pink-500 font-bold bg-pink-100 px-3 py-1 rounded-full text-xs">Active</div>}
                                        </div>
                                    ))
                                )}
                            </div>
                            <button
                                onClick={() => setModalMode('add')}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 transition-all flex items-center justify-center gap-2 font-bold hover:shadow-sm"
                            >
                                <Plus size={20} /> Add New Language
                            </button>
                        </>
                    )}

                    {/* Mode: ADD */}
                    {modalMode === 'add' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {LANGUAGES.filter(l => !user?.languages?.some(ul => ul.language_code === l.code)).map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleAddLanguage(lang.code)}
                                        className="flex items-center gap-3 p-4 rounded-2xl border bg-white/50 border-transparent hover:bg-white hover:border-slate-200 shadow-sm hover:scale-[1.02] transition-all text-left"
                                    >
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className="font-semibold text-slate-700">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setModalMode('select')}
                                className="w-full py-3 text-slate-400 hover:text-slate-600 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Premium Modal (Nested or separate?) */}
            {showPremiumModal && (
                <div
                    className="bg-white/90 backdrop-blur-xl border border-pink-200 p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg text-white">
                        <Plus size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Unlock More Languages</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        You've reached the limit for free accounts. Upgrade to Premium to learn unlimited languages!
                    </p>
                    <button
                        onClick={() => { setShowPremiumModal(false); /* Trigger Premium */ }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all mb-3"
                    >
                        Get Premium
                    </button>
                    <button
                        onClick={() => setShowPremiumModal(false)}
                        className="text-slate-400 font-medium hover:text-slate-600 text-sm"
                    >
                        Maybe Later
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!langToDelete}
                onClose={() => setLangToDelete(null)}
                onConfirm={confirmDeleteLanguage}
                title="Delete Language"
                message="Are you sure you want to delete this language? All progress for this language will be permanently lost."
                confirmText="Delete"
                isDangerous={true}
            />
        </div>
    );
};

export default LanguageModal;
