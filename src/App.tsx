/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ServicesView from './components/ServicesView';
import WithdrawalsView from './components/WithdrawalsView';
import SettingsView from './components/SettingsView';
import { ServiceDialog, WithdrawalDialog } from './components/Dialogs';
import { Service, Withdrawal } from './types';
import { INITIAL_SERVICES, INITIAL_WITHDRAWALS, getFortnight } from './utils';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'services' | 'withdrawals' | 'settings'>('dashboard');
  
  // Core Local database state
  const [services, setServices] = useState<Service[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  
  // Active dialog visibility states
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [withdrawalToEdit, setWithdrawalToEdit] = useState<Withdrawal | null>(null);

  // Toggle option to sum services in execution into available balance
  const [includeIncompleteServices, setIncludeIncompleteServices] = useState<boolean>(() => {
    const saved = localStorage.getItem('woodflow_include_incomplete');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Track state change
  const handleToggleIncludeIncomplete = () => {
    setIncludeIncompleteServices((prev) => {
      const nextValue = !prev;
      localStorage.setItem('woodflow_include_incomplete', JSON.stringify(nextValue));
      return nextValue;
    });
  };

  // Initialize data on core mount
  useEffect(() => {
    const savedServices = localStorage.getItem('woodflow_services');
    const savedWithdrawals = localStorage.getItem('woodflow_withdrawals');

    if (savedServices) {
      setServices(JSON.parse(savedServices));
    } else {
      setServices(INITIAL_SERVICES);
      localStorage.setItem('woodflow_services', JSON.stringify(INITIAL_SERVICES));
    }

    if (savedWithdrawals) {
      setWithdrawals(JSON.parse(savedWithdrawals));
    } else {
      setWithdrawals(INITIAL_WITHDRAWALS);
      localStorage.setItem('woodflow_withdrawals', JSON.stringify(INITIAL_WITHDRAWALS));
    }
  }, []);

  // Save changes to localStorage on service updates
  const updateServices = (newServices: Service[]) => {
    setServices(newServices);
    localStorage.setItem('woodflow_services', JSON.stringify(newServices));
  };

  // Save changes to localStorage on withdrawal updates
  const updateWithdrawals = (newWithdrawals: Withdrawal[]) => {
    setWithdrawals(newWithdrawals);
    localStorage.setItem('woodflow_withdrawals', JSON.stringify(newWithdrawals));
  };

  // Create or Update services
  const handleSaveService = (serviceData: Omit<Service, 'id'> & { id?: string }) => {
    if (serviceData.id) {
      // Editing
      const updated = services.map((s) => 
        s.id === serviceData.id 
          ? { ...s, ...serviceData } as Service
          : s
      );
      updateServices(updated);
    } else {
      // Adding new
      const newService: Service = {
        ...serviceData,
        id: 's-' + Date.now().toString() + Math.random().toString(36).substring(2, 5),
      };
      updateServices([newService, ...services]);
    }
    setServiceToEdit(null);
  };

  // Toggle status inside card directly
  const handleToggleServiceStatus = (id: string) => {
    const updated = services.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: s.status === 'execution' ? 'completed' : 'execution',
        } as Service;
      }
      return s;
    });
    updateServices(updated);
  };

  // Triggers native warning before removing service
  const handleDeleteService = (id: string) => {
    const target = services.find((s) => s.id === id);
    const client = target ? target.clientName : '';
    
    const confirmDelete = window.confirm(
      `Confirmação de Segurança:\n\nTem certeza de que deseja excluir o serviço do cliente "${client}"?`
    );
    if (confirmDelete) {
      const filtered = services.filter((s) => s.id !== id);
      updateServices(filtered);
    }
  };

  // Trigger editing service model
  const handleEditServiceTrigger = (service: Service) => {
    setServiceToEdit(service);
    setIsServiceDialogOpen(true);
  };

  // Record or update a withdrawal
  const handleSaveWithdrawal = (withdrawalData: Omit<Withdrawal, 'id' | 'fortnight'> & { id?: string }) => {
    if (withdrawalData.id) {
      const updated = withdrawals.map((w) =>
        w.id === withdrawalData.id
          ? { ...w, ...withdrawalData, fortnight: getFortnight(withdrawalData.date) } as Withdrawal
          : w
      );
      updateWithdrawals(updated);
    } else {
      const fortnightLabel = getFortnight(withdrawalData.date);
      const newWithdrawal: Withdrawal = {
        ...withdrawalData,
        id: 'w-' + Date.now().toString() + Math.random().toString(36).substring(2, 5),
        fortnight: fortnightLabel,
      };
      updateWithdrawals([newWithdrawal, ...withdrawals]);
    }
    setWithdrawalToEdit(null);
  };

  // Exclude withdrawal from ledger
  const handleDeleteWithdrawal = (id: string) => {
    const filtered = withdrawals.filter((w) => w.id !== id);
    updateWithdrawals(filtered);
  };

  // Trigger editing withdrawal model
  const handleEditWithdrawalTrigger = (withdrawal: Withdrawal) => {
    setWithdrawalToEdit(withdrawal);
    setIsWithdrawalDialogOpen(true);
  };

  // System Backup Imports
  const handleImportData = (importedServices: Service[], importedWithdrawals: Withdrawal[]) => {
    updateServices(importedServices);
    updateWithdrawals(importedWithdrawals);
  };

  // Hard system memory reset
  const handleResetData = () => {
    updateServices([]);
    updateWithdrawals([]);
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#F5F5F5] flex flex-col lg:flex-row antialiased">
      
      {/* Side of Top navigation (collapsible) */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => setCurrentView(view)}
        onAddService={() => {
          setServiceToEdit(null);
          setIsServiceDialogOpen(true);
        }}
      />

      {/* Main viewport frame */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-10 w-full max-w-[1400px] mx-auto min-h-screen">
        
        {/* Render View by Navigation ID */}
        {currentView === 'dashboard' && (
          <DashboardView
            services={services}
            withdrawals={withdrawals}
            includeIncompleteServices={includeIncompleteServices}
            onToggleIncludeIncomplete={handleToggleIncludeIncomplete}
            onNavigate={(view) => setCurrentView(view)}
            onAddService={() => {
              setServiceToEdit(null);
              setIsServiceDialogOpen(true);
            }}
            onAddWithdrawal={() => {
              setIsWithdrawalDialogOpen(true);
            }}
          />
        )}

        {currentView === 'services' && (
          <ServicesView
            services={services}
            onAddService={() => {
              setServiceToEdit(null);
              setIsServiceDialogOpen(true);
            }}
            onEditService={handleEditServiceTrigger}
            onDeleteService={handleDeleteService}
            onToggleStatus={handleToggleServiceStatus}
          />
        )}

        {currentView === 'withdrawals' && (
          <WithdrawalsView
            withdrawals={withdrawals}
            services={services}
            includeIncompleteServices={includeIncompleteServices}
            onToggleIncludeIncomplete={handleToggleIncludeIncomplete}
            onAddWithdrawal={() => {
              setWithdrawalToEdit(null);
              setIsWithdrawalDialogOpen(true);
            }}
            onDeleteWithdrawal={handleDeleteWithdrawal}
            onEditWithdrawal={handleEditWithdrawalTrigger}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            services={services}
            withdrawals={withdrawals}
            includeIncompleteServices={includeIncompleteServices}
            onToggleIncludeIncomplete={handleToggleIncludeIncomplete}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Shared Service Dialog Modal overlay */}
      <ServiceDialog
        isOpen={isServiceDialogOpen}
        onClose={() => {
          setIsServiceDialogOpen(false);
          setServiceToEdit(null);
        }}
        onSave={handleSaveService}
        serviceToEdit={serviceToEdit}
      />

      {/* Shared Withdrawal Dialog Modal overlay */}
      <WithdrawalDialog
        isOpen={isWithdrawalDialogOpen}
        onClose={() => {
          setIsWithdrawalDialogOpen(false);
          setWithdrawalToEdit(null);
        }}
        onSave={handleSaveWithdrawal}
        withdrawalToEdit={withdrawalToEdit}
      />

    </div>
  );
}
