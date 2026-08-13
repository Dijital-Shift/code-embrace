SELECT cron.unschedule('kp-missed-checkins');
SELECT cron.unschedule('kp-escalate-missed');
SELECT cron.unschedule('kp-bedtime-reminder');

SELECT cron.schedule('kp-missed-checkins', '*/15 * * * *', $$
  SELECT net.http_post(
    url := 'https://project--a731ae5b-dc40-4afc-bb77-1f42a61635d0.lovable.app/api/public/hooks/missed-checkins',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRieG12d3B1eGZhcGp4d3VjaXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzU3NDIsImV4cCI6MjA5Mzc1MTc0Mn0.EQP7o46exg2QuF4MqOrMjnK9_xoPSIdzIvuLfQ4Gjfw"}'::jsonb,
    body := '{}'::jsonb
  );
$$);

SELECT cron.schedule('kp-escalate-missed', '*/15 * * * *', $$
  SELECT net.http_post(
    url := 'https://project--a731ae5b-dc40-4afc-bb77-1f42a61635d0.lovable.app/api/public/hooks/escalate-missed',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRieG12d3B1eGZhcGp4d3VjaXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzU3NDIsImV4cCI6MjA5Mzc1MTc0Mn0.EQP7o46exg2QuF4MqOrMjnK9_xoPSIdzIvuLfQ4Gjfw"}'::jsonb,
    body := '{}'::jsonb
  );
$$);

SELECT cron.schedule('kp-bedtime-reminder', '0 * * * *', $$
  SELECT net.http_post(
    url := 'https://project--a731ae5b-dc40-4afc-bb77-1f42a61635d0.lovable.app/api/public/hooks/bedtime-reminder',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRieG12d3B1eGZhcGp4d3VjaXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzU3NDIsImV4cCI6MjA5Mzc1MTc0Mn0.EQP7o46exg2QuF4MqOrMjnK9_xoPSIdzIvuLfQ4Gjfw"}'::jsonb,
    body := '{}'::jsonb
  );
$$);