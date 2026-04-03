"use client";

import { FormEvent, useState } from "react";

type BookingRecord = {
  _id: string;
  equipmentId: string;
  userName: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
  createdAt?: string;
};

type BookingFormProps = {
  equipmentId: string;
  equipmentName: string;
  compact?: boolean;
  onBooked?: (booking: BookingRecord) => void;
};

const initialValues = {
  userName: "",
  startDate: "",
  endDate: "",
};

export default function BookingForm({
  equipmentId,
  equipmentName,
  compact = false,
  onBooked,
}: BookingFormProps) {
  const [formValues, setFormValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId,
          userName: formValues.userName.trim(),
          startDate: formValues.startDate,
          endDate: formValues.endDate,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | BookingRecord
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload && "message" in payload && payload.message
            ? payload.message
            : "Unable to create booking."
        );
      }

      const booking = payload as BookingRecord;
      setFormValues(initialValues);
      setSuccess(`Booked ${equipmentName} for ${booking.userName}.`);
      onBooked?.(booking);
    } catch (bookingError) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to create booking right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerClassName = compact
    ? "mt-4 rounded-xl border border-teal-100 bg-teal-50/60 p-4"
    : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

  return (
    <form onSubmit={handleSubmit} className={containerClassName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`font-semibold text-slate-900 ${compact ? "text-base" : "text-xl"}`}>
            Book {equipmentName}
          </h3>
          <p className={`mt-1 text-slate-600 ${compact ? "text-xs" : "text-sm"}`}>
            Reserve this equipment by adding your name and booking dates.
          </p>
        </div>
      </div>

      <div className={compact ? "mt-4 grid gap-3" : "mt-5 grid gap-4 sm:grid-cols-2"}>
        <label className="text-sm text-slate-700">
          Your Name
          <input
            required
            value={formValues.userName}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, userName: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring"
            placeholder="Jane Doe"
          />
        </label>

        <label className="text-sm text-slate-700">
          Start Date
          <input
            required
            type="date"
            value={formValues.startDate}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring"
          />
        </label>

        <label className={`text-sm text-slate-700 ${compact ? "" : "sm:col-span-2"}`}>
          End Date
          <input
            required
            type="date"
            value={formValues.endDate}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring"
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  );
}