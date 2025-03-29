import { supabase } from "@/lib/utils";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('dustbins')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching dustbins:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}