import type { Module } from "../types"

export const htmlModule5: Module = {
  id: 5,
  title: "Tables",
  status: "upcoming",
  lessons: [
    {
      name: "Table Structure",
      minutes: 8,
      intro: "The core elements for laying out tabular data — rows, cells, and headers.",
      content: `### The building blocks

\`\`\`html
<table>
  <tr>
    <th>Name</th>
    <th>Role</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>Engineer</td>
  </tr>
  <tr>
    <td>Bob</td>
    <td>Designer</td>
  </tr>
</table>
\`\`\`

- \`<table>\` — the whole table
- \`<tr>\` — a table row
- \`<th>\` — a **header** cell (bold, centered by default; also carries semantic meaning)
- \`<td>\` — a regular **data** cell

### Rule: only think in rows

A table is built row by row, top to bottom. Each \`<tr>\` contains the cells for that row, left to right. There's no separate concept of a "column" element — columns just emerge from cells lining up.

\`\`\`html
<table>
  <tr>
    <th>Product</th>
    <th>Price</th>
    <th>In Stock</th>
  </tr>
  <tr>
    <td>Widget</td>
    <td>$9.99</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Gadget</td>
    <td>$19.99</td>
    <td>No</td>
  </tr>
</table>
\`\`\`

### Tables are for tabular data only

A very common historical mistake: using \`<table>\` to lay out an entire page (nav in one cell, content in another). That practice is obsolete — CSS (flexbox, grid) handles page layout now. Reserve \`<table>\` exclusively for genuinely grid-shaped data: schedules, pricing comparisons, spreadsheet-like data.

> **Key idea:** rows first, cells within rows. \`<th>\` for headers, \`<td>\` for data — that distinction isn't just visual, it's what lets a screen reader announce "Price: $9.99" instead of just reading two disconnected cells.`,
    },
    {
      name: "Spanning Rows & Columns",
      minutes: 8,
      intro: "Merging cells together with colspan and rowspan.",
      content: `### colspan: merging cells horizontally

\`colspan\` makes a cell stretch across multiple columns:

\`\`\`html
<table>
  <tr>
    <th colspan="2">Contact Info</th>
  </tr>
  <tr>
    <td>Email</td>
    <td>alice@example.com</td>
  </tr>
</table>
\`\`\`

The header cell spans both columns beneath it — useful for grouping headers.

### rowspan: merging cells vertically

\`rowspan\` makes a cell stretch down across multiple rows:

\`\`\`html
<table>
  <tr>
    <th rowspan="2">Alice</th>
    <td>Monday</td>
  </tr>
  <tr>
    <td>Tuesday</td>
  </tr>
</table>
\`\`\`

"Alice" occupies the row-height of both entries beneath it, without repeating the cell.

### Combining both

\`\`\`html
<table>
  <tr>
    <th></th>
    <th colspan="2">Q1</th>
  </tr>
  <tr>
    <th>Region</th>
    <th>Jan</th>
    <th>Feb</th>
  </tr>
  <tr>
    <td rowspan="2">West</td>
    <td>100</td>
    <td>120</td>
  </tr>
  <tr>
    <td>110</td>
    <td>130</td>
  </tr>
</table>
\`\`\`

### The gotcha: cell count per row

When a cell spans multiple columns or rows, **the following rows have fewer explicit \`<td>\`s** — the spanned cell "eats into" them. Miscounting this is the single most common table bug, producing a lopsided grid. Sketch the table on paper first if it's complex.

> **Key idea:** \`colspan\`/\`rowspan\` merge cells but don't remove them from the row/column count — every row after a rowspan needs one fewer \`<td>\` to compensate.`,
    },
    {
      name: "Accessible & Semantic Tables",
      minutes: 9,
      intro: "The elements that turn a visual grid into data a screen reader can actually navigate.",
      content: `### thead, tbody, tfoot

Grouping rows into semantic sections:

\`\`\`html
<table>
  <thead>
    <tr>
      <th>Product</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Widget</td>
      <td>$9.99</td>
    </tr>
    <tr>
      <td>Gadget</td>
      <td>$19.99</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Total</td>
      <td>$29.98</td>
    </tr>
  </tfoot>
</table>
\`\`\`

- \`<thead>\` — header row(s), repeats if the table prints across pages
- \`<tbody>\` — the actual data rows
- \`<tfoot>\` — summary rows (totals, averages)

### caption: the table's title

\`\`\`html
<table>
  <caption>Q1 Product Sales</caption>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
\`\`\`

\`<caption>\` must be the *first* child of \`<table>\`. It's announced by screen readers before the table content, giving context — much better than a \`<h3>\` floating above the table with no formal connection to it.

### scope: connecting headers to data

For screen readers to announce "Price: $9.99" instead of just "$9.99," each \`<th>\` needs a \`scope\`:

\`\`\`html
<table>
  <tr>
    <th scope="col">Product</th>
    <th scope="col">Price</th>
  </tr>
  <tr>
    <th scope="row">Widget</th>
    <td>$9.99</td>
  </tr>
</table>
\`\`\`

- \`scope="col"\` — this header applies to the whole column below it
- \`scope="row"\` — this header applies to the whole row beside it

Without \`scope\`, a screen reader has no reliable way to know which headers describe which cells — especially in tables with headers on both an axis, like the "Widget" row-header example above.

### Putting it all together

\`\`\`html
<table>
  <caption>Team Schedule — Week of March 3</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Monday</th>
      <th scope="col">Tuesday</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Alice</th>
      <td>9am–5pm</td>
      <td>Off</td>
    </tr>
  </tbody>
</table>
\`\`\`

> **Key idea:** a visually correct table and an *accessible* table are different bars. \`<caption>\`, \`<thead>\`/\`<tbody>\`, and \`scope\` are what make the difference — none of them change how the table looks by default.`,
    },
  ],
}
