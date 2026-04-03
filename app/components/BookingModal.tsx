"use client";

import { useEffect } from "react";
import BookingForm from "./BookingForm";

type BookingModalProps = {
  open: boolean;
  equipmentId: string;
  equipmentName: string;
  onClose: () => void;
  onBooked?: () => void;
};

export default function BookingModal({
  open,
  equipmentId,
  equipmentName,
  onClose,
  onBooked,
}: BookingModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-700">
              Equipment Booking
            </p>
            <h2 id="booking-modal-title" className="mt-1 text-2xl font-semibold text-slate-900">
              Book {equipmentName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-5 sm:px-6">
          <BookingForm
            key={equipmentId}
            equipmentId={equipmentId}
            equipmentName={equipmentName}
            onBooked={() => {
              onBooked?.();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}