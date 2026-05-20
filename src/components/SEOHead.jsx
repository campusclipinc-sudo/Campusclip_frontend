import React from "react";
import { Helmet } from "react-helmet-async";

const SEOHead = ({
  title = "CampusClip",
  description = "Your all-in-one campus social platform for clubs, classes, events, and student connections.",
  keywords = "campus social, student clubs, college events, class management, campus networking",
  canonical = "/",
  ogImage = "https://campusclip.com/og-image.png",
  ogType = "website",
  noindex = false,
  jsonLd = null,
}) => {
  const fullTitle = title === "CampusClip" ? title : `${title} | CampusClip`;
  const canonicalUrl = canonical.startsWith("http") ? canonical : `https://campusclip.com${canonical}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
