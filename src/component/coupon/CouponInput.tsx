"use client";

import React, { useState } from "react";
import { postData } from "../../services/api-service";
import { getUserToken } from "../../hooks/useApi";

interface CartItemInput {
  productId: string;
  quantity: number;
}

interface CouponInputProps {
  items: CartItemInput[];
  deliveryZone?: string;
  onCouponApplied: (res: {
    valid: boolean;
    couponCode: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
  }) => void;
  onCouponRemoved: () => void;
  appliedCouponCode?: string;
  appliedDiscountAmount?: number;
}

const CouponInput: React.FC<CouponInputProps> = ({
  items,
  deliveryZone = "dhaka",
  onCouponApplied,
  onCouponRemoved,
  appliedCouponCode,
  appliedDiscountAmount = 0
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      setErrorMsg("Please enter a coupon code.");
      return;
    }

    if (!items || items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity) || 1
        })),
        deliveryZone
      };

      const token = getUserToken();
      const res: any = await postData({
        url: "coupons/validate",
        token,
        body: payload
      });
      const data = res?.data || res;

      if (data?.valid || data?.discountAmount !== undefined) {
        onCouponApplied({
          valid: true,
          couponCode: data.couponCode || code.trim().toUpperCase(),
          discountAmount: Number(data.discountAmount) || 0,
          discountType: data.discountType || "PERCENTAGE",
          discountValue: Number(data.discountValue) || 0
        });
        setCode("");
        setErrorMsg("");
      } else {
        setErrorMsg(res?.message || "Invalid coupon code.");
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to validate coupon.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onCouponRemoved();
    setCode("");
    setErrorMsg("");
  };

  return (
    <div className="w-full space-y-2">
      {appliedCouponCode ? (
        <div className="flex items-center justify-between bg-[#218DAE]/10 border border-[#218DAE]/30 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#218DAE] bg-[#218DAE]/15 px-2 py-0.5 rounded border border-[#218DAE]/30">
              {appliedCouponCode}
            </span>
            <span className="font-semibold text-[#218DAE]">
              -৳{appliedDiscountAmount.toFixed(2)} Discount Applied
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[#218DAE] hover:text-red-600 font-bold px-2 py-1 transition cursor-pointer"
            title="Remove Coupon"
          >
            ✕ Remove
          </button>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Have a Promo / Coupon Code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="e.g. EID2026, SAVE20"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none"
            />
            <button
              type="button"
              disabled={loading || !code.trim()}
              onClick={handleApply}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
            >
              {loading ? "Validating..." : "Apply"}
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 p-2 rounded-lg">
          ⚠️ {errorMsg}
        </p>
      )}
    </div>
  );
};

export default CouponInput;
