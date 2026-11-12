import Link from "next/link";

import { getCustomers, getOrders } from "@tkb/database";
import { formatPrice, Button } from "@tkb/ui";

import { inviteCustomer } from "./actions";

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function CustomersPage({
  searchParams,
}: PageProps) {
  const { error } = await searchParams;

  const customers = await getCustomers();
  const orders = await getOrders();

  const statsByCustomer = new Map<
    string,
    { count: number; total: number }
  >();

  for (const order of orders) {
    if (!order.customer_id) {
      continue;
    }

    const stat =
      statsByCustomer.get(order.customer_id) ?? {
        count: 0,
        total: 0,
      };

    stat.count += 1;
    stat.total += Number(order.grand_total);

    statsByCustomer.set(order.customer_id, stat);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Customers
        </h1>
        <p className="text-muted-foreground">
          Manage customer accounts.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Invite Customer
        </h2>

        <form
          action={inviteCustomer}
          className="grid gap-4 md:grid-cols-4"
        >
          <input
            name="firstName"
            placeholder="First Name"
            required
            className="rounded border px-3 py-2"
          />

          <input
            name="lastName"
            placeholder="Last Name"
            required
            className="rounded border px-3 py-2"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded border px-3 py-2"
          />

          <Button type="submit">
            Send Invite
          </Button>
        </form>
      </div>

      <div className="rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">
                Name
              </th>
              <th className="p-4 text-left">
                Email
              </th>
              <th className="p-4 text-left">
                Role
              </th>
              <th className="p-4 text-right">
                Orders
              </th>
              <th className="p-4 text-right">
                Total Spent
              </th>
              <th className="p-4 text-left">
                Joined
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => {
              const stats = statsByCustomer.get(
                customer.id,
              );

              return (
                <tr
                  key={customer.id}
                  className="border-b"
                >
                  <td className="p-4">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.first_name}{" "}
                      {customer.last_name}
                    </Link>
                  </td>

                  <td className="p-4">
                    {customer.email}
                  </td>

                  <td className="p-4">
                    <span className="rounded-full border px-2 py-1 text-xs font-medium">
                      {customer.role}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    {stats?.count ?? 0}
                  </td>

                  <td className="p-4 text-right">
                    {formatPrice(
                      stats?.total ?? 0,
                    )}
                  </td>

                  <td className="p-4">
                    {new Date(
                      customer.created_at,
                    ).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}

            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-sm text-muted-foreground"
                >
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
