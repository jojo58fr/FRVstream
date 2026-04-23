import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'FRVStream';
const DEFAULT_TITLE = `${SITE_NAME} · VTubers FR en direct, tendances et plannings`;
const DEFAULT_DESCRIPTION = 'FRVStream rassemble les streams VTuber francophones, les tendances et les évènements FR & QC en un seul endroit.';
const DEFAULT_IMAGE = '/Banner_Horizon_July2023.webp';

const resolveBaseUrl = (baseUrl) => {
  if (baseUrl) {
    return baseUrl;
  }
  if (import.meta?.env?.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
};

const ensureMetaTag = (attribute, value) => {
  if (typeof document === 'undefined') {
    return null;
  }
  const selector = `meta[${attribute}="${value}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }
  return tag;
};

const setMeta = (name, content) => {
  if (typeof document === 'undefined' || !name || content === undefined) {
    return;
  }
  const tag = ensureMetaTag('name', name);
  if (tag) {
    tag.setAttribute('content', content);
  }
};

const setMetaProperty = (property, content) => {
  if (typeof document === 'undefined' || !property || content === undefined) {
    return;
  }
  const tag = ensureMetaTag('property', property);
  if (tag) {
    tag.setAttribute('content', content);
  }
};

const updateCanonical = (canonicalUrl) => {
  if (typeof document === 'undefined' || !canonicalUrl) {
    return;
  }
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', canonicalUrl);
};

const resolveUrl = (path, baseUrl) => {
  if (!path) {
    return '';
  }
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }
  const base = resolveBaseUrl(baseUrl);
  if (!base) {
    return path;
  }
  try {
    return new URL(path, base).toString();
  } catch (error) {
    return path;
  }
};

const buildCanonical = (baseUrl, canonicalPath, fallbackPath) => {
  const base = resolveBaseUrl(baseUrl);
  const path = canonicalPath ?? fallbackPath ?? '/';
  if (!base) {
    return path;
  }
  try {
    return new URL(path, base).toString();
  } catch (error) {
    return path;
  }
};

export const useSeo = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  image,
  type = 'website',
  robots = 'index,follow',
  baseUrl
} = {}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const computedTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const metaDescription = description || DEFAULT_DESCRIPTION;
    const resolvedCanonical = canonicalUrl || buildCanonical(baseUrl, canonicalPath, pathname);
    const resolvedImage = resolveUrl(image || DEFAULT_IMAGE, baseUrl);

    if (typeof document !== 'undefined') {
      document.title = computedTitle;
    }

    setMeta('description', metaDescription);
    setMeta('robots', robots);

    setMetaProperty('og:title', computedTitle);
    setMetaProperty('og:description', metaDescription);
    setMetaProperty('og:type', type);
    setMetaProperty('og:site_name', SITE_NAME);
    setMetaProperty('og:locale', 'fr_FR');
    if (resolvedCanonical) {
      setMetaProperty('og:url', resolvedCanonical);
    }
    if (resolvedImage) {
      setMetaProperty('og:image', resolvedImage);
    }

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', computedTitle);
    setMeta('twitter:description', metaDescription);
    if (resolvedImage) {
      setMeta('twitter:image', resolvedImage);
    }

    updateCanonical(resolvedCanonical);
  }, [title, description, canonicalPath, canonicalUrl, image, type, robots, baseUrl, pathname]);
};

const Seo = (props) => {
  useSeo(props);
  return null;
};

export default Seo;
