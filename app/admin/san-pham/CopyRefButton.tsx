"use client";

import { Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface CopyRefButtonProps {
    slug: string;
    refCode: string;
}

export default function CopyRefButton({ slug, refCode }: CopyRefButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const url = `${window.location.origin}/san-pham/${slug}?ref=${refCode}`;
        navigator.clipboard.writeText(url);
        toast.success("Đã sao chép link giới thiệu!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
            title="Lấy link giới thiệu"
        >
            {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            Lấy Link
        </button>
    );
}
