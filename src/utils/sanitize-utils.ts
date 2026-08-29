import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Preserves safe HTML formatting tags while stripping dangerous scripts/attributes.
 */
export const sanitizeHTML = (html: string | undefined | null): string => {
	if (!html) return '';
	return DOMPurify.sanitize(html);
};
