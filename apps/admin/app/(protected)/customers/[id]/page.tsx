import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCustomerById,
  getOrdersByCustomerId,
} from "@tkb/database";
import { formatPrice, Button } from "@tkb/ui";

import { updateCustomer } from "../actions";
import { DeleteCustomerButton } from "./delete-customer-button";
import { SendResetButton } from "./send-reset-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CustomerDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const orders = await getOrdersByCustomerId(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {customer.first_name}{" "}
          {customer.last_name}
        </h1>

        <p className="text-muted-foreground">
          {customer.email}
        </p>

        <Link
          href="/customers"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Customers
        </Link>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Profile
        </h2>

        <form
          action={updateCustomer}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="customerId"
            value={customer.id}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                First Name
              </label>

              <input
                key={customer.first_name}
                name="firstName"
                defaultValue={
                  customer.first_name ?? ""
                }
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Last Name
              </label>

              <input
                key={customer.last_name}
                name="lastName"
                defaultValue={
                  customer.last_name ?? ""
                }
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              key={customer.email}
              name="email"
              type="email"
              defaultValue={customer.email}
              required
              className="w-full rounded border px-3 py-2"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Updates their login immediately —
              no confirmation email required. Use
              this if the customer has lost
              access to their old inbox.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Role
            </label>

            <select
              key={customer.role}
              name="role"
              defaultValue={customer.role}
              className="w-full rounded border px-3 py-2"
            >
              <option value="customer">
                Customer
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              key={String(customer.marketing_opt_in)}
              type="checkbox"
              name="marketingOptIn"
              defaultChecked={
                customer.marketing_opt_in
              }
            />

            <label>
              Marketing emails opt-in
            </label>
          </div>

          <Button type="submit">
            Save Changes
          </Button>
        </form>

        <div className="mt-6 border-t pt-6">
          <p className="mb-2 text-sm font-medium">
            Account Access
          </p>

          <SendResetButton
            email={customer.email}
          />
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Order History
        </h2>

        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium hover:underline"
                  >
                    {order.order_number}
                  </Link>

                  <div className="text-sm text-muted-foreground">
                    {new Date(
                      order.created_at,
                    ).toLocaleDateString()}{" "}
                    · {order.status}
                  </div>
                </div>

                <div>
                  {formatPrice(
                    order.grand_total,
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-red-200 p-6">
        <h2 className="mb-2 text-xl font-semibold">
          Danger Zone
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Permanently delete this customer&apos;s
          login and profile. This cannot be
          undone.
        </p>

        <DeleteCustomerButton
          customerId={customer.id}
        />
      </div>
    </div>
  );
}
