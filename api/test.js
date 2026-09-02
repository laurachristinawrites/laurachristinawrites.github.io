import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('product')
      .select('product_id, product_name')
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Supabase-Verbindung funktioniert!',
      data
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Supabase-Verbindung fehlgeschlagen.'
    });
  }
}
