const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qluwxpgsrpmqrvchgtau.supabase.co',  // Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsdXd4cGdzcnBtcXJ2Y2hndGF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc1NDk5MCwiZXhwIjoyMDczMzMwOTkwfQ.z3fpX03oc-ZIwgItmHdtuoaho2IfDbG-iHXVCqOUCmI'              // API Key
);

module.exports = supabase;