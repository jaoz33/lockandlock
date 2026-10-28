insert into public.tasks (title, template_html, placeholders, status)
values ('Sample Invoice', '<p>Invoice for {{Name}}</p>', '{Name}', 'draft');
