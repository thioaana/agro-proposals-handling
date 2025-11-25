import { createClient } from "../supabase/client";

const supabase = createClient();

export async function deleteProduct(id: number) {
    return await supabase.from('products').delete().eq('id', id);
    
}

export async function getProductsByUser(userId: string) {
    return await supabase.from('products').select('*').eq('user_id', userId);
}