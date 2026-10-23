/** Tiny hash router, so the static build works on any host without rewrites. */
export const ROUTES = ['home', 'train', 'history', 'achievements'] as const
export type Route = (typeof ROUTES)[number]

const parse = (): Route => {
  const r = location.hash.replace(/^#\/?/, '') as Route
  return ROUTES.includes(r) ? r : 'home'
}

class Router {
  current = $state<Route>(parse())

  constructor() {
    addEventListener('hashchange', () => {
      this.current = parse()
      scrollTo({ top: 0 })
    })
  }
}

export const router = new Router()
export const href = (r: Route) => (r === 'home' ? '#/' : `#/${r}`)
