"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Youtube, Star } from "lucide-react";
import FileUpload from "@/components/FileUpload";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    longDescription: "",
    price: "29000",
    image: "",
    videoUrl: "",
    categoryId: "",
    featured: false,
    active: true,
    chatbotLink: "",
    priceGold: "",
    pricePlatinum: "",
    featuresGold: "",
    featuresPlatinum: "",
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Load categories error:", error);
      }
    };
    loadCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Đảm bảo active luôn = true khi thêm sản phẩm mới
      const submitData = {
        ...formData,
        active: true, // Force active = true
      };

      console.log("Submitting product with active:", submitData.active);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Product created successfully:", data.product?.id, "active:", data.product?.active);
        // Trigger storage event để các tab khác biết có update
        if (typeof window !== 'undefined') {
          localStorage.setItem('products-updated', Date.now().toString());
          localStorage.removeItem('products-updated');
        }
        router.push("/admin/san-pham");
        // Force refresh để cập nhật danh sách
        router.refresh();
      } else {
        setError(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/san-pham"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Thêm ChatBot mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên ChatBot <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="VD: ChatBot Bán Hàng Pro"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="chatbot-ban-hang-pro"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lĩnh vực <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- Chọn lĩnh vực --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ảnh đại diện sản phẩm
            </label>
            <FileUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url || "" })}
              folder="products"
            />
            <p className="text-xs text-slate-500 mt-2">
              Ảnh này sẽ hiển thị trong card sản phẩm và trang chi tiết
            </p>
          </div>

          {/* YouTube Video URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <span className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                Link Video Demo (YouTube)
              </span>
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://www.youtube.com/watch?v=xxxxx hoặc https://youtu.be/xxxxx"
            />
            <p className="text-xs text-slate-500 mt-2">
              Dán link YouTube video demo. Hỗ trợ: youtube.com/watch, youtu.be, youtube.com/shorts
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mô tả ngắn
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Mô tả ngắn hiển thị ở danh sách..."
            />
          </div>

          {/* Long Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nội dung chi tiết
            </label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              rows={10}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={`Mô tả chi tiết sản phẩm...

VD:
🚀 Lợi ích:
- Tự động trả lời 24/7
- Tăng tỷ lệ chuyển đổi 300%

📦 Bạn sẽ nhận được:
- 1 ChatBot đã cấu hình
- Hướng dẫn cài đặt
- Hỗ trợ kỹ thuật`}
            />
          </div>

          {/* Chatbot Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link ChatBot mặc định
            </label>
            <input
              type="url"
              value={formData.chatbotLink}
              onChange={(e) => setFormData({ ...formData, chatbotLink: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-primary-600 font-medium"
              placeholder="https://t.me/your_bot..."
            />
            <p className="text-xs text-slate-500 mt-2">
              Link này dùng để bàn giao cho khách hàng (có thể chỉnh sửa sau ở mục Quản lý kho)
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              min="0"
              step="1000"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Gói Dịch Vụ Nâng Cao (Tùy chọn)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gold Package */}
              <div className="space-y-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800">Gói VÀNG (Gold)</h4>
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Giá gói Vàng (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.priceGold}
                    onChange={(e) => setFormData({ ...formData, priceGold: e.target.value })}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="VD: 49000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Ưu đãi gói Vàng (Mỗi dòng 1 ưu đãi)</label>
                  <textarea
                    value={formData.featuresGold}
                    onChange={(e) => setFormData({ ...formData, featuresGold: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none text-sm"
                    placeholder="Hỗ trợ ưu tiên&#10;Update 24/7&#10;Tùy chỉnh giao diện..."
                  />
                </div>
              </div>

              {/* Platinum Package */}
              <div className="space-y-4 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                <h4 className="font-bold text-cyan-800">Gói BẠCH KIM (Platinum)</h4>
                <div>
                  <label className="block text-xs font-bold text-cyan-700 uppercase mb-1">Giá gói Bạch Kim (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.pricePlatinum}
                    onChange={(e) => setFormData({ ...formData, pricePlatinum: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="VD: 99000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-700 uppercase mb-1">Ưu đãi gói Bạch Kim (Mỗi dòng 1 ưu đãi)</label>
                  <textarea
                    value={formData.featuresPlatinum}
                    onChange={(e) => setFormData({ ...formData, featuresPlatinum: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none resize-none text-sm"
                    placeholder="Full tính năng Premium&#10;Bảo hành trọn đời&#10;Hỗ trợ 1-1..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">Sản phẩm nổi bật (HOT)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700">Hiển thị</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Thêm ChatBot
            </button>
            <Link
              href="/admin/san-pham"
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
