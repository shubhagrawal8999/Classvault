# ClassVault

Your class notes, in one place.

## Run locally

```sh
npm install
npm run dev
```

## Update subjects, units, and notes

There is no admin account or editing screen. The maintainer updates the single
content file [`src/subjects.json`](./src/subjects.json), then redeploys the site.
The app reads this file at build time.

Each subject has a unique `id`, a display `name`, and a `units` array. Each
unit has a unique `id`, a `title`, and a `fileName`. The file named by
`fileName` must be placed in
`public/materials/`. PDF and DOCX files are supported.

To add a subject, copy a subject object in `src/subjects.json`, change its
fields, and give it a unique ID. To add a unit, add an object to that subject's
`units` array and put the matching notes file in `public/materials/`. Keep JSON
valid (double quotes, commas between fields and items), then run the build to
catch errors before deploying:

```sh
npm run build
```

Example unit:

```json
{
  "id": "physics-unit-1",
  "title": "Unit 1: Ray Optics",
  "fileName": "ray-optics.pdf"
}
```

`description`, `questions` (an array), and `assignment` (an object) are
optional future data fields on a unit. They are not shown in the student
interface.

## Deploy

Deploy the project to Netlify or Vercel using the defaults:

- Build command: `npm run build`
- Publish/output directory: `dist`