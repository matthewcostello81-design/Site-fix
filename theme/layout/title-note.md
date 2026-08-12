# Tab title logic (layout/theme.liquid)

Stock:

    <title>
      {{ page_title }}
      {% unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless %}
    </title>

The homepage SEO title is "PocketEra" and the shop name is "Pocket Era". The
`contains` test is literal, so "PocketEra" does not contain "Pocket Era" and the
brand gets appended anyway — the tab reads "PocketEra – Pocket Era".

Fixed by comparing both sides with spaces and case removed, so any spelling of
the brand counts as already present:

    {%- assign t_norm = page_title | downcase | remove: ' ' -%}
    {%- assign s_norm = shop.name  | downcase | remove: ' ' -%}
    {%- unless t_norm contains s_norm -%} &ndash; {{ shop.name }}{%- endunless -%}

Also collapses the leading whitespace the stock version leaves inside <title>,
which some browsers render as a gap before the first character.
