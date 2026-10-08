import React from 'react';
import { ComplianceStatus, ExtractionStatus, DeviationSeverity } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Clock, ShieldAlert, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplianceStatus | ExtractionStatus | DeviationSeverity | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const paddingClass = isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  switch (status) {
    case 'COMPLIANT':
    case 'Approved':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded ${paddingClass}`}>
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{status === 'COMPLIANT' ? 'COMPLIANT' : 'Approved'}</span>
        </span>
      );

    case 'DEVIATING':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded ${paddingClass}`}>
          <XCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>DEVIATING</span>
        </span>
      );

    case 'UNCLEAR':
    case 'Uncertain':
    case 'Requires Review':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded ${paddingClass}`}>
          <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{status}</span>
        </span>
      );

    case 'MISSING':
    case 'Missing':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 border border-slate-300 rounded ${paddingClass}`}>
          <HelpCircle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>{status}</span>
        </span>
      );

    case 'Conflict':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-red-100 text-red-800 border border-red-300 rounded ${paddingClass}`}>
          <AlertOctagon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>CONFLICT</span>
        </span>
      );

    case 'Critical':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-rose-100 text-rose-900 border border-rose-300 rounded ${paddingClass}`}>
          <ShieldAlert className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Critical</span>
        </span>
      );

    case 'Major':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-amber-100 text-amber-900 border border-amber-300 rounded ${paddingClass}`}>
          <AlertTriangle className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Major</span>
        </span>
      );

    case 'Minor':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded ${paddingClass}`}>
          <Clock className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Minor</span>
        </span>
      );

    case 'Available':
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-slate-50 text-slate-700 border border-slate-200 rounded ${paddingClass}`}>
          <CheckCircle2 className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Available</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded ${paddingClass}`}>
          <span>{status}</span>
        </span>
      );
  }
};
