// app/api/drivers/route.js
import { supabase } from "@/lib/utils";  // Adjust path based on your project structure
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('driver_id', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}