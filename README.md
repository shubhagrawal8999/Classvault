# ClassVault

A study space for class notes and important questions.

## Run locally

```sh
npm install
npm run dev
```

## Update the study content

The interface currently uses a mock dataset in
[`src/mockData.ts`](./src/mockData.ts). It contains three subjects, two units
per subject, and sample questions with answers and priority levels. Each unit's
`fileName` points to a note in `public/materials/`; PDF and DOCX files are
supported. Update the dataset and matching note files together when changing
the sample content.

Run the build to check changes:

```sh
npm run build
```

## Deploy

Deploy the project to Netlify or Vercel using the defaults:

- Build command: `npm run build`
- Publish/output directory: `dist`