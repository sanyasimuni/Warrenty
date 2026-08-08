'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  CheckCircle2,
  MoreVertical,
  Trash2
} from 'lucide-react';

export default function FamilyMembersPage() {
  const [members] = useState([
    {
      id: 'fam-1',
      name: 'Jane Doe',
      role: 'Owner / Primary Admin',
      email: 'jane.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      itemsAccessible: 'All 25 Products'
    },
    {
      id: 'fam-2',
      name: 'Alex Doe',
      role: 'Family Member',
      email: 'alex.doe@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      itemsAccessible: 'Computers & Entertainment'
    }
  ]);

  return (
    <div className="dash-view-container">
      <div className="dash-header-row">
        <div>
          <h1 className="dash-page-title">Household & Family Vault</h1>
          <p className="dash-page-subtitle">
            Share warranties and receipt records with family members or co-owners.
          </p>
        </div>

        <div className="dash-header-actions">
          <button
            className="btn btn-primary dash-btn"
            onClick={() => alert('Invite link generated! Send to your household member.')}
          >
            <UserPlus size={16} />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dash-table-responsive">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role & Permissions</th>
                <th>Email Address</th>
                <th>Shared Products</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={m.avatar}
                        alt={m.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{m.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className="dash-status-pill status-active" style={{ fontSize: '0.75rem' }}>
                      {m.role}
                    </span>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.itemsAccessible}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => alert(`Managing permissions for ${m.name}`)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
