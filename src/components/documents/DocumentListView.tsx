import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EngineeringDocument } from '../../types';
import { Files, UploadCloud, FileText, CheckCircle2, Search, ExternalLink, ShieldCheck, Hash } from 'lucide-react';

export const DocumentListView: React.FC = () => {
  const { documents, addDocument, setSelectedDocId, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulatedUpload = (fileType: 'PDF' | 'XLSX' | 'DOCX') => {
    setIsUploading(true);
    setTimeout(() => {
      const mockDoc: EngineeringDocument = {
        id: `doc-${Date.now()}`,
        title: `Vendor Deviation Statement - ${fileType}`,
        documentNumber: `DEV-STMT-${Date.now().toString().slice(-4)}`,
        revision: 'Rev 0',
        type: 'VENDOR_OFFER',
        fileFormat: fileType,
        fileSize: '1.8 MB',
        hash: 'b4a8c9e1f2a3d4c5b6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
        issueDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'David Chen, PE',
        uploadedAt: new Date().toISOString(),
        totalPages: 3,
        equipmentTag: 'V-101',
        extractedParametersCount: 6,
        contentSnippet: 'Vendor technical offer clarifications and materials qualification certificates for SA-240 SS316L.',
        pages: [
          {
            pageNumber: 1,
            text: 'VENDOR TECHNICAL PROPOSAL & COMPLIANCE SCHEDULE\nItem: V-101 Flash Drum Separator\nStandard Fabrication Guarantee.',
          },
        ],
      };
      addDocument(mockDoc);
      setIsUploading(false);
    }, 800);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      {/* Header and Ingestion Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Files className="w-5 h-5 text-blue-600" />
            Engineering Document Ingestion & Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically hashed (SHA-256) source documents. PDS, Project Specifications, and Vendor Submittals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulatedUpload('PDF')}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Ingesting & Hashing...' : 'Ingest Specification (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by document title, number, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Document Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-4 font-semibold">Document Title / Doc No.</th>
              <th className="py-2.5 px-3 font-semibold">Type</th>
              <th className="py-2.5 px-3 font-semibold">Format</th>
              <th className="py-2.5 px-3 font-semibold">Pages</th>
              <th className="py-2.5 px-4 font-semibold">SHA-256 Hash</th>
              <th className="py-2.5 px-3 font-semibold">Uploaded By</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{doc.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {doc.documentNumber} · {doc.revision} · {doc.fileSize}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {doc.type}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {doc.fileFormat}
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {doc.totalPages} pp
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[140px]" title={doc.hash}>{doc.hash}</span>
                    <span title="Integrity Verified">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div>{doc.uploadedBy}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{doc.issueDate}</div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setActiveTab('document_viewer');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded text-xs font-medium transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
