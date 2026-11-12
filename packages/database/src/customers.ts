import { createAdminClient }
  from "./admin-client";

export async function getCustomers() {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data;
}

export async function getAdminUsers() {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("profiles")
      .select("*")
      .in("role", ["admin", "super_admin"])
      .order("role")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data;
}

export async function getCustomerById(
  customerId: string,
) {
  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", customerId)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
