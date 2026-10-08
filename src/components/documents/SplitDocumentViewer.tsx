import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExtractedParameter } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Check,
  Edit2,
  X,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export const SplitDocumentViewer: React.FC = () => {
  const {
    documents,
    selectedDocId,
    setSelectedDocId,
    parameters,
    updateParameter,
    selectedParamForViewer,
    setSelectedParamForViewer,
  } = useApp();

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const [currentPage, setCurrentPage] = useState<number>(3); // Default to page 3 where conflict/parameters live
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeHighlightParam, setActiveHighlightParam] = useState<string | null>(
    selectedParamForViewer?.parameterName || 'Design Pressure'
  );

  const pageData = currentDoc.pages.find((p) => p.pageNumber === currentPage) || currentDoc.pages[0];

  // Parameters originating from or associated with this document
  const docParameters = parameters.filter(
    (p) => p.source?.documentId === currentDoc.id || p.parameterName === activeHighlightParam
  );

  const handleSelectParameter = (param: ExtractedParameter) => {
    setSelectedParamForViewer(param);
    setActiveHighlightParam(param.parameterName);
    if (param.source?.page) {
      setCurrentPage(param.source.page);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Top Document Controls Bar */}
      <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-3">
          <select
            value={currentDoc.id}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.documentNumber})
              </option>
            ))}
          </select>
          <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
            SHA: {currentDoc.hash.substring(0, 16)}...
          </span>
        </div>

        {/* Page Switcher and Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="font-mono text-slate-700 dark:text-slate-300 px-1 text-xs tabular-nums">
            Page {currentPage} of {currentDoc.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(currentDoc.totalPages, p + 1))}
            disabled={currentPage >= currentDoc.totalPages}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>

          <button
            onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-[11px] font-mono text-slate-500 w-9 text-center tabular-nums">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Split-Screen Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: Simulated High-Fidelity Engineering Document / PDF Canvas */}
        <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-200 dark:bg-slate-950/80">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-[620px] min-h-[800px] bg-white text-slate-900 shadow-2xl rounded border border-slate-300 p-8 flex flex-col justify-between transition-transform duration-150 select-text relative font-serif text-sm leading-relaxed"
          >
            {/* Header Stamp */}
            <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-start font-sans">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-slate-700">
                  {currentDoc.type === 'PDS' ? 'PROCESS ENGINEERING DATA SHEET' : 'PROJECT SPECIFICATION'}
                </div>
                <div className="text-base font-bold text-slate-900">{currentDoc.title}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Doc No: {currentDoc.documentNumber} · Rev: {currentDoc.revision}
                </div>
              </div>
              <div className="text-right text-[11px] font-mono border border-slate-900 px-2 py-1">
                <div>TAG: {currentDoc.equipmentTag}</div>
                <div>PAGE: {currentPage} / {currentDoc.totalPages}</div>
              </div>
            </div>

            {/* Document Body Text & Coordinates */}
            <div className="flex-1 whitespace-pre-line font-mono text-xs leading-loose text-slate-800">
              {pageData?.text || 'No text extracted on this page.'}
            </div>

            {/* Simulated Bounding Boxes / Traceability Highlights */}
            {pageData?.highlightBoxes?.map((box, idx) => {
              const isSelected = activeHighlightParam === box.parameterName;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveHighlightParam(box.parameterName)}
                  style={{
                    top: `${box.y + 12}%`,
                    left: `${box.x}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                  className={`absolute rounded transition-all cursor-pointer pointer-events-auto flex items-start px-2 py-0.5 text-[10px] font-sans font-semibold ${
                    isSelected
                      ? 'bg-amber-300/40 border-2 border-amber-600 text-amber-900 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-blue-100/30 border border-blue-400 text-blue-900 hover:bg-blue-200/50'
                  }`}
                >
                  <span className="bg-slate-900 text-white px-1 py-0.2 rounded text-[9px] mr-1">
                    SOURCE REF
                  </span>
                  <span className="truncate">{box.label}</span>
                </div>
              );
            })}

            {/* Document Footer */}
            <div className="border-t border-slate-300 pt-3 mt-6 flex justify-between items-center text-[10px] font-sans text-slate-500">
              <div>CONFIDENTIAL · PETRONOVA GLOBAL COMPLEX</div>
              <div className="font-mono">VERIFIED OCR COORDINATE ENGINE</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Extracted Parameters & Verification Center */}
        <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Extracted Parameters
              </div>
              <div className="text-[11px] text-slate-500">
                Click any parameter to highlight source coordinates
              </div>
            </div>
            <span className="font-mono text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">
              {parameters.length} Fields
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {parameters.map((param) => {
              const isSelected = activeHighlightParam === param.parameterName;
              return (
                <div
                  key={param.id}
                  onClick={() => handleSelectParameter(param)}
                  className={`p-3.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/30 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {param.parameterName}
                      </div>
                      <div className="text-[11px] text-slate-500 uppercase font-mono mt-0.5">
                        {param.category}
                      </div>
                    </div>
                    <StatusBadge status={param.status} size="sm" />
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                      {param.originalValue !== null ? param.originalValue : '—'}
                    </span>
                    {param.originalUnit && (
                      <span className="text-xs text-slate-500 font-mono">
                        {param.originalUnit}
                      </span>
                    )}
                    {param.normalizedValue && param.normalizedUnit && param.normalizedUnit !== param.originalUnit && (
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                        (Norm: {param.normalizedValue} {param.normalizedUnit})
                      </span>
                    )}
                  </div>

                  {/* Traceability Source Badge */}
                  {param.source ? (
                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded flex flex-col gap-0.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {param.source.documentName}
                        </span>
                        <span>p. {param.source.page}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 italic truncate" title={param.source.sourceText}>
                        "{param.source.sourceText}"
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-between">
                        <span>Confidence: {(param.confidence * 100).toFixed(0)}%</span>
                        <span className="underline cursor-pointer">View Source</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded flex items-center gap-1.5 font-mono">
                      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>No source found in preliminary documents</span>
                    </div>
                  )}

                  {/* Conflict Notice if present */}
                  {param.conflicts && param.conflicts.length > 0 && !param.conflicts[0].isResolved && (
                    <div className="mt-2 text-[11px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2 rounded text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                      <div>
                        <div className="font-semibold">Cross-Document Discrepancy</div>
                        <div className="text-[10px] mt-0.5">
                          {param.conflicts[0].source1.value} vs {param.conflicts[0].source2.value}. Resolve in Conflict Center.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
