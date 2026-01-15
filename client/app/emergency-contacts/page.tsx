'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, GripVertical, Phone, Mail } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  priorityOrder: number;
  notificationMethod: 'CALL' | 'SMS' | 'EMAIL' | 'ALL';
}

export default function EmergencyContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      phoneNumber: '0123456789',
      email: 'nguyenvana@example.com',
      relationship: 'Gia đình',
      priorityOrder: 1,
      notificationMethod: 'ALL',
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    relationship: '',
    notificationMethod: 'ALL' as const,
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phoneNumber) {
      alert('Vui lòng nhập tên và số điện thoại');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
      priorityOrder: contacts.length + 1,
    };

    setContacts([...contacts, contact]);
    setNewContact({
      name: '',
      phoneNumber: '',
      email: '',
      relationship: '',
      notificationMethod: 'ALL',
    });
    setShowAddForm(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Liên hệ khẩn cấp</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-full bg-teal-600 p-2 text-white hover:bg-teal-700"
        >
          <Plus className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Info Banner */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">💡 Lưu ý:</p>
          <p>
            Danh sách này sẽ được gọi theo thứ tự ưu tiên khi bạn không điểm danh đúng giờ.
          </p>
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>Chưa có liên hệ khẩn cấp</p>
              <p className="text-sm">Nhấn nút + để thêm</p>
            </div>
          ) : (
            contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm"
              >
                <button className="cursor-move text-gray-400">
                  <GripVertical className="h-5 w-5" />
                </button>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold">{contact.name}</h3>
                    {contact.relationship && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {contact.relationship}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{contact.phoneNumber}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Phương thức: {contact.notificationMethod === 'ALL' ? 'Tất cả' : contact.notificationMethod}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="rounded-full p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">Thêm liên hệ khẩn cấp</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newContact.phoneNumber}
                    onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Mối quan hệ</label>
                  <input
                    type="text"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Gia đình, Bạn bè..."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Phương thức liên hệ</label>
                  <select
                    value={newContact.notificationMethod}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        notificationMethod: e.target.value as any,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="CALL">Gọi điện</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddContact}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
