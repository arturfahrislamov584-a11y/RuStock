import { useState, useCallback } from 'react';
import {
  Upload, X, FileImage, FileVideo, File, Check,
  Tag, AlignLeft, Hash
} from 'lucide-react';
import type { UploadProgress, ContentCategory } from '../types';

const uploadCategories = [
  'Бизнес', 'Технологии', 'Природа', 'Люди', 'Еда',
  'Путешествия', 'Мода', 'Архитектура', 'Абстракция', 'Шаблоны', 'Мокеты',
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const simulateMetadata = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const formats: Record<string, string> = {
      jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', webp: 'WebP',
      svg: 'SVG', psd: 'PSD', ai: 'AI', mp4: 'MP4', mov: 'MOV',
    };
    return {
      format: formats[ext || ''] || ext?.toUpperCase() || 'Unknown',
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      resolution: '4000x3000',
    };
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const updates: UploadProgress[] = arr.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        ...simulateMetadata(file),
        category: uploadCategories[Math.floor(Math.random() * uploadCategories.length)].toLowerCase() as ContentCategory,
      },
    }));
    setFiles((prev) => [...prev, ...updates]);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const updateMetadata = (index: number, field: string, value: string) => {
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, metadata: { ...f.metadata, [field]: value } } : f
      )
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async (index: number) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'uploading', progress: 0 } : f))
    );

    for (let p = 0; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 200));
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, progress: p } : f))
      );
    }

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'processing' } : f))
    );

    await new Promise((r) => setTimeout(r, 1500));

    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'done', progress: 100 } : f))
    );
  };

  const uploadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        await simulateUpload(i);
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return FileImage;
    if (type.startsWith('video/')) return FileVideo;
    return File;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Загрузка контента</h1>
        <p className="text-sm text-text-muted">
          Загружайте фото, видео, векторы и шаблоны. Метаданные парсятся автоматически.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-border-light bg-dark-700/50'
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*,video/*,.psd,.ai,.svg,.pptx,.key"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <Upload className={`w-10 h-10 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-text-muted'}`} />
        <p className="text-sm font-medium mb-1">
          {dragActive ? 'Отпустите файлы' : 'Перетащите файлы сюда или нажмите для выбора'}
        </p>
        <p className="text-xs text-text-muted">
          JPG, PNG, WebP, SVG, PSD, MP4, MOV — до 100MB каждый
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Очередь загрузки ({files.length})</h2>
            <button
              onClick={uploadAll}
              disabled={files.every((f) => f.status !== 'pending')}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Загрузить все
            </button>
          </div>

          {files.map((item, index) => {
            const FileIcon = getFileIcon(item.file.type);
            return (
              <div key={index} className="bg-dark-700 border border-border rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-dark-600 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {item.file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(item.file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileIcon className="w-6 h-6 text-text-muted" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{item.file.name}</span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {item.status === 'done' && (
                          <span className="flex items-center gap-1 text-xs text-accent-green">
                            <Check className="w-3.5 h-3.5" /> Готово
                          </span>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="text-text-muted hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted">
                      {item.metadata?.format} · {item.metadata?.fileSize} · {item.metadata?.resolution}
                    </span>

                    {/* Progress Bar */}
                    {(item.status === 'uploading' || item.status === 'processing') && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-dark-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted mt-1 block">
                          {item.status === 'uploading' ? `Загрузка ${item.progress}%` : 'Обработка метаданных...'}
                        </span>
                      </div>
                    )}

                    {/* Metadata Form */}
                    {item.status === 'pending' && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-text-muted mb-1 flex items-center gap-1">
                            <AlignLeft className="w-3 h-3" /> Название
                          </label>
                          <input
                            type="text"
                            value={item.metadata?.title || ''}
                            onChange={(e) => updateMetadata(index, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 bg-dark-600 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted mb-1 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Категория
                          </label>
                          <select
                            value={item.metadata?.category || ''}
                            onChange={(e) => updateMetadata(index, 'category', e.target.value)}
                            className="w-full px-3 py-1.5 bg-dark-600 border border-border rounded-lg text-xs text-white appearance-none focus:outline-none focus:border-primary"
                          >
                            <option value="">Выберите</option>
                            {uploadCategories.map((c) => (
                              <option key={c} value={c.toLowerCase()}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-text-muted mb-1 flex items-center gap-1">
                            <Hash className="w-3 h-3" /> Теги (через запятую)
                          </label>
                          <input
                            type="text"
                            placeholder="бизнес, офис, команда"
                            onChange={(e) => updateMetadata(index, 'tags', e.target.value)}
                            className="w-full px-3 py-1.5 bg-dark-600 border border-border rounded-lg text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-text-muted mb-1 flex items-center gap-1">
                            <AlignLeft className="w-3 h-3" /> Описание
                          </label>
                          <textarea
                            value={item.metadata?.description || ''}
                            onChange={(e) => updateMetadata(index, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 bg-dark-600 border border-border rounded-lg text-xs text-white focus:outline-none focus:border-primary resize-none h-16"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
