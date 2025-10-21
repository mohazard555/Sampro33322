import React, { useState, useEffect, useRef } from 'react';
import type { AppSettings, User, BackupData } from '../types';
import { CloseIcon, ExportIcon, ImportIcon } from './Icons';
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
  onImportData: (data: BackupData) => void;
}

type Tab = 'info' | 'users' | 'access' | 'data';

const ExportDataModal: React.FC<{ dataString: string; onClose: () => void }> = ({ dataString, onClose }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopy = () => {
    if (textAreaRef.current) {
        textAreaRef.current.select();
        navigator.clipboard.writeText(textAreaRef.current.value).then(() => {
            setCopySuccess('تم النسخ بنجاح!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('فشل النسخ.');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-serif text-white mb-4">تصدير بيانات التطبيق</h3>
        <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
          لجعل بياناتك الحالية (الأصناف، الإعدادات، إلخ) هي البيانات الافتراضية لجميع المستخدمين، انسخ هذا الكود واستبدل به محتويات ملف <code>masterData.ts</code> في مشروعك. ثم قم بإعادة نشر التطبيق.
        </p>
        <textarea
          ref={textAreaRef}
          readOnly
          value={dataString}
          className="w-full flex-grow bg-zinc-900 text-zinc-300 font-mono text-sm p-4 rounded-md border border-zinc-600 focus:ring-amber-500 focus:border-amber-500 resize-none"
        />
        <div className="mt-4 flex justify-end items-center gap-4">
            <span className="text-green-400 text-sm">{copySuccess}</span>
            <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
                نسخ الكود
            </button>
            <button onClick={onClose} className="bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg hover:bg-zinc-500">
                إغلاق
            </button>
        </div>
      </div>
    </div>
  );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ 
    settings, onClose, onSave, users, currentUser, onAddUser, onUpdateUser, onDeleteUser, onImportData
}) => {
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportDataString, setExportDataString] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentSettings(prev => ({
        ...prev,
        guestCredentials: {
            ...prev.guestCredentials,
            [name]: type === 'checkbox' ? checked : value,
        }
    }));
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };
  
  const handleExportForPublish = () => {
    const dataToExport = {
        items: JSON.parse(localStorage.getItem('samProItems') || '[]'),
        quickEntryData: JSON.parse(localStorage.getItem('samProQuickEntry') || '{}'),
        settings: JSON.parse(localStorage.getItem('samProSettings') || '{}'),
        companyLogo: JSON.parse(localStorage.getItem('samProLogo') || 'null'),
    };

    const fileContent = `import type { Item, UniqueData, AppSettings } from './types';

// To make your current data visible to all users,
// copy this code and replace the contents of the 'masterData.ts' file in your project.
// Then, deploy your project again.
export const masterData: {
  items: Item[];
  quickEntryData: UniqueData;
  settings: AppSettings;
  companyLogo: string | null;
} = ${JSON.stringify(dataToExport, null, 2)};
`;
    setExportDataString(fileContent);
    setIsExportModalVisible(true);
  };

  const handleExportToFile = () => {
    try {
        const dataToExport: BackupData = {
            items: JSON.parse(localStorage.getItem('samProItems') || '[]'),
            quickEntryData: JSON.parse(localStorage.getItem('samProQuickEntry') || '{}'),
            settings: JSON.parse(localStorage.getItem('samProSettings') || '{}'),
            companyLogo: JSON.parse(localStorage.getItem('samProLogo') || 'null'),
        };

        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        link.download = `sam-pro-backup-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export data", error);
        alert("حدث خطأ أثناء تصدير البيانات.");
    }
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                 throw new Error("File content is not a string.");
            }
            const data = JSON.parse(text);
            
            if (window.confirm("هل أنت متأكد من استيراد هذه البيانات؟ سيتم استبدال جميع البيانات الحالية.")) {
                onImportData(data as BackupData);
            }
        } catch (error) {
            console.error("Failed to import file", error);
            alert("فشل استيراد الملف. تأكد من أنه ملف JSON صالح تم تصديره من هذا التطبيق.");
        } finally {
            if (importFileRef.current) {
                importFileRef.current.value = "";
            }
        }
    };
    reader.onerror = () => {
        alert("فشل قراءة الملف.");
        if (importFileRef.current) {
            importFileRef.current.value = "";
        }
    };
    reader.readAsText(file);
  };


  const inputStyles = "mt-1 block w-full rounded-lg border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-colors duration-200 placeholder:text-zinc-400 px-4 py-2.5";
  const tabBaseStyles = "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors";
  const activeTabStyles = "bg-zinc-800 text-amber-400 border-b-2 border-amber-400";
  const inactiveTabStyles = "text-zinc-400 hover:bg-zinc-700/50";

  return (
    <>
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
                    <>
                        <button onClick={() => setActiveTab('users')} className={`${tabBaseStyles} ${activeTab === 'users' ? activeTabStyles : inactiveTabStyles}`}>
                            إدارة المستخدمين
                        </button>
                         <button onClick={() => setActiveTab('access')} className={`${tabBaseStyles} ${activeTab === 'access' ? activeTabStyles : inactiveTabStyles}`}>
                            صلاحيات الوصول
                        </button>
                        <button onClick={() => setActiveTab('data')} className={`${tabBaseStyles} ${activeTab === 'data' ? activeTabStyles : inactiveTabStyles}`}>
                            إدارة البيانات
                        </button>
                    </>
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

            {activeTab === 'access' && currentUser.permissions.canChangeSettings && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-400 mb-3">حساب الزائر</h3>
                    <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                        فعّل حساب زائر بصلاحيات عرض فقط. يمكن للزوار تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور المحددة أدناه.
                    </p>
                    <div className="space-y-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                        <div className="flex items-center justify-between">
                            <label htmlFor="guestEnabled" className="font-medium text-zinc-300 cursor-pointer">تفعيل حساب الزائر</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="guestEnabled"
                                    name="enabled"
                                    checked={currentSettings.guestCredentials.enabled}
                                    onChange={handleGuestChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>

                        {currentSettings.guestCredentials.enabled && (
                            <>
                                <div>
                                    <label htmlFor="guestUsername" className="block text-sm font-medium text-zinc-300">اسم مستخدم الزائر</label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="guestUsername"
                                        value={currentSettings.guestCredentials.username}
                                        onChange={handleGuestChange}
                                        className={inputStyles}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="guestPassword" className="block text-sm font-medium text-zinc-300">كلمة مرور الزائر</label>
                                    <input
                                        type="text"
                                        name="password"
                                        id="guestPassword"
                                        value={currentSettings.guestCredentials.password}
                                        onChange={handleGuestChange}
                                        className={inputStyles}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'data' && currentUser.permissions.canChangeSettings && (
                 <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-3">نشر البيانات للجميع</h3>
                        <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                            لتحديث البيانات الافتراضية التي يراها كل زائر جديد، قم بتصدير الكود، واستبدل به محتوى ملف <code>masterData.ts</code> في مشروعك، ثم أعد نشر التطبيق على Vercel.
                        </p>
                        <button 
                            onClick={handleExportForPublish} 
                            className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-500 transition-colors font-semibold"
                        >
                            تصدير بيانات التطبيق للنشر
                        </button>
                    </div>

                    <div className="my-6 border-t border-zinc-700"></div>

                    <div>
                        <h3 className="text-lg font-semibold text-amber-400 mb-3">النسخ الاحتياطي والاستعادة</h3>
                        <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                            يمكنك إنشاء نسخة احتياطية من جميع بياناتك الحالية في ملف واحد، أو استعادة البيانات من ملف نسخة احتياطية سابق. هذا الإجراء يؤثر فقط على بياناتك المحلية المحفوظة في هذا المتصفح.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleExportToFile} 
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-500 transition-colors font-semibold"
                            >
                                <ExportIcon />
                                تصدير إلى ملف
                            </button>
                            <button 
                                onClick={handleImportClick} 
                                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-500 transition-colors font-semibold"
                            >
                                <ImportIcon />
                                استيراد من ملف
                            </button>
                            <input
                                type="file"
                                ref={importFileRef}
                                onChange={handleFileImport}
                                className="hidden"
                                accept="application/json,.json"
                            />
                        </div>
                    </div>
                </div>
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
    {isExportModalVisible && <ExportDataModal dataString={exportDataString} onClose={() => setIsExportModalVisible(false)} />}
    </>
  );
};

export default SettingsModal;