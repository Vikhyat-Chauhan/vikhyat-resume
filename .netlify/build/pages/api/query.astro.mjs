export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  const body = await request.json();
  const res = await fetch("https://professionalrag-738260384801.us-east4.run.app/query", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${"eyJhbGciOiJSUzI1NiIsImtpZCI6IjUzMDcyNGQ0OTE3M2EzZWQ2YjRhMDBhYTYzNDQyMDMwMGQ3MmFlNWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjE4MTA0NzA4MDU0LTlyOXMxYzRhbGczNmVybGl1Y2hvOXQ1Mm4zMm42ZGdxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjE4MTA0NzA4MDU0LTlyOXMxYzRhbGczNmVybGl1Y2hvOXQ1Mm4zMm42ZGdxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3NjE2OTU1MzQ3NDM0NzM3Mjg0IiwiZW1haWwiOiJ2aWtoeWF0LmNoYXVoYW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJxQ1BwcVIzUGxpRUd4dzgxTG1RcndnIiwibmJmIjoxNzczMjExMTEzLCJpYXQiOjE3NzMyMTE0MTMsImV4cCI6MTc3MzIxNTAxMywianRpIjoiYWI1NmVmZjY0OTU1OTljNjE0YmQyM2RiMDE3ZjQwOGY0OGI3Mjk3MyJ9.GX-WKh5-aD4DdBuB9q8E5fe76auXMDAtDkOXAG0GPdOPLIZKBmJaePDxq_xt8mt9XS-V1JZ6lcAi1mKTgh9LM-8DEGXlbvfFeShcN1E9KjndaN1_Sb8Ko3jGbIIFacZ54GAdeBMCAa1SnJ-9oF0QDI3Og6_klZHFKwCa04het2wyVnltspPlL2CE8mxZSWIAkfeCpt1vG8NNZTqvk3YdL8vWhJcP6Qkp0Cbs-l4jcTWiDEzqY9aDumyEcp4lp111N2aiWeIoeQTdTuPXsWRmFoCPq5kUrGZmv_pVq0JvYyXt_xw9w4_O3QEw6Hu5CvVtAczb-MnpwbBQS2v3S9AglA"}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
