/**
 * Global MDX component mapping.
 *
 * Passed to every <Content components={mdxComponents} /> render, so content
 * files reference these by name with ZERO imports. If a content file ever needs
 * an import, the mapping is incomplete — fix it here, not in the content.
 */
import Callout from './Callout.astro'
import Figure from './Figure.astro'
import Aside from './Aside.astro'
import Metric from './Metric.astro'
import Comparison from './Comparison.astro'
import H2 from './H2.astro'
import H3 from './H3.astro'

export const mdxComponents = {
  Callout,
  Figure,
  Aside,
  Metric,
  Comparison,
  h2: H2,
  h3: H3,
}
