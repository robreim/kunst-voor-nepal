// Remark plugin: rewrite link/url URLs that lack a scheme (e.g. "www.site.nl"
// typed in the CMS markdown editor) so the browser doesn't treat them as
// relative paths like https://site/www.site.nl.
import { visit } from 'unist-util-visit';

export default function remarkAbsoluteUrls() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      node.url = normalize(node.url);
    });
    visit(tree, 'image', (node) => {
      node.url = normalize(node.url);
    });
  };
}

function normalize(url) {
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('/') || url.startsWith('#')) return url;
  // Bare domain or www.… → assume https.
  return 'https://' + url;
}
