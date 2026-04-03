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
  available: "border border-emerald-200 bg-emerald-50/80 text-emerald-700",
  in_use: "border border-amber-200 bg-amber-50/80 text-amber-700",
  maintenance: "border border-rose-200 bg-rose-50/80 text-rose-700",
};

const categoryLabelMap: Record<Equipment["category"], string> = {
	Tractor: "Tractor",
	Harvester: "Harvester",
	Irrigation: "Irrigation",
	Other: "Other",
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

	const totalActive = useMemo(
		() => equipment.filter((item) => item.status === "in_use").length,
		[equipment]
	);

	const maintenanceCount = useMemo(
		() => equipment.filter((item) => item.status === "maintenance").length,
		[equipment]
	);

	const isFiltersActive = Boolean(searchTerm || filterCategory || filterStatus);

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

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
		<main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
			<section className="mx-auto w-full max-w-7xl">
				<div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
					<aside className="lg:sticky lg:top-6 lg:self-start">
						<div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
								Equipment Management
							</p>
							<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
								Equipment Dashboard
							</h1>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								Track inventory status, search quickly, and manage bookings from one place.
							</p>

							<button
								type="button"
								onClick={() => setIsAddOpen((prev) => !prev)}
								className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
							>
								{isAddOpen ? "Close Form" : "Add Equipment"}
							</button>

							<div className="mt-6 grid gap-3">
								<div className="rounded-2xl bg-muted/45 p-4">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Total Assets</p>
									<p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{equipment.length}</p>
								</div>
								<div className="rounded-2xl bg-muted/45 p-4">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Available</p>
									<p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700">{totalAvailable}</p>
								</div>
								<div className="rounded-2xl bg-muted/45 p-4">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Needs Attention</p>
									<p className="mt-2 text-2xl font-semibold tracking-tight text-rose-700">
										{maintenanceCount + totalActive}
									</p>
								</div>
							</div>
						</div>
					</aside>

					<div className="space-y-6">
						<header className="sticky top-4 z-10 rounded-3xl border border-border bg-card/95 px-4 py-4 shadow-sm backdrop-blur sm:px-5">
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
											Overview
										</p>
										<p className="mt-1 text-sm text-muted-foreground">
											Use the toolbar to search or narrow results by status.
										</p>
									</div>
									{isSearching && (
										<span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-accent-foreground">
											Searching...
										</span>
									)}
								</div>

								<div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
									<label className="relative block">
										<span className="sr-only">Search equipment</span>
										<input
											type="text"
											placeholder="Search by name or description"
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="h-11 w-full rounded-xl border border-input bg-background px-4 pr-10 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
										/>
										<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
											Search
										</span>
									</label>

									<select
										value={filterCategory}
										onChange={(e) => setFilterCategory(e.target.value)}
										className="h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
									>
										<option value="">All Categories</option>
										{Object.keys(categoryLabelMap).map((category) => (
											<option key={category} value={category}>
												{categoryLabelMap[category as Equipment["category"]]}
											</option>
										))}
									</select>

									<select
										value={filterStatus}
										onChange={(e) => setFilterStatus(e.target.value)}
										className="h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
									>
										<option value="">All Statuses</option>
										<option value="available">Available</option>
										<option value="in_use">In Use</option>
										<option value="maintenance">Maintenance</option>
									</select>

									<button
										type="button"
										onClick={() => {
											setSearchTerm("");
											setFilterCategory("");
											setFilterStatus("");
										}}
										className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-medium text-accent-foreground transition hover:bg-muted"
									>
										Clear
									</button>
								</div>
							</div>
						</header>

						{error && (
							<div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
								{error}
							</div>
						)}

						<div>
							<div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
								<div>
									<h2 className="text-lg font-semibold tracking-tight text-foreground">Equipment</h2>
									<p className="mt-1 text-sm text-muted-foreground">
										{isFiltersActive ? "Filtered inventory results" : "Complete inventory list"}
									</p>
								</div>
								<span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-accent-foreground">
									{equipment.length} items
								</span>
							</div>

							{isLoading ? (
								<div className="px-5 py-14 text-center text-sm text-muted-foreground sm:px-6">
									Loading equipment...
								</div>
							) : equipment.length === 0 ? (
								<div className="px-6 py-16 text-center sm:px-8">
									<div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-background px-6 py-10">
										<p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
											{isFiltersActive ? "No results" : "Empty inventory"}
										</p>
										<h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
											{isFiltersActive
												? "Nothing matches your current filters"
												: "Add your first equipment item"}
										</h3>
										<p className="mt-3 text-sm leading-6 text-muted-foreground">
											{isFiltersActive
												? "Try clearing the filters or changing the search term."
												: "Create the first asset to start tracking availability and bookings."}
										</p>
										{isFiltersActive ? (
											<button
												type="button"
												onClick={() => {
													setSearchTerm("");
													setFilterCategory("");
													setFilterStatus("");
												}}
												className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-95"
											>
												Clear filters
											</button>
										) : (
											<button
												type="button"
												onClick={() => setIsAddOpen(true)}
												className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-95"
											>
												Add equipment
											</button>
										)}
									</div>
								</div>
							) : (
								<div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-6 items-stretch">
									{equipment.map((item) => (
										<article
											key={item._id}
											className="group flex h-full flex-col rounded-3xl border border-white/60 bg-white/65 p-6 shadow-[0_14px_36px_rgb(15_23_42/0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-white/80 hover:shadow-[0_20px_44px_rgb(15_23_42/0.12)]"
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
														{item.category}
													</p>
													<Link
														href={`/equipment/${item._id}`}
														className="mt-2 block truncate text-lg font-semibold tracking-tight text-foreground transition hover:text-primary"
													>
														{item.name}
													</Link>
												</div>
												<span
													className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusClassMap[item.status]}`}
												>
													{statusLabelMap[item.status]}
												</span>
											</div>

											<p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
												{item.description?.trim() || "No description provided."}
											</p>

											<div className="mt-5 flex items-center justify-between gap-3 border-t border-white/60 pt-4 text-sm">
												<div>
													<p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
													<p className="mt-1 font-medium text-foreground">{item.location}</p>
												</div>
												<p className="text-right text-xs uppercase tracking-wide text-muted-foreground">
													Added {" "}
													<span className="block text-sm font-medium normal-case tracking-tight text-foreground">
														{item.createdAt
															? new Date(item.createdAt).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
																year: "numeric",
															})
															: "Recently"}
													</span>
												</p>
											</div>

											<div className="mt-auto flex items-center gap-2 pt-5">
												<Link
													href={`/equipment/${item._id}`}
													className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-white"
												>
													Details
												</Link>
												<button
													type="button"
													onClick={() => setBookingEquipment(item)}
													className={`inline-flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
														item.status === "in_use"
															? "border border-amber-200 bg-amber-500 text-slate-950 hover:bg-amber-400"
															: "bg-slate-950 text-white hover:bg-slate-800"
													}`}
												>
													{item.status === "in_use" ? "Book Future" : "Book Now"}
												</button>
											</div>
										</article>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{isAddOpen && (
					<div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm px-4 py-6">
						<div className="mx-auto flex h-full w-full max-w-2xl items-center justify-center">
							<form
								onSubmit={handleCreateEquipment}
								className="max-h-[calc(100vh-3rem)] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_rgb(15_23_42/0.18)] sm:p-6"
							>
								<div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
									<div>
										<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
											New Equipment
										</p>
										<h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
											Add Equipment
										</h2>
										<p className="mt-2 text-sm text-muted-foreground">
											Keep the setup minimal and consistent with the inventory system.
										</p>
									</div>
									<button
										type="button"
										onClick={() => setIsAddOpen(false)}
										className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
									>
										Close
									</button>
								</div>

								<div className="mt-5 grid gap-4 sm:grid-cols-2">
									<label className="text-sm text-foreground">
										Name
										<input
											required
											value={formValues.name}
											onChange={(e) =>
												setFormValues((prev) => ({ ...prev, name: e.target.value }))
											}
											className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
										/>
									</label>

									<label className="text-sm text-foreground">
										Location
										<input
											required
											value={formValues.location}
											onChange={(e) =>
												setFormValues((prev) => ({ ...prev, location: e.target.value }))
											}
											className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
										/>
									</label>

									<label className="text-sm text-foreground">
										Category
										<select
											value={formValues.category}
											onChange={(e) =>
												setFormValues((prev) => ({
													...prev,
													category: e.target.value as Equipment["category"],
												}))
											}
											className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
										>
											<option value="Tractor">Tractor</option>
											<option value="Harvester">Harvester</option>
											<option value="Irrigation">Irrigation</option>
											<option value="Other">Other</option>
										</select>
									</label>

									<label className="text-sm text-foreground">
										Status
										<select
											value={formValues.status}
											onChange={(e) =>
												setFormValues((prev) => ({
													...prev,
													status: e.target.value as Equipment["status"],
												}))
											}
											className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
										>
											<option value="available">Available</option>
											<option value="in_use">In Use</option>
											<option value="maintenance">Maintenance</option>
										</select>
									</label>
								</div>

								<label className="mt-4 block text-sm text-foreground">
									Description
									<textarea
										value={formValues.description}
										onChange={(e) =>
											setFormValues((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										rows={4}
										className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/15"
										placeholder="Optional notes about this equipment"
									/>
								</label>

								<div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-5">
									<button
										type="button"
										onClick={() => setIsAddOpen(false)}
										className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isSaving}
										className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
									>
										{isSaving ? "Saving..." : "Save Equipment"}
									</button>
								</div>
							</form>
						</div>
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