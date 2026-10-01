import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Power, Trash2, Layers, Tag, Calendar } from 'lucide-react';
import Badge from '../common/Badge';

const DocumentRow = ({ document: doc, onToggle, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete document "${doc.title}"?`)) {
      onDelete(doc.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-clinic hover:shadow-clinic-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
    >
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#005A9C] shadow-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900 font-display">{doc.title}</h3>
              <Badge variant={doc.is_active ? 'success' : 'neutral'} dot>
                {doc.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Category: <strong className="text-slate-700 font-semibold">{doc.category}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Chunks: <strong className="text-slate-700 font-semibold">{doc.chunk_count}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Uploaded: {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onToggle(doc.id)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            doc.is_active
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              : 'bg-emerald-50 text-[#00843D] hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {doc.is_active ? 'Deactivate' : 'Activate'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDelete}
          className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DocumentRow;
