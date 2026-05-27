/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Wifi, 
  AlertOctagon, 
  Info, 
  CheckCircle,
  Sliders,
} from 'lucide-react';
import { Service, Withdrawal } from '../types';

interface SettingsViewProps {
  services: Service[];
  withdrawals: Withdrawal[];
  includeIncompleteServices: boolean;
  onToggleIncludeIncomplete: () => void;
  onImportData: (services: Service[], withdrawals: Withdrawal[]) => void;
  onResetData: () => void;
}

export default function SettingsView({
  services,
  withdrawals,
  includeIncompleteServices,
  onToggleIncludeIncomplete,
  onImportData,
  onResetData,
}: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Trigger JSON file download
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({
        version: 'woodflow-v1',
        services,
        withdrawals,
        exportedAt: new Date().toISOString(),
      }, null, 2);

      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `woodflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      triggerToast('Backup exportado com sucesso!');
    } catch (err) {
      setErrorMessage('Erro ao gerar arquivo de exportação.');
    }
  };

  // Process uploaded JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result as string);
        
        // Basic schema checks
        if (!parsed.services || !Array.isArray(parsed.services) || !parsed.withdrawals || !Array.isArray(parsed.withdrawals)) {
          throw new Error('Formato inválido. O arquivo JSON deve possuir chaves "services" e "withdrawals".');
        }

        onImportData(parsed.services, parsed.withdrawals);
        triggerToast('Dados importados com sucesso!');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setErrorMessage(err.message || 'Erro ao processar o arquivo de backup. Verifique se o formato JSON está correto.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const triggerToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <header className="border-b border-[#2B2B2B] pb-6">
        <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">
          Ajustes & Backup
        </h2>
        <p className="text-sm font-medium text-stone-500 mt-1 max-w-2xl">
          Gerencie configurações do workspace de marcenaria, persistência offline-first e integridade dos backups locais do dispositivo.
        </p>
      </header>

      {/* Dynamic Feedback Toasts */}
      {successMessage && (
        <div className="bg-[#1C1C1C] border border-[#3FA36C]/30 p-4 text-[#3FA36C] text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-md">
          <CheckCircle size={16} className="text-[#3FA36C]" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#1C1C1C] border border-[#C85C5C]/30 p-4 text-[#C85C5C] text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-md">
          <AlertOctagon size={16} className="text-[#C85C5C]" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Local Storage Backup Center */}
        <section className="lg:col-span-8 bg-[#1C1C1C] border border-[#2B2B2B] p-6 flex flex-col gap-5 rounded-xl">
          <div className="flex items-center gap-2 border-b border-[#2B2B2B] pb-3">
            <Database size={18} className="text-stone-300" />
            <h3 className="font-sans font-bold text-base text-white">Gerenciamento de Dados Locais</h3>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed font-normal">
            Seus projetos de carpintaria, orçamentos cadastrados e histórico de retiradas são salvos no armazenamento local criptografado deste navegador web ({services.length + withdrawals.length} registros ativos). Exporte backups periodicamente para garantir a portabilidade total.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
              onClick={handleExport}
              className="flex-1 bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-lg shadow-md"
            >
              <Download size={15} />
              Exportar JSON (Backup)
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-transparent border border-[#2B2B2B] hover:border-[#3A3A3A] hover:bg-[#2B2B2B] text-[#9A9A9A] hover:text-white py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-lg"
            >
              <Upload size={15} />
              Importar JSON (Restauração)
            </button>

            {/* Hidden Input field */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </section>

        {/* PWA Connection Status panel */}
        <section className="lg:col-span-4 bg-[#1C1C1C] border border-[#2B2B2B] p-6 flex flex-col justify-between rounded-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-[0.02] text-white">
            <Wifi size={140} />
          </div>

          <div className="flex items-center gap-2 border-b border-[#2B2B2B] pb-3 relative z-10 w-full">
            <Wifi size={18} className="text-stone-400" />
            <h3 className="font-sans font-bold text-base text-white">Status PWA</h3>
          </div>

          <div className="flex flex-col gap-3 relative z-10 mt-6 font-mono text-[11px] text-stone-400">
            <div className="flex justify-between items-center pb-2 border-b border-[#2B2B2B]/60">
              <span>Modo Offline do PWA</span>
              <span className="text-white font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Ativo (Total)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Modo de Persistência</span>
              <span className="text-stone-300 font-semibold uppercase">LocalStorage</span>
            </div>
          </div>
        </section>

        {/* Calculation Preferences Section */}
        <section className="lg:col-span-12 bg-[#1C1C1C] border border-[#2B2B2B] p-6 flex flex-col gap-5 rounded-xl">
          <div className="flex items-center gap-2 border-b border-[#2B2B2B] pb-3">
            <Sliders size={18} className="text-stone-300" />
            <h3 className="font-sans font-bold text-base text-white">Preferências de Fluxo de Caixa</h3>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F0F10] p-4 rounded-xl border border-[#2B2B2B]">
            <div className="flex-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Somar serviços em execução no Saldo Disponível
              </p>
              <p className="text-stone-400 text-xs font-normal mt-1 leading-relaxed max-w-3xl">
                Quando ativado, os orçamentos de serviços que ainda estão com status "Em Execução" (em andamento na oficina) serão somados ao caixa total acumulado de onde as retiradas quinzenais são subtraídas. Se desativado, o saldo disponível considerará apenas serviços completamente "Concluídos".
              </p>
            </div>

            <button
              onClick={onToggleIncludeIncomplete}
              className={`whitespace-nowrap px-4 py-2 uppercase tracking-wider text-[10px] font-bold border transition-all rounded-lg shrink-0 ${
                includeIncompleteServices
                  ? 'border-[#C8A46B] bg-[#C8A46B]/10 text-[#C8A46B] font-extrabold'
                  : 'border-[#2B2B2B] bg-transparent text-stone-400 hover:text-white hover:border-[#3A3A3A]'
              }`}
            >
              {includeIncompleteServices ? 'Ativado (Somar Execução)' : 'Desativado (Só Concluídos)'}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="lg:col-span-6 border border-red-950/20 bg-red-950/5 p-6 flex flex-col gap-4 rounded-xl">
          <div className="flex items-center gap-2 border-b border-red-900/10 pb-3 text-red-400">
            <AlertOctagon size={18} />
            <h3 className="font-sans font-bold text-base text-white">Zona de Risco</h3>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed font-normal">
            Atenção: Limpar os dados de marcenaria excluirá definitivamente todos os orçamentos de serviços e despesas do dispositivo local. Certifique-se de salvar um backup JSON antes do procedimento.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-transparent hover:bg-red-950/35 border border-red-900/40 text-red-400 hover:text-red-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all self-start"
            >
              Limpar Todos os Registros
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-red-300">Tem certeza de que deseja apagar tudo?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetData();
                    setShowResetConfirm(false);
                    triggerToast('Todos os dados foram redefinidos!');
                  }}
                  className="bg-red-950/50 border border-red-900/50 hover:bg-red-900 text-red-300 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Confirmar e Limpar
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-transparent border border-[#2B2B2B] hover:bg-[#2B2B2B] text-stone-400 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Info panel */}
        <section className="lg:col-span-6 bg-[#1C1C1C] border border-[#2B2B2B] p-6 flex flex-col justify-between rounded-xl">
          <div>
            <div className="flex items-center gap-2 border-b border-[#2B2B2B] pb-3 mb-3">
              <Info size={18} className="text-stone-300" />
              <h3 className="font-sans font-bold text-base text-white">Sobre o App</h3>
            </div>
            
            <p className="text-xs text-stone-400 leading-relaxed font-normal">
              Visão de Ganhos e Retiradas é um app projetado para marcenarias e prestadores de serviços sob medida. Ele é autônomo, não transfere segredos comerciais ou planilhas financeiras de clientes para servidores na nuvem, e preserva desempenho de baixa latência em tablets de oficina e telefones celulares.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2B2B2B] font-mono text-[10px] text-stone-500 mt-4">
            <span>Versão compilada</span>
            <span className="text-white font-semibold">v1.2.0-STABLE</span>
          </div>
        </section>

      </div>
    </div>
  );
}
