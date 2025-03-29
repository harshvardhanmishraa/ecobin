export async function fetchProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, total_points')
      .eq('id', supabase.auth.user().id)
      .single();
    if (error) throw error;
    return data;
}