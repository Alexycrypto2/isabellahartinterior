-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate as a permissive policy so users can read their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);