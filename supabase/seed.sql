-- Demo seed for local Supabase development.
--
-- NOTE: The primary demo experience runs fully in the browser with local
-- storage and does not need this file. This seed is only useful once you have a
-- real authenticated parent user and want example rows in the database.
--
-- Replace '00000000-0000-0000-0000-000000000000' with a real auth.users id
-- (create one via Supabase Auth), then run: supabase db reset  (or psql -f).

do $$
declare
  v_parent uuid := '00000000-0000-0000-0000-000000000000';
  v_child uuid;
begin
  if not exists (select 1 from auth.users where id = v_parent) then
    raise notice 'Skipping seed: create an auth user and set v_parent first.';
    return;
  end if;

  insert into parent_accounts (id) values (v_parent) on conflict do nothing;
  insert into parent_settings (parent_id, pin_hash)
    values (v_parent, crypt('1234', gen_salt('bf')))
    on conflict (parent_id) do nothing;

  insert into child_profiles (parent_id, display_name, age_range, companion)
    values (v_parent, 'Explorer', '7-8',
      '{"name":"Pip","color":"grape","shape":"round","accessory":"crown","personality":["silly","curious","gentle"],"interests":["space","dinosaurs","drawing"],"voicePitch":1.3,"voiceRate":1}'::jsonb)
    returning id into v_child;

  insert into feature_permissions (child_id) values (v_child) on conflict do nothing;
  insert into app_preferences (child_id) values (v_child) on conflict do nothing;

  insert into memories (child_id, key, value, category, source) values
    (v_child, 'Favorite color', 'purple', 'favorite', 'child'),
    (v_child, 'Loves', 'dinosaurs and space', 'hobby', 'companion');

  insert into approved_websites (child_id, title, url) values
    (v_child, 'NASA Kids'' Club', 'https://www.nasa.gov/kidsclub/index.html'),
    (v_child, 'National Geographic Kids', 'https://kids.nationalgeographic.com/');
end $$;
