"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
const [bookings, setBookings] = useState<any[]>([]);
const [contacts, setContacts] = useState<any[]>([]);
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("all");
const router = useRouter();
useEffect(() => {
  checkUser();
}, []);

async function checkUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    router.push("/login");
    return;
  }

  fetchBookings();
  fetchContacts();
}

async function fetchBookings() {
const { data } = await supabase
.from("appointments")
.select("*")
.order("id", { ascending: false });

if (data) setBookings(data);

}

async function fetchContacts() {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("id", { ascending: false });

  console.log("CONTACTS:", data);
  console.log("ERROR:", error);

  if (data) setContacts(data);
}

async function updateStatus(id: number, status: string) {
await supabase
.from("appointments")
.update({ status })
.eq("id", id);

fetchBookings();

}

async function deleteBooking(id: number) {
if (!confirm("Are you sure you want to delete this booking?")) return;

await supabase
  .from("appointments")
  .delete()
  .eq("id", id);

fetchBookings();

}
async function logout() {
  await supabase.auth.signOut();
  router.push("/login");
}
async function deleteContact(id: number) {
  if (!confirm("Delete this message?")) return;

  await supabase
    .from("contacts")
    .delete()
    .eq("id", id);

  fetchContacts();
}

return (
  <div className="min-h-screen bg-zinc-950 text-white p-8">
<div className="flex justify-between items-center mb-6">
  <h1 className="text-4xl font-bold">
    Bella & Guy Admin Panel
  </h1>

  <button
    onClick={logout}
    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
  >
    Logout
  </button>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
  <div className="bg-purple-900/40 border border-purple-700 p-4 rounded-xl">
  <h3>Contact Messages</h3>
  <p className="text-3xl font-bold">
    {contacts.length}
  </p>
</div>

 <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-lg">
  <h3 className="text-zinc-400 text-sm uppercase">
    Total Bookings
  </h3>

  <p className="text-4xl font-bold mt-2">
    {bookings.length}
  </p>
</div>

  <div className="bg-yellow-900/40 border border-yellow-700 p-4 rounded-xl">
    <h3>Pending</h3>
    <p className="text-3xl font-bold">
      {bookings.filter(b => b.status === "Pending").length}
    </p>
  </div>

  <div className="bg-blue-900/40 border border-blue-700 p-4 rounded-xl">
    <h3>Confirmed</h3>
    <p className="text-3xl font-bold">
      {bookings.filter(b => b.status === "Confirmed").length}
    </p>
  </div>

  <div className="bg-green-900/40 border border-green-700 p-4 rounded-xl">
    <h3>Completed</h3>
    <p className="text-3xl font-bold">
      {bookings.filter(b => b.status === "Completed").length}
    </p>
  </div>

  <div className="bg-red-900/40 border border-red-700 p-4 rounded-xl">
    <h3>Cancelled</h3>
    <p className="text-3xl font-bold">
      {bookings.filter(b => b.status === "Cancelled").length}
    </p>
  </div>
<div className="bg-cyan-900/40 border border-cyan-700 p-4 rounded-xl">
  <h3>Today</h3>
  <p className="text-3xl font-bold">
    {
      bookings.filter(
        (b) =>
          b.booking_date ===
          new Date().toISOString().split("T")[0]
      ).length
    }
  </p>
</div>
</div>

<div className="mb-6">
  <input
    type="text"
    placeholder="Search by name or phone..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none"
  />
</div>

<div className="flex gap-2 mb-6">
  <button
    onClick={() => setFilter("all")}
    className="bg-zinc-800 px-4 py-2 rounded"
  >
    All
  </button>

  <button
    onClick={() => setFilter("today")}
    className="bg-zinc-800 px-4 py-2 rounded"
  >
    Today
  </button>

  <button
    onClick={() => setFilter("month")}
    className="bg-zinc-800 px-4 py-2 rounded"
  >
    This Month
  </button>
</div>

    <div className="overflow-auto rounded-xl border border-zinc-700">
      <table className="w-full">
        <thead className="bg-zinc-900">
          <tr>
            <th className="p-4 border">Name</th>
            <th className="p-4 border">Phone</th>
            <th className="p-4 border">Service</th>
            <th className="p-4 border">Date</th>
            <th className="p-4 border">Time</th>
            <th className="p-4 border">Status</th>
            <th className="p-4 border">Actions</th>
          </tr>
        </thead>

        <tbody>
{bookings
  .filter((item) => {
    const matchesSearch =
      item.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      item.phone
        ?.toString()
        .includes(search);

    if (filter === "all") return matchesSearch;

    if (filter === "today") {
      return (
        matchesSearch &&
        item.booking_date ===
          new Date().toISOString().split("T")[0]
      );
    }

    if (filter === "month") {
      return (
        matchesSearch &&
        item.booking_date?.slice(0, 7) ===
          new Date().toISOString().slice(0, 7)
      );
    }

    return matchesSearch;
  })
  .map((item) => (
            <tr key={item.id}>
              <td className="p-4 border">{item.full_name}</td>
              <td className="p-4 border">{item.phone}</td>
              <td className="p-4 border">{item.service}</td>
              <td className="p-4 border">{item.booking_date}</td>
              <td className="p-4 border">{item.booking_time}</td>

              <td className="p-4 border">
                <select
                  value={item.status || "Pending"}
                  onChange={(e) =>
                    updateStatus(item.id, e.target.value)
                  }
                  className="bg-zinc-800 text-white px-3 py-2 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>

              <td className="p-4 border">
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/91${item.phone}`,
                      "_blank"
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-2"
                >
                  WhatsApp
                </button>

                <button
                  onClick={() => deleteBooking(item.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  <h2 className="text-3xl font-bold mt-10 mb-4">
  Contact Messages
</h2>

<div className="overflow-auto rounded-xl border border-zinc-700">
  <table className="w-full">
    <thead className="bg-zinc-900">
      <tr>
        <th className="p-4 border">Name</th>
        <th className="p-4 border">Phone</th>
        <th className="p-4 border">Message</th>
        <th className="p-4 border">Actions</th>
      </tr>
    </thead>

    <tbody>
      {contacts.map((item) => (
        <tr key={item.id}>
          <td className="p-4 border">{item.name}</td>
          <td className="p-4 border">{item.phone}</td>
          <td className="p-4 border">{item.message}</td>

          <td className="p-4 border">
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/91${item.phone}`,
                  "_blank"
                )
              }
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mr-2"
            >
              WhatsApp
            </button>

            <button
              onClick={() => deleteContact(item.id)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  </div>
);
}