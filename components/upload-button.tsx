'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadButtonProps {
    /** 上传成功的回调 — 拿到 public URL 自己塞到 state */
    onUploaded: (url: string) => void;
    /** 按钮文字 (默认: "上传") */
    label?: string;
    /** 接受的 accept 字符串 (默认 image/*) */
    accept?: string;
    /** 紧凑模式: 只显示图标按钮 */
    iconOnly?: boolean;
    /** className 覆盖 */
    className?: string;
}

/**
 * 上传按钮 → POST /api/upload (multipart) → 拿到 R2 public URL
 */
export default function UploadButton({ onUploaded, label = '上传', accept = 'image/*', iconOnly, className }: UploadButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        setErr(null);
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json() as { url?: string; error?: string };
            if (!res.ok || !data.url) {
                setErr(data.error || `Upload failed (${res.status})`);
                return;
            }
            onUploaded(data.url);
        } catch (e) {
            console.error(e);
            setErr('Network error');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-stretch gap-1">
            <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className={className || (iconOnly ? 'h-10 w-10 p-0 shrink-0' : 'h-10 px-3 shrink-0')}
            >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {!iconOnly && <span className="ml-1.5 text-sm">{label}</span>}
            </Button>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                }}
            />
            {err && <div className="text-[10px] text-red-400 truncate">{err}</div>}
        </div>
    );
}
