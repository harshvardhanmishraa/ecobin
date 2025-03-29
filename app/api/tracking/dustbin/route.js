import { supabase } from '@/lib/utils';
import { NextResponse } from 'next/server';

// PUT request handler to update dustbin data
export async function PUT(req) {
    const data = await req.json(); // Get JSON body
    
    console.log('Received data:', data); // Log received data
    
    // Check if the password matches
    if (data.password !== 'DustbinUpdate1405.') {
        console.log('Unauthorized access attempt');
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Prepare updated dustbin data
    const updatedDustbin = {
        redcapacity: parseFloat(data.red_status), 
        greencapacity: parseFloat(data.green_status), 
        bluecapacity: parseFloat(data.blue_status), 
        status: data.status, 
    };

    console.log('Updated dustbin data:', updatedDustbin); // Log updated data

    // Perform database update on the dustbins table in Supabase
    const { error } = await supabase
          .from('dustbins')
          .update(updatedDustbin)
          .eq('id', data.id); // Ensure you're using the correct dustbin ID

    if (error) {
        console.error('Supabase error:', error.message); // Log error
        return NextResponse.json({ msg: 'Error publishing dustbin data', success: false, error: error.message }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({ success: true });
}
export async function GET(){
    return NextResponse.json({ success: false });
}

