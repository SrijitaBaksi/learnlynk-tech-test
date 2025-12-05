
-- This allows the anon key to access tasks without authentication(rls bypass) for testing purposes only


DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;


CREATE POLICY "tasks_select_policy_dev" 
ON public.tasks 
FOR SELECT 
USING (true);

CREATE POLICY "tasks_insert_policy_dev" 
ON public.tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "tasks_update_policy_dev" 
ON public.tasks 
FOR UPDATE 
USING (true);


DROP POLICY IF EXISTS "applications_select_policy" ON public.applications;
DROP POLICY IF EXISTS "applications_insert_policy" ON public.applications;

CREATE POLICY "applications_select_policy_dev" 
ON public.applications 
FOR SELECT 
USING (true);

CREATE POLICY "applications_insert_policy_dev" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);
