-- Ensure 'My API' is the default AI provider priority by seeding the ai_api setting if missing,
-- or upgrading any existing row that doesn't yet have a 'priority' field.
INSERT INTO public.site_settings (key, value)
VALUES ('ai_api', '{"priority":"custom"}'::jsonb)
ON CONFLICT (key) DO UPDATE
  SET value = CASE
    WHEN public.site_settings.value ? 'priority'
      THEN public.site_settings.value
    ELSE public.site_settings.value || '{"priority":"custom"}'::jsonb
  END
  WHERE NOT (public.site_settings.value ? 'priority');
