/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wrench, DollarSign, Settings as SettingsIcon, Plus, Menu, X, Download } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'services' | 'withdrawals' | 'settings';
  setCurrentView: (view: 'dashboard' | 'services' | 'withdrawals' | 'settings') => void;
  onAddService: () => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  onAddService,
}: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services' as const, label: 'Serviços', icon: Wrench },
    { id: 'withdrawals' as const, label: 'Retiradas', icon: DollarSign },
    { id: 'settings' as const, label: 'Ajustes', icon: SettingsIcon },
  ];

  return (
    <>
      {/* TopNavBar (Mobile) */}
      <nav className="lg:hidden sticky top-0 z-50 flex justify-between items-center px-4 py-3 w-full bg-[#0F0F10]/90 backdrop-blur-md border-b border-[#2B2B2B]">
        <div className="flex items-center gap-2">
          <h1 className="font-sans font-black text-xl tracking-tighter text-white">Ganhos</h1>
          <span className="text-[10px] bg-[#1C1C1C] border border-[#2B2B2B] text-stone-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">v1.0</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onAddService();
            }}
            className="bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] px-3 py-1 text-xs font-semibold tracking-tight transition-all rounded"
          >
            + Serviço
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-stone-400 hover:text-white transition-all rounded"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-64 bg-[#151515] border-l border-[#2B2B2B] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2B2B2B]">
                <div>
                  <h3 className="font-sans font-bold text-white tracking-tighter">Menu</h3>
                  <p className="text-[11px] text-stone-500 font-mono tracking-wide">Ganhos e Retiradas</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all rounded-md ${
                        isActive
                          ? 'bg-[#1C1C1C] border border-[#3A3A3A] text-white font-semibold'
                          : 'text-stone-400 hover:text-white hover:bg-[#2B2B2B]'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-white' : 'text-stone-500'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => {
                  onAddService();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] transition-all rounded"
              >
                <Plus size={16} />
                Criar Serviço
              </button>
              <p className="text-center text-[10px] text-stone-600 mt-4 font-mono">v1.2.0 (Offline-First)</p>
            </div>
            {deferredPrompt && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 mt-3 border border-[#2B2B2B] text-stone-300 hover:text-white hover:border-stone-500 transition-all rounded py-2 text-xs font-semibold"
              >
                <Download size={14} />
                Instalar App
              </button>
            )}
          </div>
        </div>
      )}

      {/* SideNavBar (Desktop) */}
      <aside className="hidden lg:flex flex-col h-screen border-r border-[#2B2B2B] py-8 bg-[#151515] w-64 fixed left-0 top-0 z-30 justify-between">
        <div>
          <div className="px-6 mb-12">
            <h1 className="font-sans font-black text-3xl text-white tracking-tighter leading-none">Ganhos</h1>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mt-2">Visão Financeira</p>
          </div>

          <div className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 text-xs uppercase tracking-wider font-semibold transition-all rounded-md relative ${
                    isActive
                      ? 'bg-[#1C1C1C] border border-[#3A3A3A] text-white'
                      : 'text-stone-400 hover:text-white hover:bg-[#2B2B2B]'
                  }`}
                >
                  <Icon size={16} className={`${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4">
          <button
            onClick={() => onAddService()}
            className="w-full flex items-center justify-center gap-1.5 bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] transition-all rounded shadow-lg shadow-black/40"
          >
            <Plus size={14} />
            Add Service
          </button>
          <div className="text-center mt-6">
            <span className="text-[10px] text-stone-600 font-mono tracking-widest block uppercase">BRL WORKSPACE</span>
          </div>
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-1.5 mt-4 border border-[#2B2B2B] text-stone-300 hover:text-white hover:border-stone-500 transition-all rounded py-2 text-xs font-semibold"
            >
              <Download size={14} />
              Instalar App
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
