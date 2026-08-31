import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flat } from '../../types';
import { formatCurrency, toBengaliNumber } from '../../utils/formatters';
import {
  Home,
  Plus,
  Search,
  Filter,
  User,
  Zap,
  Droplet,
  Flame,
  Wrench,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const FlatsView: React.FC = () => {
  const { flats, tenants, addFlat, updateFlat, deleteFlat, setActiveTab, currentUser } = useApp();
  const isOwner = currentUser.role === 'owner';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);

  // Form State
  const [flatNumber, setFlatNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [size, setSize] = useState(1250);
  const [rent, setRent] = useState(22000);
  const [status, setStatus] = useState<'occupied' | 'vacant' | 'reserved'>('vacant');
  const [electricity, setElectricity] = useState(2500);
  const [water, setWater] = useState(600);
  const [gas, setGas] = useState(1080);
  const [serviceCharge, setServiceCharge] = useState(1500);
  const [other, setOther] = useState(300);

  const openAddModal = () => {
    setEditingFlat(null);
    setFlatNumber(`F-${floor}01`);
    setFloor(1);
    setSize(1250);
    setRent(22000);
    setStatus('vacant');
    setElectricity(2500);
    setWater(600);
    setGas(1080);
    setServiceCharge(1500);
    setOther(300);
    setIsModalOpen(true);
  };

  const openEditModal = (flat: Flat) => {
    setEditingFlat(flat);
    setFlatNumber(flat.flatNumber);
    setFloor(flat.floor);
    setSize(flat.size);
    setRent(flat.rent);
    setStatus(flat.status);
    setElectricity(flat.monthlyCharges.electricity);
    setWater(flat.monthlyCharges.water);
    setGas(flat.monthlyCharges.gas);
    setServiceCharge(flat.monthlyCharges.serviceCharge);
    setOther(flat.monthlyCharges.other);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim()) return;

    const payload = {
      flatNumber: flatNumber.trim(),
      floor: Number(floor),
      size: Number(size),
      rent: Number(rent),
      status,
      monthlyCharges: {
        electricity: Number(electricity),
        water: Number(water),
        gas: Number(gas),
        serviceCharge: Number(serviceCharge),
        other: Number(other),
      },
    };

    if (editingFlat) {
      updateFlat(editingFlat.id, payload);
    } else {
      addFlat(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে ফ্ল্যাট ${num} মুছে ফেলতে চান?`)) {
      deleteFlat(id);
    }
  };

  // Filtered flats
  const filteredFlats = flats.filter((f) => {
    const tenant = tenants.find((t) => t.id === f.tenantId);
    const matchesSearch =
      f.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant && tenant.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFloor = selectedFloor === 'all' || f.floor === Number(selectedFloor);
    const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
    return matchesSearch && matchesFloor && matchesStatus;
  });

  const occupiedCount = flats.filter((f) => f.status === 'occupied').length;
  const vacantCount = flats.filter((f) => f.status === 'vacant').length;
  const reservedCount = flats.filter((f) => f.status === 'reserved').length;

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <Home className="w-5 h-5 text-[#141414]" />
            <span>ফ্ল্যাট ব্যবস্থাপনা (Flats Management)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            মোট ৮০টি ফ্ল্যাট • নিচতলা থেকে ৮ম তলা পর্যন্ত আবাসিক ইউনিটসমূহ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-data font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ফ্ল্যাট যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#F4F3F0] p-3 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 uppercase">সর্বমোট ফ্ল্যাট</span>
          <div className="text-xl font-mono-data font-bold text-[#141414] mt-1">{toBengaliNumber(flats.length)} টি</div>
        </div>
        <div className="bg-[#E2EFE7] p-3 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#144A29] uppercase">ভাড়াকৃত (Occupied)</span>
          <div className="text-xl font-mono-data font-bold text-[#144A29] mt-1">{toBengaliNumber(occupiedCount)} টি</div>
        </div>
        <div className="bg-[#F8EFE0] p-3 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#5C4300] uppercase">খালি আছে (Vacant)</span>
          <div className="text-xl font-mono-data font-bold text-[#5C4300] mt-1">{toBengaliNumber(vacantCount)} টি</div>
        </div>
        <div className="bg-[#EAEAF8] p-3 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#141414] uppercase">সংরক্ষিত (Reserved)</span>
          <div className="text-xl font-mono-data font-bold text-[#141414] mt-1">{toBengaliNumber(reservedCount)} টি</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ফ্ল্যাট নং বা ভাড়াটিয়ার নাম দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1 text-xs font-mono-data bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-mono-data">
          {/* Floor filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#141414]/60 font-bold hidden md:inline">তলা:</span>
            <select
              aria-label="তলা ফিল্টার"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] text-[#141414] font-medium outline-none cursor-pointer"
            >
              <option value="all">সব তলা (Floor 1-8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((fl) => (
                <option key={fl} value={fl}>
                  {fl}ম তলা (Floor {fl})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#141414]/60 font-bold hidden md:inline">অবস্থা:</span>
            <select
              aria-label="অবস্থা ফিল্টার"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] text-[#141414] font-medium outline-none cursor-pointer"
            >
              <option value="all">সব অবস্থা</option>
              <option value="occupied">ভাড়াকৃত (Occupied)</option>
              <option value="vacant">খালি (Vacant)</option>
              <option value="reserved">সংরক্ষিত (Reserved)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flats Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredFlats.map((flat) => {
          const tenant = tenants.find((t) => t.id === flat.tenantId);
          const isOccupied = flat.status === 'occupied';
          const isVacant = flat.status === 'vacant';

          const totalCharges =
            flat.monthlyCharges.electricity +
            flat.monthlyCharges.water +
            flat.monthlyCharges.gas +
            flat.monthlyCharges.serviceCharge +
            flat.monthlyCharges.other;

          return (
            <div
              key={flat.id}
              className="bg-[#F4F3F0] border border-[#141414] hover:bg-[#EBEAE6] transition-colors p-3.5 flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono-data font-bold text-[#141414] bg-[#DDDCD7] px-2 py-0.5 border border-[#141414]/30">
                      {flat.flatNumber}
                    </span>
                    <span className="text-xs font-mono-data text-[#141414]/60 font-medium">{flat.floor}ম তলা</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono-data font-bold px-1.5 py-0.5 border ${
                      isOccupied
                        ? 'bg-[#D2E3D8] text-[#144A29] border-[#144A29]/30'
                        : isVacant
                        ? 'bg-[#F8EFE0] text-[#5C4300] border-[#5C4300]/30'
                        : 'bg-[#DDDDF5] text-[#141414] border-[#141414]/30'
                    }`}
                  >
                    {isOccupied ? 'Occupied' : isVacant ? 'Vacant' : 'Reserved'}
                  </span>
                </div>

                {/* Tenant details if occupied */}
                <div className="mt-2.5 min-h-[44px] bg-[#EBEAE6] p-2 border border-[#141414]/15">
                  {tenant ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#141414]">
                        <User className="w-3.5 h-3.5 text-[#141414]" />
                        <span className="truncate">{tenant.name}</span>
                      </div>
                      <div className="text-[11px] font-mono-data text-[#141414]/70 mt-0.5">{tenant.phone}</div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono-data text-[#141414]/50 italic flex items-center justify-center h-full">
                      কোন ভাড়াটিয়া নেই (খালি)
                    </div>
                  )}
                </div>

                {/* Pricing info */}
                <div className="mt-2.5 space-y-1 text-xs font-mono-data">
                  <div className="flex items-center justify-between text-[#141414]/80 font-medium">
                    <span>মূল ভাড়া:</span>
                    <span className="text-[#141414] font-bold">{formatCurrency(flat.rent)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#141414]/60 text-[11px]">
                    <span>ইউটিলিটি:</span>
                    <span>+{formatCurrency(totalCharges)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#141414] font-bold text-xs pt-1 border-t border-[#141414]/20">
                    <span>মোট বিল:</span>
                    <span className="text-[#144A29]">{formatCurrency(flat.rent + totalCharges)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-[#141414]/20 flex items-center justify-between gap-1 font-mono-data">
                <button
                  onClick={() => openEditModal(flat)}
                  className="flex-1 py-1 px-2 text-[11px] font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414]/30 text-center transition-colors cursor-pointer"
                >
                  সম্পাদনা
                </button>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(flat.id, flat.flatNumber)}
                    className="p-1 text-[#801414] hover:bg-[#FCE8E8] border border-transparent hover:border-[#801414]/30 transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Flat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#F4F3F0] max-w-lg w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20">
              <h3 className="text-base font-serif-heading font-bold text-[#141414] flex items-center gap-2">
                <Home className="w-5 h-5 text-[#141414]" />
                <span>{editingFlat ? `ফ্ল্যাট ${editingFlat.flatNumber} সম্পাদনা` : 'নতুন ফ্ল্যাট যোগ করুন'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#141414] hover:bg-[#DDDCD7] p-1 border border-transparent hover:border-[#141414]/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs font-mono-data">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">ফ্ল্যাট নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    placeholder="e.g. F-101"
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">তলা (Floor) *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">আকার (Sq Ft)</label>
                  <input
                    type="number"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">মাসিক মূল ভাড়া (৳) *</label>
                  <input
                    type="number"
                    required
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#144A29] outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">অবস্থা (Status)</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414] cursor-pointer"
                  >
                    <option value="occupied">ভাড়াকৃত (Occupied)</option>
                    <option value="vacant">খালি (Vacant)</option>
                    <option value="reserved">সংরক্ষিত (Reserved)</option>
                  </select>
                </div>
              </div>

              {/* Utility Charges Breakdown Section */}
              <div className="pt-2.5 border-t border-[#141414]/20">
                <h4 className="font-bold text-[#141414] mb-2 uppercase text-[11px]">ডিফল্ট মাসিক চার্জ ও ইউটিলিটি (৳)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-[#141414]/70 mb-1">বিদ্যুৎ বিল (Electricity)</label>
                    <input
                      type="number"
                      value={electricity}
                      onChange={(e) => setElectricity(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141414]/70 mb-1">পানি বিল (Water)</label>
                    <input
                      type="number"
                      value={water}
                      onChange={(e) => setWater(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141414]/70 mb-1">গ্যাস বিল (Gas)</label>
                    <input
                      type="number"
                      value={gas}
                      onChange={(e) => setGas(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141414]/70 mb-1">সার্ভিস চার্জ (Service)</label>
                    <input
                      type="number"
                      value={serviceCharge}
                      onChange={(e) => setServiceCharge(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141414]/70 mb-1">অন্যান্য চার্জ (Other)</label>
                    <input
                      type="number"
                      value={other}
                      onChange={(e) => setOther(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#141414]/20 flex items-center justify-end gap-2 font-mono-data">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414]/40 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] font-bold cursor-pointer"
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
