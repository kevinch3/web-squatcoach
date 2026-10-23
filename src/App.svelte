<script lang="ts">
  import Nav from './components/Nav.svelte'
  import { router } from './lib/router.svelte'
  import Achievements from './routes/Achievements.svelte'
  import History from './routes/History.svelte'
  import Home from './routes/Home.svelte'
  import Train from './routes/Train.svelte'

  const pages = { home: Home, train: Train, history: History, achievements: Achievements }
  const Page = $derived(pages[router.current])
</script>

<Nav />
<main class="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pb-12">
  <Page />
</main>
