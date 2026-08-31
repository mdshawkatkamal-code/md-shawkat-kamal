import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shop } from '../../types';
import { formatCurrency, toBengaliNumber } from '../../utils/formatters';
import {
  Store,
  Plus,
  Search,
  User,
  Briefcase,
  Edit2,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

export const ShopsView: React.FC = () => {
  const { shops, tenants, addShop, updateShop, deleteShop, currentUser } = useApp();
  const isOwner = currentUser.role === 'owner';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  // Form State
  const [shopNumber, setShopNumber] = useState('');
  const [floor, setFloor] = useState(0);
  const [size, setSize] = useState(450);
  const [rent, setRent] = useState(35000);
  const [businessName, setBusinessName] = useState('');
  const [status, setStatus] = useState<'occupied' | 'vacant' | 'reserved'>('vacant');
  const [electricity, setElectricity] = useState(3500);
  const [water, setWater] = useState(500);
  const [gas, setGas] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(2000);
  const [other, setOther] = useState(500);

  const openAddModal = () => {
    setEditingShop(null);
    setShopNumber(`S-${shops.length + 1 < 10 ? '0' + (shops.length + 1) : shops.length + 1}`);
    setFloor(0);
    setSize(450);
    setRent(35000);
    setBusinessName('');
    setStatus('vacant');
    setElectricity(3500);
    setWater(500);
    setGas(0);
    setServiceCharge(2000);
    setOther(500);
    setIsModalOpen(true);
  };

  const openEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setShopNumber(shop.shopNumber);
    setFloor(shop.floor);
    setSize(shop.size);
    setRent(shop.rent);
    setBusinessName(shop.businessName || '');
    setStatus(shop.status);
    setElectricity(shop.monthlyCharges.electricity);
    setWater(shop.monthlyCharges.water);
    setGas(shop.monthlyCharges.gas);
    setServiceCharge(shop.monthlyCharges.serviceCharge);
    setOther(shop.monthlyCharges.other);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopNumber.trim()) return;

    const payload = {
      shopNumber: shopNumber.trim(),
      floor: Number(floor),
      size: Number(size),
      rent: Number(rent),
      businessName: businessName.trim() || undefined,
      status,
      monthlyCharges: {
        electricity: Number(electricity),
        water: Number(water),
        gas: Number(gas),
        serviceCharge: Number(serviceCharge),
        other: Number(other),
      },
    };

    if (editingShop) {
      updateShop(editingShop.id, payload);
    } else {
      addShop(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে দোকান ${num} মুছে ফেলতে চান?`)) {
      deleteShop(id);
    }
  };

  // Filtered shops
  const filteredShops = shops.filter((s) => {
    const tenant = tenants.find((t) => t.id === s.tenantId);
    const matchesSearch =
      s.shopNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.businessName && s.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tenant && tenant.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFloor = selectedFloor === 'all' || s.floor === Number(selectedFloor);
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesFloor && matchesStatus;
  });

  const occupiedCount = shops.filter((s) => s.status === 'occupied').length;
  const vacantCount = shops.filter((s) => s.status === 'vacant').length;

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#141414]" />
            <span>দোকান ও বাণিজ্যিক স্পেস (Shops Management)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            মোট ২০টি বাণিজ্যিক দোকান ও শোরুম • গ্রাউন্ড ফ্লোর ও ১ম তলা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-data font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন দোকান যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-[#F4F3F0] p-3 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#141414]/70 uppercase">মোট বাণিজ্যিক দোকান</span>
          <div className="text-xl font-mono-data font-bold text-[#141414] mt-1">{toBengaliNumber(shops.length)} টি</div>
        </div>
        <div className="bg-[#E2EFE7] p-3 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#144A29] uppercase">ভাড়াকৃত দোকান (Occupied)</span>
          <div className="text-xl font-mono-data font-bold text-[#144A29] mt-1">{toBengaliNumber(occupiedCount)} টি</div>
        </div>
        <div className="bg-[#F8EFE0] p-3 border border-[#141414]">
          <span className="text-[11px] font-mono-data font-bold text-[#5C4300] uppercase">খালি দোকান (Vacant)</span>
          <div className="text-xl font-mono-data font-bold text-[#5C4300] mt-1">{toBengaliNumber(vacantCount)} টি</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="দোকান নং, ব্যবসার নাম বা ভাড়াটিয়া..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1 text-xs font-mono-data bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-mono-data">
          <select
            aria-label="তলা ফিল্টার"
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] text-[#141414] font-medium outline-none cursor-pointer"
          >
            <option value="all">সব ফ্লোর</option>
            <option value="0">গ্রাউন্ড ফ্লোর (Ground)</option>
            <option value="1">১ম তলা (1st Floor)</option>
          </select>

          <select
            aria-label="অবস্থা ফিল্টার"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 text-xs border border-[#141414]/30 bg-[#EBEAE6] text-[#141414] font-medium outline-none cursor-pointer"
          >
            <option value="all">সব অবস্থা</option>
            <option value="occupied">ভাড়াকৃত (Occupied)</option>
            <option value="vacant">খালি (Vacant)</option>
          </select>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredShops.map((shop) => {
          const tenant = tenants.find((t) => t.id === shop.tenantId);
          const isOccupied = shop.status === 'occupied';
          const isVacant = shop.status === 'vacant';

          const totalCharges =
            shop.monthlyCharges.electricity +
            shop.monthlyCharges.water +
            shop.monthlyCharges.serviceCharge +
            shop.monthlyCharges.other;

          return (
            <div
              key={shop.id}
              className="bg-[#F4F3F0] border border-[#141414] hover:bg-[#EBEAE6] transition-colors p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono-data font-bold text-[#141414] bg-[#DDDCD7] px-2 py-0.5 border border-[#141414]/30">
                      {shop.shopNumber}
                    </span>
                    <span className="text-xs font-mono-data text-[#141414]/60 font-medium">
                      {shop.floor === 0 ? 'গ্রাউন্ড ফ্লোর' : `${shop.floor}ম তলা`}
                    </span>
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

                {/* Business name */}
                <div className="mt-2">
                  <h4 className="text-xs font-bold text-[#141414] truncate flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#141414]/70 shrink-0" />
                    <span>{shop.businessName || 'বাণিজ্যিক প্রতিষ্ঠান'}</span>
                  </h4>
                </div>

                {/* Tenant details */}
                <div className="mt-2 min-h-[44px] bg-[#EBEAE6] p-2 border border-[#141414]/15">
                  {tenant ? (
                    <div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#141414]">
                        <User className="w-3 h-3 text-[#141414]/60" />
                        <span className="truncate">{tenant.name}</span>
                      </div>
                      <div className="text-[11px] font-mono-data text-[#141414]/70 mt-0.5">{tenant.phone}</div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono-data text-[#141414]/50 italic flex items-center justify-center h-full">
                      দোকানটি বর্তমানে খালি
                    </div>
                  )}
                </div>

                {/* Pricing info */}
                <div className="mt-2.5 space-y-1 text-xs font-mono-data">
                  <div className="flex items-center justify-between text-[#141414]/80 font-medium">
                    <span>দোকান ভাড়া:</span>
                    <span className="text-[#141414] font-bold">{formatCurrency(shop.rent)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#141414]/60 text-[11px]">
                    <span>ইউটিলিটি:</span>
                    <span>+{formatCurrency(totalCharges)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#141414] font-bold text-xs pt-1 border-t border-[#141414]/20">
                    <span>মোট বিল:</span>
                    <span className="text-[#144A29]">{formatCurrency(shop.rent + totalCharges)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-[#141414]/20 flex items-center justify-between gap-1 font-mono-data">
                <button
                  onClick={() => openEditModal(shop)}
                  className="flex-1 py-1 px-2 text-[11px] font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414]/30 text-center transition-colors cursor-pointer"
                >
                  সম্পাদনা
                </button>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(shop.id, shop.shopNumber)}
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

      {/* Add / Edit Shop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#F4F3F0] max-w-lg w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20">
              <h3 className="text-base font-serif-heading font-bold text-[#141414] flex items-center gap-2">
                <Store className="w-5 h-5 text-[#141414]" />
                <span>{editingShop ? `দোকান ${editingShop.shopNumber} সম্পাদনা` : 'নতুন বাণিজ্যিক দোকান যোগ করুন'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#141414] hover:bg-[#DDDCD7] p-1 border border-transparent hover:border-[#141414]/30 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs font-mono-data">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">দোকান নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={shopNumber}
                    onChange={(e) => setShopNumber(e.target.value)}
                    placeholder="e.g. S-01"
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">ফ্লোর (Floor) *</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414] cursor-pointer"
                  >
                    <option value={0}>গ্রাউন্ড ফ্লোর (Ground)</option>
                    <option value={1}>১ম তলা (1st Floor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#141414] mb-1">ব্যবসা বা প্রতিষ্ঠানের নাম</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Al-Madina Pharmacy"
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-medium text-[#141414] outline-none focus:border-[#141414]"
                />
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

              {/* Utility breakdown */}
              <div className="pt-2.5 border-t border-[#141414]/20">
                <h4 className="font-bold text-[#141414] mb-2 uppercase text-[11px]">ডিফল্ট ইউটিলিটি ও সার্ভিস চার্জ (৳)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-[#141414]/70 mb-1">বাণিজ্যিক বিদ্যুৎ বিল</label>
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
