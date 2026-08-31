import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppUser, UserRole } from '../../types';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  X,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, currentUser, switchUser, addUser, updateUser, deleteUser } = useApp();
  const isOwner = currentUser.role === 'owner';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('01711000000');
    setRole('manager');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (u: AppUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        status,
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        status,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (u: AppUser) => {
    if (u.id === currentUser.id) {
      alert('আপনি বর্তমান সক্রিয় ব্যবহারকারী একাউন্ট মুছে ফেলতে পারবেন না।');
      return;
    }
    if (confirm(`আপনি কি নিশ্চিতভাবে ইউজার "${u.name}" মুছে ফেলতে চান?`)) {
      deleteUser(u.id);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#141414]" />
            <span>ব্যবহারকারী ও ম্যানেজার নিয়ন্ত্রণ (User &amp; Role Management)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            মালিক (Owner) এবং ম্যানেজারদের (Manager) একাউন্ট তৈরি ও অ্যাক্সেস পারমিশন
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono-data font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ম্যানেজার তৈরি করুন</span>
          </button>
        )}
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono-data">
        <div className="bg-[#F4F3F0] p-3.5 border border-[#141414]">
          <div className="flex items-center gap-2 text-[#141414] font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-[#141414]" />
            <span>১. Owner (মালিক) - পূর্ণ নিয়ন্ত্রণ</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-[#141414]/80 list-disc list-inside">
            <li>সকল তথ্য ও আর্থিক রিপোর্ট দেখতে ও সম্পাদনা করতে পারবেন</li>
            <li>নতুন Manager তৈরি, নিষ্ক্রিয় বা নিয়ন্ত্রণ করতে পারবেন</li>
            <li>ক্যাশ বুক, লাভ-ক্ষতি ও বাৎসরিক রিপোর্ট দেখতে পারবেন</li>
            <li>ম্যানেজার কী কী পরিবর্তন করেছে তার Activity Log পর্যবেক্ষণ করতে পারবেন</li>
          </ul>
        </div>

        <div className="bg-[#F4F3F0] p-3.5 border border-[#141414]">
          <div className="flex items-center gap-2 text-[#141414] font-bold text-xs">
            <UserCheck className="w-4 h-4 text-[#141414]" />
            <span>২. Manager (ম্যানেজার) - দৈনিক পরিচালনা</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-[#141414]/80 list-disc list-inside">
            <li>ভাড়াটিয়া যোগ ও আপডেট করতে পারবেন</li>
            <li>মাসিক বিল তৈরি ও ভাড়া পেমেন্ট এন্ট্রি করতে পারবেন</li>
            <li>দৈনিক ক্যাশ বুক পরিচালনা ও খরচ এন্ট্রি করতে পারবেন</li>
            <li>মালিকের মূল সিস্টেম সেটিংসে সীমাবদ্ধ অ্যাক্সেস পাবেন</li>
          </ul>
        </div>
      </div>

      {/* Switch Demo Role Helper */}
      <div className="bg-[#EBEAE6] p-3 border border-[#141414] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-data">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#141414]" />
          <span className="text-xs font-bold text-[#141414]">
            রোল টেস্টিং মোড: বর্তমানে আপনি <strong>{currentUser.name} ({currentUser.role.toUpperCase()})</strong> হিসেবে লগইন আছেন।
          </span>
        </div>

        <div className="flex items-center gap-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer ${
                currentUser.id === u.id
                  ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                  : 'bg-[#F4F3F0] text-[#141414] border-[#141414]/40 hover:bg-[#DDDCD7]'
              }`}
            >
              লগইন: {u.role === 'owner' ? 'মালিক (Owner)' : 'ম্যানেজার'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden font-mono-data">
        <table className="w-full text-left text-xs tech-grid-table">
          <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase">
            <tr>
              <th className="px-3.5 py-2.5">ব্যবহারকারীর নাম</th>
              <th className="px-3.5 py-2.5">ইমেইল ও ফোন</th>
              <th className="px-3.5 py-2.5">রোল (Role)</th>
              <th className="px-3.5 py-2.5">অবস্থা (Status)</th>
              <th className="px-3.5 py-2.5">তৈরির তারিখ</th>
              <th className="px-3.5 py-2.5 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
            {users.map((u) => {
              const isOwnerRole = u.role === 'owner';

              return (
                <tr key={u.id} className="hover:bg-[#EBEAE6]">
                  <td className="px-3.5 py-2.5">
                    <div className="font-bold text-[#141414] flex items-center gap-2">
                      <div
                        className={`w-6 h-6 border border-[#141414] flex items-center justify-center font-bold text-xs ${
                          isOwnerRole ? 'bg-[#141414] text-white' : 'bg-[#DDDCD7] text-[#141414]'
                        }`}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                      {currentUser.id === u.id && (
                        <span className="text-[10px] bg-[#E0F2E9] border border-[#141414] text-[#14532D] px-1.5 py-0.2 font-bold">
                          Current
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3.5 py-2.5 text-[#141414]/80">
                    <div>{u.email}</div>
                    <div className="text-[11px] text-[#141414]/60">{u.phone || '---'}</div>
                  </td>

                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.2 border text-[10px] font-bold ${
                        isOwnerRole ? 'bg-[#141414] text-white border-[#141414]' : 'bg-[#DDDCD7] text-[#141414] border-[#141414]/30'
                      }`}
                    >
                      {isOwnerRole ? 'Owner (মালিক)' : 'Manager (ম্যানেজার)'}
                    </span>
                  </td>

                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.2 border text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-[#E0F2E9] border-[#141414] text-[#14532D]'
                          : 'bg-[#FCE8E8] border-[#141414] text-[#801414]'
                      }`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-3.5 py-2.5 text-[#141414]/70">{u.createdAt}</td>

                  <td className="px-3.5 py-2.5 text-right">
                    {isOwner && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1 text-[#141414] hover:bg-[#EBEAE6] border border-transparent hover:border-[#141414]/40 cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1 text-[#801414] hover:bg-[#FCE8E8] border border-transparent hover:border-[#801414]/40 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-mono-data">
          <div className="bg-[#F4F3F0] max-w-md w-full p-5 border border-[#141414] my-8 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20">
              <h3 className="text-sm font-serif-heading font-bold text-[#141414]">
                {editingUser ? 'ব্যবহারকারী তথ্য আপডেট' : 'নতুন ম্যানেজার অ্যাকাউন্ট তৈরি'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#141414]/60 hover:text-[#141414] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-3.5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#141414] mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. শোভা (SHOVA)"
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#141414] mb-1">ইমেইল ঠিকানা *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@noortowerbd.com"
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-medium text-[#141414] outline-none focus:border-[#141414]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#141414] mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01711000000"
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-medium text-[#141414] outline-none focus:border-[#141414]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">ব্যবহারকারীর রোল</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none cursor-pointer"
                  >
                    <option value="manager">ম্যানেজার (Manager)</option>
                    <option value="owner">মালিক (Owner)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">অবস্থা (Status)</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none cursor-pointer"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#141414]/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-[#141414] hover:bg-[#DDDCD7] font-bold border border-[#141414]/40 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] font-bold border border-[#141414] cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
