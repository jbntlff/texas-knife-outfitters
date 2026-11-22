import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusForm, } from "./status-form";
import { ShippingForm } from "./shipping-form";
import { getOrder, getOrderEvents } from "@tkb/database";
import { formatPrice } from "@tkb/ui";
import { OrderTimeline }
  from "@/components/orders/order-timeline";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getTrackingUrl(
  carrier: string | null,
  trackingNumber:
    string | null,
) {
  if (
    !carrier ||
    !trackingNumber
  ) {
    return null;
  }

  switch (carrier) {
    case "UPS":
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;

    case "USPS":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;

    case "FedEx":
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;

    default:
      return null;
  }
}


export default async function OrderDetailPage({
  params,
}: PageProps) {
  const { id } =
    await params;

  const order = await getOrder(id);
  const events = await getOrderEvents(id);

  if (!order) {
    notFound();
  }


  const trackingUrl = getTrackingUrl(order.carrier, order.tracking_number,);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {order.order_number}
        </h1>
        <p className="text-muted-foreground">
          {order.customer_email}
        </p>
        <p className="text-sm text-muted-foreground">
          Created{" "}
          {new Date(
            order.created_at,
          ).toLocaleString()}
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>

      {/*  Order Summary */}

      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Order Summary
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Status</span>
            <StatusForm
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span> {formatPrice(order.subtotal)} </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span> {formatPrice(order.tax_total)} </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span> {formatPrice(order.shipping_total)} </span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span> {formatPrice(order.grand_total)} </span>
          </div>
        </div>
      </div>

      {/* Shipping Card  */}
      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Shipping
        </h2>
        {order.shipping_line1 && (
          <address className="mb-4 text-sm not-italic">
            <div className="font-medium">{order.shipping_name}</div>
            <div>{order.shipping_line1}</div>
            {order.shipping_line2 && <div>{order.shipping_line2}</div>}
            <div>
              {order.shipping_city}, {order.shipping_state}{" "}
              {order.shipping_postal_code}
            </div>
            {order.shipping_phone && (
              <div className="text-muted-foreground">
                {order.shipping_phone}
              </div>
            )}
          </address>
        )}
        {order.stripe_payment_intent_id && (
          <div className="mb-4 text-sm text-muted-foreground">
            {order.paid_at
              ? `Paid ${new Date(order.paid_at).toLocaleString()}`
              : "Not paid"}{" "}
            · Stripe{" "}
            <a
              href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {order.stripe_payment_intent_id}
            </a>
          </div>
        )}
        {order.carrier && (
          <div className="mb-4 text-sm">
            <div>
              Carrier: {order.carrier}
            </div>

            <div>
              Tracking:
              {" "}
              {order.tracking_number}
            </div>
          </div>
        )}
         {order.shipped_at && (
          <div className="mt-4 text-sm text-muted-foreground">
            Shipped{" "}
            {new Date(
              order.shipped_at,
            ).toLocaleString()}
          </div>
        )}
        {trackingUrl && (
          <div className="mt-2 mb-4">
            <a
              href={trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium underline"
            >
              Track Package
            </a>
          </div>
        )}

        <ShippingForm
          orderId={order.id}
          carrier={order.carrier}
          trackingNumber={
            order.tracking_number
          }
        />

      </div>

      <OrderTimeline events={events} />

      {/* Items Card */}
      <div className="rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Items
        </h2>

        <div className="space-y-4">
          {order.order_items.map(
            (item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-4"
              >
                <div>
                  <div className="font-medium">
                    {item.product_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.variant_title}
                  </div>
                  {Array.isArray(
                    item.selected_options,
                  ) &&
                    item.selected_options.length >
                      0 && (
                      <div className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
                        {(
                          item.selected_options as {
                            optionName: string;
                            optionValue: string;
                          }[]
                        ).map((option) => (
                          <div
                            key={option.optionName}
                          >
                            {option.optionName}:{" "}
                            {option.optionValue}
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="text-sm text-muted-foreground">
                    Qty:{" "}
                    {item.quantity}
                  </div>
                </div>

                <div>
                  {formatPrice(item.unit_price * item.quantity)}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

