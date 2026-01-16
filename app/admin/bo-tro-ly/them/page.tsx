"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function AddBundlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    price: "",
    priceGold: "",
    pricePlatinum: "",
    image: "",
    videoUrl: "",
    featured: false,
    industry: "",
    chatbotLink: "",
    chatbotLinkGold: "",
    chatbotLinkPlatinum: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/admin/bo-tro-ly");
      } else {
        const data = await res.json();
        alert(data.error || "Lỗi tạo bộ trợ lý");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/bo-tro-ly"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thêm Bộ Trợ Lý</h1>
          <p className="text-slate-500">Tạo bộ trợ lý mới theo ngành nghề</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
            Thông tin cơ bản
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên bộ trợ lý *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={generateSlug}
                className="input"
                placeholder="Bộ Trợ Lý Marketing"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="input"
                placeholder="bo-tro-ly-marketing"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả ngắn *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows={2}
              placeholder="Bộ công cụ AI hỗ trợ marketing cho doanh nghiệp"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả chi tiết (HTML/Markdown)
            </label>
            <textarea
              name="longDescription"
              value={formData.longDescription}
              onChange={handleChange}
              className="input font-mono text-sm"
              rows={5}
              placeholder="<h3>Tính năng nổi bật</h3>..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ngành nghề
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- Chọn ngành --</option>
                <option value="marketing">Marketing</option>
                <option value="education">Giáo dục</option>
                <option value="ecommerce">Thương mại điện tử</option>
                <option value="healthcare">Y tế</option>
                <option value="finance">Tài chính</option>
                <option value="realestate">Bất động sản</option>
                <option value="food">Ẩm thực</option>
                <option value="travel">Du lịch</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                id="featured"
                className="w-4 h-4 text-primary-600"
              />
              <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                Nổi bật (hiển thị trên trang chủ)
              </label>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
            Giá các gói
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Giá Standard *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input"
                placeholder="99000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Giá Gold
              </label>
              <input
                type="number"
                name="priceGold"
                value={formData.priceGold}
                onChange={handleChange}
                className="input"
                placeholder="199000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Giá Platinum
              </label>
              <input
                type="number"
                name="pricePlatinum"
                value={formData.pricePlatinum}
                onChange={handleChange}
                className="input"
                placeholder="399000"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
            Hình ảnh & Video
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL Ảnh đại diện
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL Video demo
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Delivery Links */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
            Link bàn giao
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link Standard
              </label>
              <input
                type="url"
                name="chatbotLink"
                value={formData.chatbotLink}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link Gold
              </label>
              <input
                type="url"
                name="chatbotLinkGold"
                value={formData.chatbotLinkGold}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link Platinum
              </label>
              <input
                type="url"
                name="chatbotLinkPlatinum"
                value={formData.chatbotLinkPlatinum}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <Link href="/admin/bo-tro-ly" className="btn btn-secondary">
            Hủy
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Tạo bộ trợ lý
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
