import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, FileText, CheckCircle2, AlertTriangle, ArrowRight, TableProperties } from 'lucide-react';

export const VendorOffersView: React.FC = () => {
  const { vendors, setActiveTab, activeRevision } = useApp();

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Vendor Technical Offers & Quotations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingested bidding packages benchmarked against Approved MDS Baseline ({activeRevision.revision}).
          </p>
        </div>

        <button
          onClick={() => setActiveTab('compliance_matrix')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
        >
          <TableProperties className="w-3.5 h-3.5" />
          <span>Launch Compliance Matrix</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vendors.map((vendor) => {
          const paramCount = Object.keys(vendor.parameters).length;
          return (
            <div
              key={vendor.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-5 flex flex-col justify-between shadow-sm hover:border-blue-500 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {vendor.vendorName}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {vendor.commercialStatus}
                  </span>
                </div>

                <div className="mt-3 font-mono text-[11px] text-slate-500 flex flex-col gap-1">
                  <div><strong>Quotation:</strong> {vendor.quotationNumber}</div>
                  <div><strong>Revision:</strong> {vendor.revision}</div>
                  <div><strong>Submitted:</strong> {vendor.submissionDate}</div>
                  <div><strong>Contact:</strong> {vendor.contactPerson}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-slate-600 dark:text-slate-400 font-semibold mb-2">
                    Key Quoted Parameters:
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Design Press:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {vendor.parameters['Design Pressure']?.value !== undefined
                          ? `${vendor.parameters['Design Pressure'].value} bar(g)`
                          : <span className="text-rose-600 font-normal italic">Omitted (Missing)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Design Temp:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {vendor.parameters['Design Temperature']?.value
                          ? `${vendor.parameters['Design Temperature'].value}`
                          : <span className="text-amber-600 font-normal italic">Unclear</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Material:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {vendor.parameters['Shell & Head Material']?.value}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">{paramCount} fields extracted</span>
                <button
                  onClick={() => setActiveTab('compliance_matrix')}
                  className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
                >
                  View Matrix <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
