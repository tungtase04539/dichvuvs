"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, timeSlots, districts } from "@/lib/utils";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  icon: string | null;
}

interface BookingFormProps {
  services: Service[];
  preselectedServiceId?: string;
}

export default function BookingForm({ services, preselectedServiceId }: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    serviceId: preselectedServiceId || "",
    quantity: 1,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    district: "",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  });

  const selectedService = services.find((s) => s.id === formData.serviceId);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    return selectedService.price * formData.quantity;
  };

  const validateStep = (currentStep: number) => {
    setError("");

    if (currentStep === 1) {
      if (!formData.serviceId) {
        setError("Vui lòng chọn dịch vụ");
        return false;
      }
      if (formData.quantity < 1) {
        setError("Số lượng phải lớn hơn 0");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.customerName.trim()) {
        setError("Vui lòng nhập họ tên");
        return false;
      }
      if (!formData.customerPhone.trim()) {
        setError("Vui lòng nhập số điện thoại");
        return false;
      }
      if (!/^[0-9]{10,11}$/.test(formData.customerPhone.replace(/\s/g, ""))) {
        setError("Số điện thoại không hợp lệ");
        return false;
      }
      if (!formData.address.trim()) {
        setError("Vui lòng nhập địa chỉ");
        return false;
      }
      if (!formData.district) {
        setError("Vui lòng chọn quận/huyện");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.scheduledDate) {
        setError("Vui lòng chọn ngày thực hiện");
        return false;
      }
      if (!formData.scheduledTime) {
        setError("Vui lòng chọn khung giờ");
        return false;
      }

      const selectedDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError("Ngày thực hiện không thể trong quá khứ");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          basePrice: selectedService?.price || 0,
          totalPrice: calculateTotal(),
          unit: selectedService?.unit || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đã có lỗi xảy ra");
      }

      router.push(`/dat-lich/thanh-cong?orderCode=${data.order.orderCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="card p-8">
      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                step >= s
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={cn(
                  "w-16 md:w-24 h-1 mx-2 rounded transition-all",
                  step > s ? "bg-primary-500" : "bg-slate-100"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Choose service */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">
            Chọn dịch vụ
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {services.map((service) => (
              <label
                key={service.id}
                className={cn(
                  "card p-4 cursor-pointer transition-all border-2",
                  formData.serviceId === service.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-transparent hover:border-slate-200"
                )}
              >
                <input
                  type="radio"
                  name="serviceId"
                  value={service.id}
                  checked={formData.serviceId === service.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{service.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {service.description}
                    </p>
                    <p className="text-primary-600 font-semibold mt-2">
                      {formatCurrency(service.price)}/{service.unit}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedService && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số lượng ({selectedService.unit})
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="input w-32"
              />
              <p className="text-slate-500 text-sm mt-2">
                Tạm tính: <span className="text-primary-600 font-semibold">{formatCurrency(calculateTotal())}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={nextStep} className="btn btn-primary">
              Tiếp tục
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Customer info */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">
            Thông tin liên hệ
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Họ và tên *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="input"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Địa chỉ *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, phường/xã"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quận / Huyện *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- Chọn quận/huyện --</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevStep} className="btn btn-secondary">
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <button onClick={nextStep} className="btn btn-primary">
              Tiếp tục
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">
            Chọn thời gian
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày thực hiện *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={getMinDate()}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Khung giờ *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className={cn(
                      "card p-3 cursor-pointer text-center transition-all border-2",
                      formData.scheduledTime === slot
                        ? "border-primary-500 bg-primary-50"
                        : "border-transparent hover:border-slate-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="scheduledTime"
                      value={slot}
                      checked={formData.scheduledTime === slot}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium text-slate-700">{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Ghi chú thêm (tùy chọn)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Mô tả chi tiết về nhu cầu của bạn..."
                className="input resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevStep} className="btn btn-secondary">
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <button onClick={nextStep} className="btn btn-primary">
              Xác nhận
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="animate-fade-in">
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">
            Xác nhận đơn hàng
          </h2>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Thông tin dịch vụ</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Dịch vụ:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số lượng:</span>
                <span className="font-medium">
                  {formData.quantity} {selectedService?.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Đơn giá:</span>
                <span className="font-medium">
                  {formatCurrency(selectedService?.price || 0)}/{selectedService?.unit}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-slate-900">Tổng cộng:</span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Thông tin khách hàng</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-600">Họ tên:</span>{" "}
                <span className="font-medium">{formData.customerName}</span>
              </p>
              <p>
                <span className="text-slate-600">Điện thoại:</span>{" "}
                <span className="font-medium">{formData.customerPhone}</span>
              </p>
              {formData.customerEmail && (
                <p>
                  <span className="text-slate-600">Email:</span>{" "}
                  <span className="font-medium">{formData.customerEmail}</span>
                </p>
              )}
              <p>
                <span className="text-slate-600">Địa chỉ:</span>{" "}
                <span className="font-medium">
                  {formData.address}, {formData.district}, TP.HCM
                </span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Thời gian thực hiện</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-slate-600">Ngày:</span>{" "}
                <span className="font-medium">
                  {new Date(formData.scheduledDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p>
                <span className="text-slate-600">Khung giờ:</span>{" "}
                <span className="font-medium">{formData.scheduledTime}</span>
              </p>
              {formData.notes && (
                <p>
                  <span className="text-slate-600">Ghi chú:</span>{" "}
                  <span className="font-medium">{formData.notes}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={prevStep} className="btn btn-secondary">
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Đặt lịch ngay
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

