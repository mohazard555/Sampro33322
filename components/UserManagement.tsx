import React, { useState } from 'react';
import type { User, UserPermissions } from '../types';
import { PlusIcon, EditIcon, DeleteIcon, SaveIcon, CancelIcon, UserIcon } from './Icons';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const UserForm: React.FC<{
    user?: User | null;
    onSave: (user: Omit<User, 'id'> | User) => void;
    onCancel: () => void;
    existingUsernames: string[];
}> = ({ user, onSave, onCancel, existingUsernames }) => {
    const isEditMode = !!user;
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState<UserPermissions>(user?.permissions || {
        canAdd: false,
        canDelete: false,
        canChangeSettings: false
    });
    const [error, setError] = useState('');

    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setPermissions(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || (!password.trim() && !isEditMode)) {
            setError('اسم المستخدم وكلمة المرور مطلوبان.');
            return;
        }
        if (!isEditMode && existingUsernames.includes(username.trim())) {
            setError('اسم المستخدم هذا موجود بالفعل.');
            return;
        }

        const userData = {
            username: username.trim(),
            password: password.trim() || user!.password,
            permissions
        };
        
        onSave(isEditMode ? { ...userData, id: user!.id } : userData);
    };
    
    const inputStyles = "mt-1 block w-full rounded-lg border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-colors duration-200 placeholder:text-zinc-400 px-4 py-2.5";
    const checkboxStyles = "w-5 h-5 rounded bg-zinc-600 border-zinc-500 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800";


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onCancel}>
            <form 
                onSubmit={handleSubmit}
                className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-serif text-white">{isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h3>
                <div>
                    <label className="block text-sm font-medium text-zinc-300">اسم المستخدم</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={isEditMode} className={`${inputStyles} ${isEditMode ? 'bg-zinc-800 cursor-not-allowed' : ''}`} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-300">كلمة المرور</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isEditMode ? 'اتركه فارغاً لعدم التغيير' : ''} className={inputStyles} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">الصلاحيات</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="canAdd" checked={permissions.canAdd} onChange={handlePermissionChange} className={checkboxStyles} /><span>إضافة/تعديل الأصناف</span></label>
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="canDelete" checked={permissions.canDelete} onChange={handlePermissionChange} className={checkboxStyles} /><span>حذف الأصناف</span></label>
                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="canChangeSettings" checked={permissions.canChangeSettings} onChange={handlePermissionChange} className={checkboxStyles} /><span>تغيير الإعدادات وإدارة المستخدمين</span></label>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex justify-end gap-4 pt-4 border-t border-zinc-700">
                    <button type="button" onClick={onCancel} className="bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg hover:bg-zinc-500 transition-colors">إلغاء</button>
                    <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-500 transition-colors">حفظ</button>
                </div>
            </form>
        </div>
    );
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const handleSaveUser = (user: Omit<User, 'id'> | User) => {
        if ('id' in user) {
            onUpdateUser(user as User);
        } else {
            onAddUser(user);
        }
        setIsFormOpen(false);
        setEditingUser(null);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) {
            onDeleteUser(userId);
        }
    };
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold text-amber-400">قائمة المستخدمين</h3>
                 <button onClick={() => { setEditingUser(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-500 transition-colors text-sm">
                    <PlusIcon className="h-4 w-4" />
                    إضافة مستخدم
                </button>
            </div>
            
            <div className="bg-zinc-900/50 rounded-lg border border-zinc-700">
                <ul className="divide-y divide-zinc-700">
                    {users.map(user => (
                        <li key={user.id} className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <UserIcon className="h-5 w-5 text-zinc-400" />
                                <span className="font-medium text-zinc-200">{user.username} {user.id === currentUser.id && <span className="text-xs text-amber-400">(أنت)</span>}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => { setEditingUser(user); setIsFormOpen(true); }} className="text-zinc-400 hover:text-yellow-400"><EditIcon/></button>
                                {user.id !== currentUser.id && (
                                    <button onClick={() => handleDelete(user.id)} className="text-zinc-400 hover:text-red-500"><DeleteIcon/></button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isFormOpen && (
                <UserForm
                    user={editingUser}
                    onSave={handleSaveUser}
                    onCancel={() => setIsFormOpen(false)}
                    existingUsernames={users.map(u => u.username)}
                />
            )}
        </div>
    );
};

export default UserManagement;
