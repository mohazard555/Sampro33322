import React, { useState, useEffect } from 'react';
import type { AppSettings, User } from '../types';
import { CloseIcon } from './Icons';
import UserManagement from './UserManagement';

interface SettingsModalProps {
  settings: AppSettings;
  onClose: () => void;
  onSave: (newSettings: AppSettings) => void;
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

type Tab = 'info' | 'users';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    settings, onClose, onSave, users, currentUser, onAddUser, onUpdateUser, onDeleteUser 
}) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<Tab>('info');

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };
  
  const inputStyles = "mt-1 block w-full rounded-lg border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-colors duration-200 placeholder:text-zinc-400 px-4 py-2.5";
  const tabBaseStyles = "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors";
  const activeTabStyles = "bg-zinc-800 text-amber-400 border-b-2 border-amber-400";
  const inactiveTabStyles = "text-zinc-400 hover:bg-zinc-700/50";

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
        onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-0 border-b border-zinc-700 flex justify-between items-center sticky top-0 bg-zinc-900/80 backdrop-blur-sm z-10">
            <div className="flex items-end gap-4">
                <button onClick={() => setActiveTab('info')} className={`${tabBaseStyles} ${activeTab === 'info' ? activeTabStyles : inactiveTabStyles}`}>
                    معلومات الشركة
                </button>
                {currentUser.permissions.canChangeSettings && (
                     <button onClick={() => setActiveTab('users')} className={`${tabBaseStyles} ${activeTab === 'users' ? activeTabStyles : inactiveTabStyles}`}>
                        إدارة المستخدمين
                    </button>
                )}
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                <CloseIcon />
            </button>
        </div>

        <div className="p-6 md:p-8 space-y-8 flex-grow bg-zinc-800">
            {activeTab === 'info' && (
                <div>
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">معلومات الشركة</h3>
                  <div className="space-y-4">
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-zinc-300">اسم الشركة</label>
                        <input type="text" name="companyName" id="companyName" value={currentSettings.companyName} onChange={handleChange} className={inputStyles}/>
                      </div>
                      <div>
                        <label htmlFor="companyInfo" className="block text-sm font-medium text-zinc-300">معلومات الاتصال/وصف</label>
                        <textarea name="companyInfo" id="companyInfo" value={currentSettings.companyInfo} onChange={handleChange} rows={4} className={inputStyles}></textarea>
                      </div>
                  </div>
                </div>
            )}
            
            {activeTab === 'users' && currentUser.permissions.canChangeSettings && (
                <UserManagement 
                    users={users}
                    currentUser={currentUser}
                    onAddUser={onAddUser}
                    onUpdateUser={onUpdateUser}
                    onDeleteUser={onDeleteUser}
                />
            )}
        </div>

        <div className="p-6 bg-zinc-900/50 border-t border-zinc-700 flex justify-end gap-4 sticky bottom-0">
            <button type="button" onClick={onClose} className="bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg hover:bg-zinc-500 transition-colors">
                إلغاء
            </button>
            <button type="button" onClick={handleSave} className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-500 transition-colors shadow-md shadow-amber-900/50">
                حفظ الإعدادات
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;