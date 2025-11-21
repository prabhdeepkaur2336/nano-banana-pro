/*
  # Add webhook trigger for image generation requests

  1. New Functions
    - `notify_webhook_on_insert` - Trigger function that sends HTTP POST request to webhook
    
  2. New Triggers
    - `trigger_webhook_on_insert` - Fires after INSERT on image_generation_requests table
    
  3. Changes
    - Sends webhook notification with request ID to external endpoint
    - Executes asynchronously after row insertion
*/

-- Create function to send webhook notification
CREATE OR REPLACE FUNCTION notify_webhook_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://hook.eu2.make.com/5ac4v4nqh66cw74sbiy7aj5n6wxfi8ok';
  request_id TEXT;
BEGIN
  request_id := NEW.id::TEXT;
  
  -- Send HTTP POST request to webhook
  PERFORM net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object('id', request_id)::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after insert
DROP TRIGGER IF EXISTS trigger_webhook_on_insert ON image_generation_requests;

CREATE TRIGGER trigger_webhook_on_insert
  AFTER INSERT ON image_generation_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_webhook_on_insert();