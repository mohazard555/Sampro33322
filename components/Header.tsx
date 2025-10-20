import React, { useRef } from 'react';
import { CameraIcon, SettingsIcon, ListIcon, LogoutIcon, UserIcon } from './Icons';
import type { AppSettings, User } from '../types';

interface HeaderProps {
    companyLogo: string | null;
    onLogoUpload: (logoDataUrl: string) => void;
    settings: AppSettings;
    onOpenSettings: () => void;
    onOpenItemsSidebar: () => void;
    currentUser: User;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ companyLogo, onLogoUpload, settings, onOpenSettings, onOpenItemsSidebar, currentUser, onLogout }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Basic validation for file size (e.g., 1MB)
            if (file.size > 1 * 1024 * 1024) {
                alert('حجم الشعار كبير جدًا. الرجاء اختيار ملف أصغر من 1 ميغابايت.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                onLogoUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
  return (
    <header className="bg-zinc-900/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-zinc-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-white tracking-wider">
                {settings.companyName || 'SAM PRO'}
              </div>
              {companyLogo && (
                <img src={companyLogo} alt="Company Logo" className="h-12 w-auto max-w-[150px] object-contain"/>
              )}
              {currentUser.permissions.canChangeSettings && (
                <>
                   <button onClick={handleLogoClick} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition-colors p-1 rounded-md hover:bg-zinc-700">
                        <CameraIcon />
                        { companyLogo ? 'تغيير الشعار' : 'إضافة شعار' }
                   </button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                     accept="image/png, image/jpeg, image/webp, image/svg+xml"
                   />
                </>
              )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
                <UserIcon className="h-5 w-5 text-zinc-400"/>
                <span>{currentUser.username}</span>
            </div>
             <button onClick={onLogout} className="text-zinc-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-zinc-700" aria-label="تسجيل الخروج">
                <LogoutIcon />
            </button>
            <button onClick={onOpenItemsSidebar} className="text-zinc-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-zinc-700" aria-label="قائمة الأصناف">
                <ListIcon />
            </button>
             {currentUser.permissions.canChangeSettings && (
                <button onClick={onOpenSettings} className="text-zinc-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-zinc-700" aria-label="Settings">
                    <SettingsIcon />
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;