# EMPOWER landing page

The public project page for **EMPOWER: A Web-Based Recruitment, Deployment, and Competency-Based Job Matching Decision Support System** for CDE Manpower Services. Capstone project, College of Computer Studies, Laguna State Polytechnic University.

This repository holds only the page. The system itself is in the [EMPOWER repository](https://github.com/Jammarkeun/EMPOWER-A-Web-Based-Recruitment-Deployment-and-Competency-Based-Job-Matching-DSS-System).

## Run it locally

It is plain HTML, CSS, and JavaScript, with no build step. Open `index.html`, or serve the folder:

```bash
python -m http.server 8080
```

## Common edits

| To change | Edit |
| --- | --- |
| Team names and roles | The `TEAM` block in `index.html` |
| Links and the "View Repository" buttons | Search for `github.com/Jammarkeun` in `index.html` |
| Colours and spacing | The variables at the top of `assets/css/styles.css` |
| The worked scoring example | `APPLICANTS` and `score()` in `assets/js/main.js` |
| Screenshots | Add the file to `assets/screenshots/`, then add a `<figure class="shot">` in `index.html` |

## Deployment

Published by GitHub Pages from the root of the `main` branch. Pushing to `main` updates the live page.

## About the content

- Every applicant and record in the screenshots is synthetic demo data, and the name of the agency's client company is blurred.
- The scoring example uses invented data, with the same calculation as the system's scoring engine.
- The colours, Figtree and JetBrains Mono type, and component shapes follow the EMPOWER application.

## Credits

Icons are from [Lucide](https://lucide.dev) (ISC License), the same set the application uses. The CDE Manpower Services logo belongs to the agency.
