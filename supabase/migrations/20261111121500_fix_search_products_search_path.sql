-- Fix Supabase advisor "function_search_path_mutable": an unset search_path
-- on a SECURITY INVOKER function lets a caller shadow unqualified names
-- (e.g. via a session-level search_path) to redirect what the function reads.
alter function public.search_products(text) set search_path = public;
