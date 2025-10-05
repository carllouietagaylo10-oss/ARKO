Trigger a flood_alerts insert using your Supabase service_role key

This script (`scripts/triggerAlertServiceRole.js`) performs a server-side insert into the `flood_alerts` table using the Supabase `service_role` key. The service_role key has full privileges and must never be committed to source control.

How to run (PowerShell)

# Set the SERVICE_ROLE_KEY environment variable for this session (PowerShell)
$env:SERVICE_ROLE_KEY = "<YOUR_SERVICE_ROLE_KEY_HERE>"

# Then run the script
node scripts/triggerAlertServiceRole.js

Alternative: store SERVICE_ROLE_KEY temporarily in `.env` (not recommended). If you do, add `SERVICE_ROLE_KEY=...` to `.env` and then run the script (the script will read from `.env` if the env var is not present).

Security note
- Do NOT commit your service_role key to git.
- Use the key only from a secure environment (your local machine, CI job with secrets configured). Remove it after testing if not needed.
