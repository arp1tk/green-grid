"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BookingModal from "../../components/BookingModal";

type Equipment = {
  _id: string;
  name: string;
  category: "Tractor" | "Harvester" | "Irrigation" | "Other";
  description?: string;
  location: string;
  status: "available" | "in_use" | "maintenance";
  specs?: Record<string, unknown>;
  createdAt?: string;
};

type Booking = {
  _id: string;
  equipmentId: string;
  userName: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
  createdAt?: string;
};

const statusLabelMap: Record<Equipment["status"], string> = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
};

const statusClassMap: Record<Equipment["status"], string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  in_use: "bg-amber-100 text-amber-700 border-amber-200",
  maintenance: "bg-rose-100 text-rose-700 border-rose-200",
};

const bookingStatusClassMap: Record<Booking["status"], string> = {
  active: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
};

const bookingStatusLabelMap: Record<Booking["status"], string> = {
  active: "Active",
  completed: "Completed",
};

export default function EquipmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort(
        (left, right) =>
          new Date(left.startDate).getTime() - new Date(right.startDate).getTime()
      ),
    [bookings]
  );

  const refreshBookings = async () => {
    const bookingRes = await fetch(`/api/booking?equipmentId=${id}`, {
      cache: "no-store",
    });

    if (bookingRes.ok) {
      const bookingData = (await bookingRes.json()) as Booking[];
      setBookings(bookingData);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const equipmentRes = await fetch(`/api/equipment/${id}`, {
          cache: "no-store",
        });

        if (!equipmentRes.ok) {
          throw new Error("Equipment not found.");
        }

        const equipmentData = (await equipmentRes.json()) as Equipment;
        setEquipment(equipmentData);

        const bookingRes = await fetch(`/api/booking?equipmentId=${id}`, {
          cache: "no-store",
        });

        if (bookingRes.ok) {
          const bookingData = (await bookingRes.json()) as Booking[];
          setBookings(bookingData);
        }
      } catch {
        setError("Unable to load equipment details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
        <section className="mx-auto w-full max-w-4xl">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading equipment details...
          </div>
        </section>
      </main>
    );
  }

  if (error || !equipment) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
        <section className="mx-auto w-full max-w-4xl">
          <Link
            href="/"
            className="mb-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            ← Back to Dashboard
          </Link>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error || "Equipment not found."}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {equipment.name}
              </h1>
              <p className="mt-2 text-lg text-slate-600">{equipment.category}</p>
              <p className="mt-1 text-sm text-slate-500">
                ID: <span className="font-mono text-slate-700">{equipment._id}</span>
              </p>
            </div>
            <span
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusClassMap[equipment.status]}`}
            >
              {statusLabelMap[equipment.status]}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 ${
                equipment.status === "in_use"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {equipment.status === "in_use"
                ? "Currently in use, book future dates"
                : "Book Now"}
            </button>
          </div>

         

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-600">Location</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {equipment.location}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-600">Added</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {equipment.createdAt
                  ? new Date(equipment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </div>

          {equipment.description && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Description
              </h2>
              <p className="mt-3 text-slate-700">{equipment.description}</p>
            </div>
          )}

          {equipment.specs && Object.keys(equipment.specs).length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Specifications
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {Object.entries(equipment.specs).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-600">{key}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Booking History</h2>
          <p className="mt-1 text-sm text-slate-600">
            All bookings for this equipment
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Booking Timeline
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              View booked date ranges before making a new reservation.
            </p>

            {sortedBookings.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                No booked dates yet. You can reserve this equipment now.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {sortedBookings.map((booking) => {
                  const startDate = new Date(booking.startDate);
                  const endDate = new Date(booking.endDate);

                  return (
                    <div
                      key={`timeline-${booking._id}`}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Booked by {booking.userName}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {startDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })} - {endDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded-full border px-2 py-1 text-xs font-medium ${bookingStatusClassMap[booking.status]}`}
                      >
                        {bookingStatusLabelMap[booking.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {sortedBookings.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
              No bookings yet for this equipment.
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                        User Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                        Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                        End Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-700">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedBookings.map((booking) => {
                      const startDate = new Date(booking.startDate);
                      const endDate = new Date(booking.endDate);
                      const durationDays = Math.ceil(
                        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <tr
                          key={booking._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {booking.userName}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {startDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {endDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block rounded-full border px-2 py-1 text-xs font-medium ${bookingStatusClassMap[booking.status]}`}
                            >
                              {bookingStatusLabelMap[booking.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {durationDays} day{durationDays !== 1 ? "s" : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-600">
                Total Bookings
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {sortedBookings.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-600">
                Active Bookings
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-600">
                {sortedBookings.filter((b) => b.status === "active").length}
              </p>
            </div>
          </div>
        </div>

        <BookingModal
          open={isBookingOpen}
          equipmentId={equipment._id}
          equipmentName={equipment.name}
          onClose={() => setIsBookingOpen(false)}
          onBooked={() => {
            refreshBookings();
          }}
        />
      </section>
    </main>
  );
}
