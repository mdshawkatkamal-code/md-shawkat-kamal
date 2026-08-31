import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tenant } from '../../types';
import { formatCurrency, formatMonthYear, toBengaliNumber } from '../../utils/formatters';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Home,
  Store,
  CreditCard,
  Receipt,
  FileText,
  Edit2,
  Archive,
  Eye,
  X,
  Calendar,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export const TenantsView: React.FC = () => {
  const {
    tenants,
    flats,
    shops,
    bills,
    payments,
    addTenant,
    updateTenant,
    archiveTenant,
    setSelectedReceiptModal,
    setSelectedStatementModal,
    setActiveTab,
    selectedMonth,
    selectedYear,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'all' | 'flat' | 'shop'>('all');

  // Detail Modal State
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'bills' | 'payments'>('overview');

  // Add / Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nid, setNid] = useState('');
  const [unitType, setUnitType] = useState<'flat' | 'shop'>('flat');
  const [unitId, setUnitId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState(22000);
  const [agreementStart, setAgreementStart] = useState('2025-01-01');
  const [agreementEnd, setAgreementEnd] = useState('2026-12-31');
  const [securityDeposit, setSecurityDeposit] = useState(44000);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const openAddModal = () => {
    setEditingTenant(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('House 12, Road 4, Sector 4, Uttara, Dhaka');
    setNid('1985269123456');
    setUnitType('flat');
    
    // Find first vacant flat
    const vacantFlat = flats.find((f) => f.status === 'vacant');
    setUnitId(vacantFlat ? vacantFlat.id : flats[0]?.id || '');
    setMonthlyRent(vacantFlat ? vacantFlat.rent : 22000);
    setAgreementStart('2026-01-01');
    setAgreementEnd('2026-12-31');
    setSecurityDeposit((vacantFlat?.rent || 22000) * 2);
    setEmergencyName('Brother / Relative');
    setEmergencyRelation('Brother');
    setEmergencyPhone('01799887766');
    setIsEditModalOpen(true);
  };

  const openEditModal = (t: Tenant) => {
    setEditingTenant(t);
    setName(t.name);
    setPhone(t.phone);
    setEmail(t.email);
    setAddress(t.address);
    setNid(t.nid);
    setUnitType(t.unitType);
    setUnitId(t.unitId);
    setMonthlyRent(t.monthlyRent);
    setAgreementStart(t.agreementStart);
    setAgreementEnd(t.agreementEnd);
    setSecurityDeposit(t.securityDeposit);
    setEmergencyName(t.emergencyContact?.name || '');
    setEmergencyRelation(t.emergencyContact?.relation || '');
    setEmergencyPhone(t.emergencyContact?.phone || '');
    setIsEditModalOpen(true);
  };

  const handleUnitTypeChange = (type: 'flat' | 'shop') => {
    setUnitType(type);
    if (type === 'flat') {
      const vacantFlat = flats.find((f) => f.status === 'vacant');
      const target = vacantFlat || flats[0];
      if (target) {
        setUnitId(target.id);
        setMonthlyRent(target.rent);
        setSecurityDeposit(target.rent * 2);
      }
    } else {
      const vacantShop = shops.find((s) => s.status === 'vacant');
      const target = vacantShop || shops[0];
      if (target) {
        setUnitId(target.id);
        setMonthlyRent(target.rent);
        setSecurityDeposit(target.rent * 3);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !unitId) return;

    let unitNumber = '';
    if (unitType === 'flat') {
      const f = flats.find((x) => x.id === unitId);
      unitNumber = f ? f.flatNumber : 'F-101';
    } else {
      const s = shops.find((x) => x.id === unitId);
      unitNumber = s ? s.shopNumber : 'S-01';
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${phone.trim()}@noortowerbd.com`,
      address: address.trim(),
      nid: nid.trim(),
      unitType,
      unitId,
      unitNumber,
      monthlyRent: Number(monthlyRent),
      agreementStart,
      agreementEnd,
      securityDeposit: Number(securityDeposit),
      emergencyContact: {
        name: emergencyName.trim(),
        relation: emergencyRelation.trim(),
        phone: emergencyPhone.trim(),
      },
      status: 'active' as const,
    };

    if (editingTenant) {
      updateTenant(editingTenant.id, payload);
    } else {
      addTenant(payload);
    }
    setIsEditModalOpen(false);
  };

  const handleArchive = (t: Tenant) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে ভাড়াটিয়া "${t.name}" এর চুক্তি সমাপ্ত করে সংরক্ষণাগারে পাঠাতে চান? এর ফলে ইউনিটটি খালি হয়ে যাবে।`)) {
      archiveTenant(t.id);
      if (selectedTenant?.id === t.id) {
        setSelectedTenant(null);
      }
    }
  };

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm) ||
      t.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'all' || t.unitType === unitFilter;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#141414]/20">
        <div>
          <h2 className="text-xl font-serif-heading font-bold text-[#141414] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#141414]" />
            <span>ভাড়াটিয়া প্রোফাইল ও ব্যবস্থাপনা (Tenant Management)</span>
          </h2>
          <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
            সকল ভাড়াটিয়ার পূর্ণাঙ্গ প্রোফাইল, এনআইডি, চুক্তি, মোট বিল, পরিশোধ ও বকেয়া হিসাব
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-data font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>নতুন ভাড়াটিয়া যোগ করুন</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-[#F4F3F0] p-3 border border-[#141414] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#141414]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ভাড়াটিয়ার নাম, ফোন নম্বর বা ইউনিট..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1 text-xs font-mono-data bg-[#EBEAE6] border border-[#141414]/30 outline-none focus:border-[#141414]"
          />
        </div>

        <div className="flex items-center gap-2 font-mono-data">
          <div className="flex items-center bg-[#EBEAE6] p-0.5 border border-[#141414]/30 text-xs">
            <button
              onClick={() => setUnitFilter('all')}
              className={`px-2.5 py-1 font-bold transition-all cursor-pointer ${
                unitFilter === 'all' ? 'bg-[#141414] text-[#E4E3E0]' : 'text-[#141414]/70 hover:text-[#141414]'
              }`}
            >
              সব ({tenants.length})
            </button>
            <button
              onClick={() => setUnitFilter('flat')}
              className={`px-2.5 py-1 font-bold transition-all cursor-pointer ${
                unitFilter === 'flat' ? 'bg-[#141414] text-[#E4E3E0]' : 'text-[#141414]/70 hover:text-[#141414]'
              }`}
            >
              ফ্ল্যাট
            </button>
            <button
              onClick={() => setUnitFilter('shop')}
              className={`px-2.5 py-1 font-bold transition-all cursor-pointer ${
                unitFilter === 'shop' ? 'bg-[#141414] text-[#E4E3E0]' : 'text-[#141414]/70 hover:text-[#141414]'
              }`}
            >
              দোকান
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-[#F4F3F0] border border-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tech-grid-table font-mono-data">
            <thead className="bg-[#EBEAE6] border-b border-[#141414] text-[#141414] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">ভাড়াটিয়ার নাম ও ফোন</th>
                <th className="px-3.5 py-2.5">ইউনিট (Flat/Shop)</th>
                <th className="px-3.5 py-2.5">মাসিক মূল ভাড়া</th>
                <th className="px-3.5 py-2.5">চুক্তির মেয়াদ</th>
                <th className="px-3.5 py-2.5">বকেয়া অবস্থা</th>
                <th className="px-3.5 py-2.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/15 text-[#141414]">
              {filteredTenants.map((tenant) => {
                const tenantBills = bills.filter((b) => b.tenantId === tenant.id);
                const totalBill = tenantBills.reduce((acc, b) => acc + b.totalAmount, 0);
                const totalPaid = tenantBills.reduce((acc, b) => acc + b.paidAmount, 0);
                const totalDue = Math.max(0, totalBill - totalPaid);

                const isFlat = tenant.unitType === 'flat';

                return (
                  <tr key={tenant.id} className="hover:bg-[#EBEAE6] transition-colors">
                    <td className="px-3.5 py-2.5">
                      <div className="font-bold text-[#141414]">{tenant.name}</div>
                      <div className="flex items-center gap-2 text-[#141414]/60 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 text-[#141414]/50" />
                        <span>{tenant.phone}</span>
                        {tenant.email && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{tenant.email}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {isFlat ? (
                          <span className="p-0.5 bg-[#DDDCD7] text-[#141414] border border-[#141414]/20">
                            <Home className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-0.5 bg-[#DDDCD7] text-[#141414] border border-[#141414]/20">
                            <Store className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="font-bold text-[#141414]">{tenant.unitNumber}</span>
                        <span className="text-[10px] text-[#141414]/50">({isFlat ? 'Flat' : 'Shop'})</span>
                      </div>
                    </td>

                    <td className="px-3.5 py-2.5 font-bold text-[#141414]">
                      {formatCurrency(tenant.monthlyRent)}
                    </td>

                    <td className="px-3.5 py-2.5 text-[#141414]/70">
                      <div>{tenant.agreementStart} থেকে</div>
                      <div className="text-[11px] text-[#141414]/50">{tenant.agreementEnd} পর্যন্ত</div>
                    </td>

                    <td className="px-3.5 py-2.5">
                      {totalDue > 0 ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 border border-[#801414]/40 text-[11px] font-bold bg-[#FCE8E8] text-[#801414]">
                          বকেয়া: {formatCurrency(totalDue)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 border border-[#144A29]/40 text-[11px] font-bold bg-[#D2E3D8] text-[#144A29]">
                          পরিশোধিত
                        </span>
                      )}
                    </td>

                    <td className="px-3.5 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setProfileTab('overview');
                          }}
                          className="px-2 py-1 text-xs font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414]/30 flex items-center gap-1 cursor-pointer"
                          title="সম্পূর্ণ প্রোফাইল দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রোফাইল</span>
                        </button>

                        <button
                          onClick={() => openEditModal(tenant)}
                          className="p-1 text-[#141414]/70 hover:text-[#141414] hover:bg-[#DDDCD7] border border-transparent hover:border-[#141414]/30 cursor-pointer"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleArchive(tenant)}
                          className="p-1 text-[#801414] hover:bg-[#FCE8E8] border border-transparent hover:border-[#801414]/30 cursor-pointer"
                          title="চুক্তি সমাপ্ত / খালি করুন"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Full Profile Detail Modal (Requirement 12) */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#F4F3F0] max-w-2xl w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#141414]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#141414] text-[#E4E3E0] font-mono-data font-bold text-lg flex items-center justify-center border border-[#141414]">
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-serif-heading font-bold text-[#141414] flex items-center gap-2">
                    <span>{selectedTenant.name}</span>
                    <span className="text-xs font-mono-data bg-[#DDDCD7] text-[#141414] px-1.5 py-0.5 border border-[#141414]/30 font-bold">
                      {selectedTenant.unitNumber} ({selectedTenant.unitType.toUpperCase()})
                    </span>
                  </h3>
                  <p className="text-xs font-mono-data text-[#141414]/70 mt-0.5">
                    মোবাইল: {selectedTenant.phone} • ইমেইল: {selectedTenant.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTenant(null)}
                className="text-[#141414] hover:bg-[#DDDCD7] p-1 border border-transparent hover:border-[#141414]/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-[#141414]/20 pt-3 text-xs font-mono-data">
              <button
                onClick={() => setProfileTab('overview')}
                className={`pb-2 px-3 border-b-2 font-bold cursor-pointer transition-all ${
                  profileTab === 'overview'
                    ? 'border-[#141414] text-[#141414]'
                    : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
                }`}
              >
                প্রোফাইল তথ্য (Overview)
              </button>
              <button
                onClick={() => setProfileTab('bills')}
                className={`pb-2 px-3 border-b-2 font-bold cursor-pointer transition-all ${
                  profileTab === 'bills'
                    ? 'border-[#141414] text-[#141414]'
                    : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
                }`}
              >
                মাসিক বিলসমূহ (Bills)
              </button>
              <button
                onClick={() => setProfileTab('payments')}
                className={`pb-2 px-3 border-b-2 font-bold cursor-pointer transition-all ${
                  profileTab === 'payments'
                    ? 'border-[#141414] text-[#141414]'
                    : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
                }`}
              >
                পরিশোধের ইতিহাস (Payments)
              </button>
            </div>

            {/* Tab 1: Overview */}
            {profileTab === 'overview' && (
              <div className="py-4 space-y-3.5 text-xs font-mono-data">
                {/* Financial 3-box summary */}
                {(() => {
                  const tBills = bills.filter((b) => b.tenantId === selectedTenant.id);
                  const totalB = tBills.reduce((acc, b) => acc + b.totalAmount, 0);
                  const totalP = tBills.reduce((acc, b) => acc + b.paidAmount, 0);
                  const totalD = Math.max(0, totalB - totalP);

                  return (
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-[#EBEAE6] p-2.5 border border-[#141414]">
                        <span className="text-[#141414]/70 text-[10px] font-bold uppercase">মোট বিল</span>
                        <div className="text-base font-bold text-[#141414] mt-0.5">
                          {formatCurrency(totalB)}
                        </div>
                      </div>
                      <div className="bg-[#E2EFE7] p-2.5 border border-[#141414]">
                        <span className="text-[#144A29] text-[10px] font-bold uppercase">মোট পরিশোধ</span>
                        <div className="text-base font-bold text-[#144A29] mt-0.5">
                          {formatCurrency(totalP)}
                        </div>
                      </div>
                      <div className="bg-[#FCE8E8] p-2.5 border border-[#141414]">
                        <span className="text-[#801414] text-[10px] font-bold uppercase">মোট বকেয়া</span>
                        <div className="text-base font-bold text-[#801414] mt-0.5">
                          {formatCurrency(totalD)}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 bg-[#EBEAE6] p-3.5 border border-[#141414]">
                  <div>
                    <span className="text-[#141414]/60 text-[10px] font-bold uppercase">স্থায়ী ঠিকানা:</span>
                    <p className="font-semibold text-[#141414] mt-0.5">{selectedTenant.address}</p>
                  </div>
                  <div>
                    <span className="text-[#141414]/60 text-[10px] font-bold uppercase">এনআইডি নম্বর:</span>
                    <p className="font-semibold text-[#141414] mt-0.5">{selectedTenant.nid}</p>
                  </div>
                  <div>
                    <span className="text-[#141414]/60 text-[10px] font-bold uppercase">মাসিক নির্ধারিত ভাড়া:</span>
                    <p className="font-bold text-[#144A29] mt-0.5">
                      {formatCurrency(selectedTenant.monthlyRent)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#141414]/60 text-[10px] font-bold uppercase">জামানত / সিকিউরিটি:</span>
                    <p className="font-bold text-[#141414] mt-0.5">
                      {formatCurrency(selectedTenant.securityDeposit)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#141414]/60 text-[10px] font-bold uppercase">চুক্তি শুরুর তারিখ:</span>
                    <p className="font-medium text-[#141414] mt-0.5">{selectedTenant.agreementStart}</p>
                  </div>
                  <div>
                    <span className="text-[#141414]/60 text-[10px] font-bold uppercase">চুক্তি শেষের তারিখ:</span>
                    <p className="font-medium text-[#141414] mt-0.5">{selectedTenant.agreementEnd}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#141414]/20">
                    <span className="text-[#141414]/60 text-[10px] font-bold uppercase">জরুরি যোগাযোগ:</span>
                    <p className="font-bold text-[#141414] mt-0.5">
                      {selectedTenant.emergencyContact?.name} ({selectedTenant.emergencyContact?.relation}) — {selectedTenant.emergencyContact?.phone}
                    </p>
                  </div>
                </div>

                {/* Quick Statement Trigger */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() =>
                      setSelectedStatementModal({
                        tenant: selectedTenant,
                        month: selectedMonth,
                        year: selectedYear,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#141414] bg-[#DDDCD7] hover:bg-[#C8C7C2] border border-[#141414]/40 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>মাসিক স্টেটমেন্ট ডাউনলোড / প্রিন্ট ({selectedMonth})</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTenant(null);
                      setActiveTab('payments-add');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#E4E3E0] bg-[#141414] hover:bg-[#2A2A28] border border-[#141414] cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>ভাড়া আদায় এন্ট্রি করুন</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Monthly Bills */}
            {profileTab === 'bills' && (
              <div className="py-3 space-y-2 max-h-80 overflow-y-auto pr-1 font-mono-data">
                {bills
                  .filter((b) => b.tenantId === selectedTenant.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-[#EBEAE6] border border-[#141414]/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#141414]">
                          {b.month} {b.year} — {b.billNumber}
                        </div>
                        <div className="text-[11px] text-[#141414]/70 mt-0.5">
                          ভাড়া: {formatCurrency(b.items.rent)} | বিদ্যুৎ: {formatCurrency(b.items.electricity)} | গ্যাস: {formatCurrency(b.items.gas)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#141414]">{formatCurrency(b.totalAmount)}</div>
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.2 border mt-1 ${
                            b.status === 'paid'
                              ? 'bg-[#D2E3D8] text-[#144A29] border-[#144A29]/30'
                              : b.status === 'partial'
                              ? 'bg-[#F8EFE0] text-[#5C4300] border-[#5C4300]/30'
                              : 'bg-[#FCE8E8] text-[#801414] border-[#801414]/30'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Tab 3: Payments & Receipts */}
            {profileTab === 'payments' && (
              <div className="py-3 space-y-2 max-h-80 overflow-y-auto pr-1 font-mono-data">
                {payments
                  .filter((p) => p.tenantId === selectedTenant.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-[#E2EFE7] border border-[#144A29]/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#141414]">
                          {p.receiptNumber} — {p.month} {p.year}
                        </div>
                        <div className="text-[11px] text-[#141414]/70 mt-0.5">
                          তারিখ: {p.paymentDate} • মাধ্যম: {p.paymentMethod.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#144A29]">+{formatCurrency(p.amount)}</div>
                        <button
                          onClick={() => setSelectedReceiptModal(p)}
                          className="text-[11px] text-[#141414] underline font-bold mt-0.5 block cursor-pointer"
                        >
                          মানি রিসিট দেখুন →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Tenant Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[#F4F3F0] max-w-lg w-full p-5 sm:p-6 border-2 border-[#141414] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]/20">
              <h3 className="text-base font-serif-heading font-bold text-[#141414] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#141414]" />
                <span>{editingTenant ? 'ভাড়াটিয়ার তথ্য সম্পাদনা' : 'নতুন ভাড়াটিয়া যোগ করুন'}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#141414] hover:bg-[#DDDCD7] p-1 border border-transparent hover:border-[#141414]/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs font-mono-data">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">ভাড়াটিয়ার পুরো নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abdur Rahim"
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712000000"
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenant@gmail.com"
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">এনআইডি নম্বর (NID) *</label>
                  <input
                    type="text"
                    required
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    placeholder="1985269123456"
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#141414] mb-1">স্থায়ী ঠিকানা (Address)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Village, Police Station, District"
                  className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 text-[#141414] outline-none focus:border-[#141414]"
                />
              </div>

              {/* Unit Selection */}
              <div className="grid grid-cols-2 gap-2.5 bg-[#EBEAE6] p-2.5 border border-[#141414]">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">ইউনিটের ধরন *</label>
                  <select
                    value={unitType}
                    onChange={(e: any) => handleUnitTypeChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-bold bg-[#F4F3F0] text-[#141414] outline-none cursor-pointer"
                  >
                    <option value="flat">আবাসিক ফ্ল্যাট (Flat)</option>
                    <option value="shop">বাণিজ্যিক দোকান (Shop)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#141414] mb-1">ইউনিট নম্বর নির্ধারণ *</label>
                  <select
                    value={unitId}
                    onChange={(e) => {
                      setUnitId(e.target.value);
                      if (unitType === 'flat') {
                        const f = flats.find((x) => x.id === e.target.value);
                        if (f) {
                          setMonthlyRent(f.rent);
                          setSecurityDeposit(f.rent * 2);
                        }
                      } else {
                        const s = shops.find((x) => x.id === e.target.value);
                        if (s) {
                          setMonthlyRent(s.rent);
                          setSecurityDeposit(s.rent * 3);
                        }
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-[#141414]/40 font-bold bg-[#F4F3F0] text-[#141414] outline-none cursor-pointer"
                  >
                    {unitType === 'flat'
                      ? flats.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.flatNumber} ({f.floor}ম তলা - {f.status === 'occupied' ? 'ভাড়াকৃত' : 'খালি'})
                          </option>
                        ))
                      : shops.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.shopNumber} ({s.businessName || 'বাণিজ্যিক স্পেস'})
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">নির্ধারিত মাসিক মূল ভাড়া (৳) *</label>
                  <input
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#144A29] outline-none focus:border-[#141414]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">সিকিউরিটি জামানত (৳)</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-[#EBEAE6] border border-[#141414]/40 font-bold text-[#141414] outline-none focus:border-[#141414]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#141414] mb-1">চুক্তি শুরু</label>
                  <input
                    type="date"
                    value={agreementStart}
                    onChange={(e) => setAgreementStart(e.target.value)}
                    className="w-full px-2.5 py-1 bg-[#EBEAE6] border border-[#141414]/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#141414] mb-1">চুক্তি সমাপ্তি</label>
                  <input
                    type="date"
                    value={agreementEnd}
                    onChange={(e) => setAgreementEnd(e.target.value)}
                    className="w-full px-2.5 py-1 bg-[#EBEAE6] border border-[#141414]/30"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-[#141414]/20">
                <label className="block font-bold text-[#141414] mb-1">জরুরি যোগাযোগের তথ্য</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="নাম"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="সম্পর্ক"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="ফোন নম্বর"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="px-2 py-1 bg-[#EBEAE6] border border-[#141414]/30 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#141414]/20 flex items-center justify-end gap-2 font-mono-data">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
