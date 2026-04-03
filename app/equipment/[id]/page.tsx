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
  available: "border border-emerald-200 bg-emerald-50/80 text-emerald-700",
  in_use: "border border-amber-200 bg-amber-50/80 text-amber-700",
  maintenance: "border border-rose-200 bg-rose-50/80 text-rose-700",
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
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-4xl">
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            Loading equipment details...
          </div>
        </section>
      </main>
    );
  }

  if (error || !equipment) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-4xl">
          <Link
            href="/"
            className="mb-4 inline-block text-sm font-medium text-accent-foreground hover:text-foreground"
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
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-accent-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {equipment.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">{equipment.category}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ID: <span className="font-mono text-accent-foreground">{equipment._id}</span>
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClassMap[equipment.status]}`}
            >
              {statusLabelMap[equipment.status]}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                equipment.status === "in_use"
                  ? "border border-amber-200 bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              {equipment.status === "in_use"
                ? "Currently in use, book future dates"
                : "Book Now"}
            </button>
          </div>

         

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {equipment.location}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Added</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
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
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h2>
              <p className="mt-3 text-accent-foreground">{equipment.description}</p>
            </div>
          )}

          {equipment.specs && Object.keys(equipment.specs).length > 0 && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Specifications
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {Object.entries(equipment.specs).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{key}</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Booking History</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All bookings for this equipment
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-accent-foreground">
              Booking Timeline
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              View booked date ranges before making a new reservation.
            </p>

            {sortedBookings.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
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
                      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Booked by {booking.userName}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
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
            <div className="mt-5 rounded-xl border border-dashed border-border bg-white p-6 text-center text-muted-foreground">
              No bookings yet for this equipment.
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-accent-foreground">
                        User Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-accent-foreground">
                        Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-accent-foreground">
                        End Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-accent-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-accent-foreground">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sortedBookings.map((booking) => {
                      const startDate = new Date(booking.startDate);
                      const endDate = new Date(booking.endDate);
                      const durationDays = Math.ceil(
                        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <tr
                          key={booking._id}
                          className="transition hover:bg-muted/45"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {booking.userName}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {startDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
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
                          <td className="px-4 py-3 text-sm text-muted-foreground">
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
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total Bookings
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {sortedBookings.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Active Bookings
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">
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
