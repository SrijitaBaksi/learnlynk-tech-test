// LearnLynk Tech Test - Task 3: Edge Function create-task

// Deno + Supabase Edge Functions style
// Docs reference: https://supabase.com/docs/guides/functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type CreateTaskPayload = {
  application_id: string;
  task_type: string;
  due_at: string;
};

const VALID_TYPES = ["call", "email", "review"];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Partial<CreateTaskPayload>;
    const { application_id, task_type, due_at } = body;

    // Validate required fields
    if (!application_id || !task_type || !due_at) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          required: ["application_id", "task_type", "due_at"]
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check task_type is valid
    if (!VALID_TYPES.includes(task_type)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid task_type. Must be one of: ${VALID_TYPES.join(", ")}`,
          provided: task_type
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate due_at
    const dueDate = new Date(due_at);
    const currentDate = new Date();

    if (isNaN(dueDate.getTime())) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid date format for due_at",
          hint: "Use ISO 8601 format like 2025-01-01T12:00:00Z"
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Ensure due_at is in the future
    if (dueDate <= currentDate) {
      return new Response(
        JSON.stringify({ 
          error: "due_at must be a future timestamp",
          provided: due_at,
          server_time: currentDate.toISOString()
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if application exists and get tenant_id
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("tenant_id")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      return new Response(
        JSON.stringify({ 
          error: "Application not found",
          application_id: application_id
        }), 
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert the task
    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert({
        application_id: application_id,
        tenant_id: application.tenant_id,
        type: task_type,
        due_at: dueDate.toISOString(),
        status: "open"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create task",
          details: insertError.message
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        task_id: task.id,
        task: task
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: err.message
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
