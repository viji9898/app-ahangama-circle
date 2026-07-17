const PERKS_META = {
  title: "Ahangama Circle Member Perks",
  description:
    "Explore Ahangama Circle member perks, discounts, and privileges from participating venues across Ahangama and the south coast.",
  url: "https://circle.ahangama.com/perks",
  image:
    "https://customer-apps-techhq.s3.eu-west-2.amazonaws.com/app-ahangama-demo/circle-member-perks.jpg",
};

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    };

    return entities[character];
  });
}

function replaceMeta(html, attribute, value, replacement) {
  const escapedReplacement = replacement.trim();
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=.${value}.[^>]*>`, "i");

  if (pattern.test(html)) {
    return html.replace(pattern, escapedReplacement);
  }

  return html.replace("</head>", `  ${escapedReplacement}\n  </head>`);
}

function replaceLink(html, rel, replacement) {
  const escapedReplacement = replacement.trim();
  const pattern = new RegExp(`<link\\s+rel=["']${rel}["'][^>]*>`, "i");

  if (pattern.test(html)) {
    return html.replace(pattern, escapedReplacement);
  }

  return html.replace("</head>", `  ${escapedReplacement}\n  </head>`);
}

function applyPerksMeta(html) {
  const title = escapeHtml(PERKS_META.title);
  const description = escapeHtml(PERKS_META.description);
  const url = escapeHtml(PERKS_META.url);
  const image = escapeHtml(PERKS_META.image);

  let updatedHtml = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  updatedHtml = replaceMeta(
    updatedHtml,
    "name",
    "description",
    `<meta name="description" content="${description}" />`,
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "property",
    "og:title",
    `<meta property="og:title" content="${title}" />`,
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "property",
    "og:description",
    `<meta property="og:description" content="${description}" />`,
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "property",
    "og:url",
    `<meta property="og:url" content="${url}" />`,
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "property",
    "og:image",
    `<meta property="og:image" content="${image}" />`,
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "property",
    "og:image:width",
    '<meta property="og:image:width" content="1200" />',
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "property",
    "og:image:height",
    '<meta property="og:image:height" content="630" />',
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "name",
    "twitter:title",
    `<meta name="twitter:title" content="${title}" />`,
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "name",
    "twitter:description",
    `<meta name="twitter:description" content="${description}" />`,
  );
  updatedHtml = replaceMeta(
    updatedHtml,
    "name",
    "twitter:image",
    `<meta name="twitter:image" content="${image}" />`,
  );
  updatedHtml = replaceLink(
    updatedHtml,
    "canonical",
    `<link rel="canonical" href="${url}" />`,
  );

  return updatedHtml;
}

export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");

  return new Response(applyPerksMeta(html), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};