const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mjomtspkzlrkdigblbca.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qb210c3Bremxya2RpZ2JsYmNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEzMjEyMCwiZXhwIjoyMDkyNzA4MTIwfQ.fEWW2ecMtUCJRfajc9V2mNa5eTSY0Xm6oHvstlU1x5I'
);

async function testInsert() {
  const { data, error } = await supabase.from('videos').insert({
    title: 'Test direct insert',
    description: 'Testing if inserts work',
    video_path: 'test-direct-insert.mp4'
  });
  
  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert success!');
  }
}

testInsert();
