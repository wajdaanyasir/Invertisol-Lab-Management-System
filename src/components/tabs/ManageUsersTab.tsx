import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmModal } from '../ConfirmModal';
import { ALL_TABS } from '../Sidebar';
import { Users, PlusCircle, Shield, Trash2, KeyRound, CheckSquare, Square } from 'lucide-react';
import { UserRole } from '../../types';

export const ManageUsersTab: React.FC = () => {
  const { users, addUser, updateUserTabs, deleteUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'add' | 'delete' | 'permissions'>('add');
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Add User State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('normal');
  const [selectedTabs, setSelectedTabs] = useState<string[]>([
    'add_job',
    'update_status',
    'generate_bill',
    'confirm_payment',
    'job_inquiry',
    'manage_inventory',
    'cash_register',
    'add_expense',
  ]);

  // Selected User for Permissions
  const [selectedUserId, setSelectedUserId] = useState<string>(users[1]?.id || users[0]?.id || '');

  const toggleTabPermission = (tabId: string) => {
    if (selectedTabs.includes(tabId)) {
      setSelectedTabs((prev) => prev.filter((id) => id !== tabId));
    } else {
      setSelectedTabs((prev) => [...prev, tabId]);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Username and Password are required.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    addUser(username, role, selectedTabs);
    alert(`User "${username}" created successfully!`);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Manage System Users & Tab Authorization</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Super user control panel to add desk operators, technicians, set passwords, and grant specific tab access.
          </p>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveSubTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'add' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Add New User
          </button>
          <button
            onClick={() => setActiveSubTab('permissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'permissions' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Edit User Tab Permissions
          </button>
          <button
            onClick={() => setActiveSubTab('delete')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'delete' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Delete User
          </button>
        </div>

        {/* SUBTAB 1: ADD USER */}
        {activeSubTab === 'add' && (
          <form onSubmit={handleAddUser} className="space-y-6 max-w-xl text-xs">
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">User Full Name / Username *</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Lab Tech"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                >
                  <option value="normal">Normal User (Desk / Tech)</option>
                  <option value="super">Super User (Full Access Admin)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Set Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Select Authorized Tabs Checklist (p.11) */}
              {role === 'normal' && (
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                  <label className="font-bold text-amber-300 uppercase tracking-wider block">
                    Select Authorized Navigation Tabs for User
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {ALL_TABS.filter((t) => !t.superOnly).map((t) => {
                      const isChecked = selectedTabs.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => toggleTabPermission(t.id)}
                          className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-700 cursor-pointer hover:border-amber-500"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-slate-200">{t.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg"
              >
                Create User Account
              </button>
            </div>
          </form>
        )}

        {/* SUBTAB 2: EDIT PERMISSIONS */}
        {activeSubTab === 'permissions' && (
          <div className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Select User to Modify</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
              <p className="font-bold text-white mb-2">Authorized Tabs List:</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_TABS.filter((t) => !t.superOnly).map((t) => {
                  const targetUser = users.find((u) => u.id === selectedUserId);
                  const isAuth = targetUser ? targetUser.authorizedTabs.includes(t.id) : false;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (!targetUser) return;
                        const newTabs = isAuth
                          ? targetUser.authorizedTabs.filter((id) => id !== t.id)
                          : [...targetUser.authorizedTabs, t.id];
                        updateUserTabs(targetUser.id, newTabs);
                      }}
                      className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                        isAuth ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {isAuth ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                      <span>{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: DELETE USER */}
        {activeSubTab === 'delete' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider">Remove User from System</h3>
            <div className="divide-y divide-slate-800 bg-slate-800/50 rounded-xl p-3 border border-slate-700">
              {users.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{u.username}</p>
                    <p className="text-slate-400 text-[11px] capitalize">{u.role} User</p>
                  </div>
                  {u.role !== 'super' && (
                    <button
                      onClick={() => setUserToDelete({ id: u.id, name: u.username })}
                      className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded hover:bg-rose-500/30 font-bold cursor-pointer"
                    >
                      Delete User
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete Staff Account"
        message={userToDelete ? `Are you sure you want to remove staff account "${userToDelete.name}"? They will no longer be able to log in.` : ''}
        confirmLabel="Delete Account"
        onConfirm={() => {
          if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
