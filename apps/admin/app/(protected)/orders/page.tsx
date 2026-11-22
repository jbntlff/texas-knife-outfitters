import Link from "next/link";

import { getOrders, getOrderMetrics, } from "@tkb/database";
import { formatPrice } from "@tkb/ui";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function OrdersPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const orders =
    await getOrders(
      params.q,
      params.status,
    );

  const metrics = await getOrderMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Orders
        </h1>
        <p className="text-muted-foreground">
          Manage customer orders.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">
            Total Orders
          </div>
          <div className="text-2xl font-bold">
            {metrics.totalOrders}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">
            Pending Orders
          </div>
          <div className="text-2xl font-bold">
            {metrics.pendingOrders}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">
            Revenue
          </div>
          <div className="text-2xl font-bold">
            {formatPrice(metrics.revenue)}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">
            Average Order
          </div>
          <div className="text-2xl font-bold">
            {formatPrice(
              metrics.averageOrderValue,
            )}
          </div>
        </div>
      </div>

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Order # or email"
          className="rounded-lg border px-3 py-2"
        />
        <select
          name="status"
          defaultValue={params.status}
          className="rounded-lg border px-3 py-2"
        >
          <option value=""> All Statuses </option>
          <option value="pending"> Pending </option>
          <option value="paid"> Paid </option>
          <option value="shipped"> Shipped </option>
          <option value="delivered"> Delivered </option>
          <option value="cancelled"> Cancelled </option>
          <option value="awaiting_payment"> Awaiting Payment (unpaid checkouts) </option>
        </select>

        <button
          type="submit"
          className="rounded-lg border px-4 py-2"
        >
          Filter
        </button>
        {(params.q || params.status) && (
          <Link
            href="/orders"
            className="rounded-lg border m text-muted-foreground hover:underline px-4 py-2"
          >
            Clear
          </Link>
        )}
      </form>
      <div className="rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left"> Order </th>
              <th className="p-4 text-left"> Customer </th>
              <th className="p-4 text-left"> Status </th>
              <th className="p-4 text-left"> Created </th>
              <th className="p-4 text-right"> Total </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b" >
                <td className="p-4">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium hover:underline"
                  >
                    {order.order_number}
                  </Link>

                  <div className="text-sm text-muted-foreground">
                    {new Date(
                      order.created_at,
                    ).toLocaleString()}
                  </div>
                </td>

                <td className="p-4">
                  {order.customer_email}
                </td>


                <td className="p-4">
                  <span
                    className={` rounded-full border px-2 py-1 text-xs font-medium 
                      ${order.status === "awaiting_payment"
                        ? "bg-gray-100"
                        : order.status === "pending"
                        ? "bg-yellow-100"
                        : order.status === "paid"
                          ? "bg-blue-100"
                          : order.status === "shipped"
                            ? "bg-purple-100"
                            : order.status === "delivered"
                              ? "bg-green-100"
                              : "bg-red-100"
                      }
  `}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  {new Date(
                    order.created_at,
                  ).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  {formatPrice(order.grand_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}