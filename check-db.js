const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mjomtspkzlrkdigblbca.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qb210c3Bremxya2RpZ2JsYmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEzMjEyMCwiZXhwIjoyMDkyNzA4MTIwfQ.fEWW2ecMtUCJRfajc9V2mNa5eTSY0Xm6oHvstlU1x5I'
);

async function check() {
  const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Videos:', data);
  if (error) console.error('Error:', error);
}

check();
