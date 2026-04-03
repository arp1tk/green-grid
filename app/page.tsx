"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import BookingModal from "./components/BookingModal";

type Equipment = {
  _id: string;
  name: string;
  category: "Tractor" | "Harvester" | "Irrigation" | "Other";
  description?: string;
  location: string;
  status: "available" | "in_use" | "maintenance";
  createdAt?: string;
};

type NewEquipmentPayload = {
  name: string;
  category: Equipment["category"];
  description: string;
  location: string;
  status: Equipment["status"];
};

const defaultFormValues: NewEquipmentPayload = {
  name: "",
  category: "Tractor",
  description: "",
  location: "",
  status: "available",
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

export default function Home() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bookingEquipment, setBookingEquipment] = useState<Equipment | null>(null);
  const [formValues, setFormValues] = useState<NewEquipmentPayload>(
    defaultFormValues
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalAvailable = useMemo(
    () => equipment.filter((item) => item.status === "available").length,
    [equipment]
  );

  const fetchEquipment = async (search = "", category = "", status = "", signal?: AbortSignal) => {
    // Only show loading state for initial load (not for search/filter updates)
    if (!search && !category && !status) {
      setIsLoading(true);
    } else {
      setIsSearching(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (status) params.append("status", status);

      const url = `/api/equipment${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, { 
        cache: "no-store",
        signal: signal,
      });

      if (!response.ok) {
        throw new Error("Unable to load equipment.");
      }

      const data = (await response.json()) as Equipment[];
      setEquipment(data);
    } catch (err) {
      // Don't show error for aborted requests
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Unable to fetch equipment right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Debounce search term (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch when debounced search, category, or status changes
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Fetch with debounced search value
    fetchEquipment(debouncedSearch, filterCategory, filterStatus, abortControllerRef.current.signal);
  }, [debouncedSearch, filterCategory, filterStatus]);

  const handleCreateEquipment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          description: formValues.description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Create request failed.");
      }

      const newItem = (await response.json()) as Equipment;
      setEquipment((prev) => [newItem, ...prev]);
      setFormValues(defaultFormValues);
      setIsAddOpen(false);
    } catch {
      setError("Unable to add equipment right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200">
                Equipment Management
              </p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                Equipment Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-200 sm:text-base">
                Monitor assets, review status, and keep your inventory current.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddOpen((prev) => !prev)}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
            >
              {isAddOpen ? "Close" : "Add Equipment"}
            </button>
          </div>
        </div>

        {isAddOpen && (
          <form
            onSubmit={handleCreateEquipment}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900">Add Equipment</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-700">
                Name
                <input
                  required
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring"
                />
              </label>

              <label className="text-sm text-slate-700">
                Location
                <input
                  required
                  value={formValues.location}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring"
                />
              </label>

              <label className="text-sm text-slate-700">
                Category
                <select
                  value={formValues.category}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      category: e.target.value as Equipment["category"],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 focus:ring"
                >
                  <option value="Tractor">Tractor</option>
                  <option value="Harvester">Harvester</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="text-sm text-slate-700">
                Status
                <select
                  value={formValues.status}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      status: e.target.value as Equipment["status"],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 focus:ring"
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block text-sm text-slate-700">
              Description
              <textarea
                value={formValues.description}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring"
                placeholder="Optional notes about this equipment"
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Equipment"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Search & Filter</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm text-slate-700">
                Search Equipment
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-teal-500 focus:ring"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600"></div>
                  )}
                </div>
              </label>
            </div>

            <label className="text-sm text-slate-700">
              Category
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 focus:ring"
              >
                <option value="">All Categories</option>
                <option value="Tractor">Tractor</option>
                <option value="Harvester">Harvester</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="text-sm text-slate-700">
              Status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-teal-500 focus:ring"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("");
                  setFilterStatus("");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Assets</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{equipment.length}</p>
            {(searchTerm || filterCategory || filterStatus) && (
              <p className="mt-1 text-xs text-slate-500">Filtered results</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Available</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">{totalAvailable}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Needs Attention</p>
            <p className="mt-1 text-2xl font-semibold text-rose-700">
              {
                equipment.filter(
                  (item) => item.status === "maintenance" || item.status === "in_use"
                ).length
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Loading equipment...
          </div>
        ) : equipment.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
            {searchTerm || filterCategory || filterStatus ? (
              <>
                <p>No equipment matches your search criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("");
                    setFilterStatus("");
                  }}
                  className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Clear filters to see all equipment
                </button>
              </>
            ) : (
              <>
                No equipment found. Use the <span className="font-semibold">Add Equipment</span>{" "}
                button to create your first asset.
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {equipment.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/equipment/${item._id}`}
                      className="text-lg font-semibold text-slate-900 transition hover:text-teal-700"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-slate-500">{item.category}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClassMap[item.status]}`}
                  >
                    {statusLabelMap[item.status]}
                  </span>
                </div>

                <p className="text-sm text-slate-600">
                  {item.description?.trim() || "No description provided."}
                </p>

                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-900">Location:</span> {item.location}
                  </p>
                  <p className="text-slate-500">
                    Added{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "recently"}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/equipment/${item._id}`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    View Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingEquipment(item)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 ${
                      item.status === "in_use"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-teal-600 hover:bg-teal-700"
                    }`}
                  >
                    {item.status === "in_use"
                      ? "Currently in use, book future dates"
                      : "Book Equipment"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <BookingModal
          open={Boolean(bookingEquipment)}
          equipmentId={bookingEquipment?._id ?? ""}
          equipmentName={bookingEquipment?.name ?? ""}
          onClose={() => setBookingEquipment(null)}
        />
      </section>
    </main>
  );
}
