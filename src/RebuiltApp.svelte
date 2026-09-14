<script lang="ts">
  import { onMount } from 'svelte';
  import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    Timestamp,
    updateDoc,
  } from 'firebase/firestore';
  import { auth, db } from './lib/firebase';
  import { loginWithEmail, loginWithGoogle, signupWithEmail } from './lib/services/firebase/auth';
  import type { WeatherData } from './lib/services/weather';
  import type { NewsArticle } from './lib/services/news';
  import type { StockQuote } from './lib/services/stocks';
  import { getRadioPlayer } from './lib/services/radio';
  import DataTable from './components/rebuild/DataTable.svelte';

  type Tab = 'dashboard' | 'expenses' | 'debts' | 'recurring' | 'tasks' | 'calendar';
  type Entity = Record<string, any> & { id: string };
  type Modal = 'expense' | 'debt' | 'recurring' | 'task' | 'event' | 'calculator' | 'shopping' | null;
  function getStorage(): Storage | null {
    try { return typeof window !== 'undefined' ? window.localStorage : null; } catch { return null; }
  }
  const storage = getStorage();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'expenses', label: 'Expenses', icon: '↕' },
    { id: 'debts', label: 'Debts', icon: '◈' },
    { id: 'recurring', label: 'Recurring', icon: '⟳' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'calendar', label: 'Calendar', icon: '□' },
  ];
  const today = new Date();
  const monthId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const dateId = today.toISOString().slice(0, 10);

  let user: User | null = null;
  let authResolved = false;
  let activeTab: Tab = 'dashboard';
  let modal: Modal = null;
  let authMode: 'login' | 'signup' = 'login';
  let email = '';
  let password = '';
  let authError = '';
  let busy = false;
  let dark = storage?.getItem('ordina-theme') === 'dark';
  let language = storage?.getItem('ordina-language') || 'en';
  let currency = storage?.getItem('ordina-currency') || 'AZN';
  let now = new Date();
  let weather: WeatherData = { temp: 20, condition: 'Clear', icon: '01d', city: 'Baku', timezone: 0, timestamp: Date.now() };
  let news: NewsArticle[] = [];
  let stocks: StockQuote[] = [];
  let newsLoading = false;
  let stocksLoading = false;
  let radioPlaying = false;
  let radioTitle = '';
  let toast = '';
  let calculator = '';
  let shoppingItem = '';
  let shopping: { id: string; name: string; done: boolean }[] = JSON.parse(storage?.getItem('ordina-shopping') || '[]');

  let expenses: Entity[] = [];
  let debts: Entity[] = [];
  let recurring: Entity[] = [];
  let tasks: Entity[] = [];
  let events: Entity[] = [];
  let cleanups: (() => void)[] = [];

  let form = { name: '', amount: '', category: 'General', date: dateId, notes: '', dueDay: '1', type: 'event' };

  $: totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  $: totalDebt = debts.reduce((sum, item) => sum + Math.max(0, Number(item.totalAmount || 0) - Number(item.paidAmount || 0)), 0);
  $: completedTasks = tasks.filter((item) => item.status === 'Выполнено' || item.done).length;
  $: displayedTasks = tasks.filter((item) => !item.date || item.date === dateId || item.month === monthId);
  $: appClass = dark ? 'app dark' : 'app';

  function getBarHeight(index: number) {
    const total = expenses
      .filter((item) => new Date(item.date || '').getMonth() === index)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return Math.max(8, Math.min(100, (total / Math.max(totalExpenses, 1)) * 100));
  }

  function notify(message: string) {
    toast = message;
    window.setTimeout(() => (toast = ''), 2600);
  }

  function resetForm() {
    form = { name: '', amount: '', category: 'General', date: dateId, notes: '', dueDay: '1', type: 'event' };
  }

  function setTheme(value = !dark) {
    dark = value;
    storage?.setItem('ordina-theme', dark ? 'dark' : 'light');
  }

  function setLanguage(value: string) {
    language = value;
    storage?.setItem('ordina-language', value);
    loadNews();
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat(language, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  }

  function collectionRef(kind: string) {
    if (!user) throw new Error('Authentication required');
    if (kind === 'expenses') return collection(db, 'users', user.uid, 'monthlyData', monthId, 'expenses');
    if (kind === 'tasks') return collection(db, 'users', user.uid, 'dailyTasks');
    if (kind === 'events') return collection(db, 'users', user.uid, 'calendarEvents');
    return collection(db, 'users', user.uid, kind);
  }

  async function saveEntity(kind: string) {
    if (!form.name.trim() || !user) return;
    busy = true;
    try {
      const data: Entity = {
        name: form.name.trim(),
        createdAt: Timestamp.now(),
        ...(kind === 'expenses'
          ? { amount: Number(form.amount) || 0, category: form.category, date: form.date, notes: form.notes }
          : kind === 'debts'
            ? { totalAmount: Number(form.amount) || 0, paidAmount: 0, comment: form.notes }
            : kind === 'recurring'
              ? { amount: Number(form.amount) || 0, dueDay: Number(form.dueDay) || 1, details: form.notes }
              : kind === 'tasks'
                ? { date: form.date, status: 'Не выполнено', notes: form.notes }
                : { date: form.date, type: form.type, notes: form.notes }),
      };
      await addDoc(collectionRef(kind), data);
      modal = null;
      resetForm();
      notify('Saved successfully');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not save item');
    } finally {
      busy = false;
    }
  }

  async function removeEntity(kind: string, id: string) {
    if (!user) return;
    try {
      await deleteDoc(doc(collectionRef(kind), id));
      notify('Deleted');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not delete item');
    }
  }

  async function toggleTask(task: Entity) {
    if (!user) return;
    const done = task.status === 'Выполнено' || task.done;
    await updateDoc(doc(collectionRef('tasks'), task.id), { status: done ? 'Не выполнено' : 'Выполнено', done: !done });
  }

  async function handleAuth() {
    authError = '';
    if (!email || password.length < 6) {
      authError = 'Enter a valid email and a password of at least 6 characters.';
      return;
    }
    busy = true;
    try {
      if (authMode === 'login') await loginWithEmail(email, password);
      else await signupWithEmail(email, password);
    } catch (error: any) {
      authError = error?.code === 'auth/invalid-credential' ? 'Invalid email or password.' : error?.message || 'Authentication failed.';
    } finally {
      busy = false;
    }
  }

  function subscribe(kind: string, target: (value: Entity[]) => void) {
    if (!user) return;
    const unsubscribe = onSnapshot(collectionRef(kind), (snapshot) => {
      target(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, () => notify('Sync is temporarily unavailable; local changes may be delayed.'));
    cleanups.push(unsubscribe);
  }

  async function loadNews() {
    newsLoading = true;
    try {
      const service = await import('./lib/services/news');
      news = (service.getCachedNews(language) || (await service.fetchNews(language, 'all')));
    } finally { newsLoading = false; }
  }

  async function loadStocks() {
    stocksLoading = true;
    try {
      const service = await import('./lib/services/stocks');
      stocks = service.getCachedStocks() || (await service.fetchStocks());
    } finally { stocksLoading = false; }
  }

  function openCreate(kind: Modal) {
    resetForm();
    modal = kind;
  }

  function toggleRadio() {
    const player = getRadioPlayer();
    player.toggle().then(() => (radioPlaying = player.isPlaying())).catch(() => notify('Radio stream is unavailable'));
  }

  function addShopping() {
    if (!shoppingItem.trim()) return;
    shopping = [...shopping, { id: crypto.randomUUID(), name: shoppingItem.trim(), done: false }];
    shoppingItem = '';
    storage?.setItem('ordina-shopping', JSON.stringify(shopping));
  }

  onMount(() => {
    const timer = window.setInterval(() => (now = new Date()), 1000);
    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      user = nextUser;
      authResolved = true;
      cleanups.forEach((cleanup) => cleanup());
      cleanups = [];
      if (user) {
        subscribe('expenses', (value) => (expenses = value));
        subscribe('debts', (value) => (debts = value));
        subscribe('recurringExpenses', (value) => (recurring = value));
        subscribe('tasks', (value) => (tasks = value));
        subscribe('events', (value) => (events = value));
      }
    });
    import('./lib/services/weather').then((service) => service.fetchWeather('Baku', language)).then((value) => (weather = value));
    loadNews();
    loadStocks();
    const player = getRadioPlayer();
    player.on('play', () => (radioPlaying = true));
    player.on('pause', () => (radioPlaying = false));
    player.on('error', () => (radioTitle = 'Stream unavailable'));
    return () => {
      window.clearInterval(timer);
      unsubscribeAuth();
      cleanups.forEach((cleanup) => cleanup());
      player.destroy();
    };
  });
</script>

{#if !user}
  <main class={appClass + ' auth-screen'}>
    <section class="auth-card">
      <div class="brand-mark">O</div>
      <p class="eyebrow">LIFE ORDER ASSISTANT</p>
      <h1>ORDINA</h1>
      <p class="muted">One calm place for your money, tasks and everyday life.</p>
      {#if authError}<div class="error">{authError}</div>{/if}
      <form on:submit|preventDefault={handleAuth}>
        <label>Email<input type="email" bind:value={email} autocomplete="email" required placeholder="you@example.com" /></label>
        <label>Password<input type="password" bind:value={password} minlength="6" autocomplete={authMode === 'login' ? 'current-password' : 'new-password'} required placeholder="••••••••" /></label>
        <button class="primary wide" disabled={busy}>{busy ? 'Working…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button class="ghost wide" on:click={() => loginWithGoogle().catch((error) => (authError = error.message))}>Continue with Google</button>
      <button class="text-button" on:click={() => (authMode = authMode === 'login' ? 'signup' : 'login')}>
        {authMode === 'login' ? 'Create a new account' : 'I already have an account'}
      </button>
    </section>
  </main>
{:else if authResolved}
  <div class={appClass}>
    <header class="topbar">
      <button class="brand" on:click={() => (activeTab = 'dashboard')} aria-label="Open dashboard"><span class="brand-mark small">O</span><span><strong>ORDINA</strong><small>life, in order</small></span></button>
      <div class="top-widgets">
        <div class="mini-widget"><span class="weather-icon">☼</span><strong>{weather.temp}°</strong><small>{weather.city}</small></div>
        <div class="mini-widget clock"><strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong><small>{now.toLocaleDateString()}</small></div>
        <button class="radio" on:click={toggleRadio} aria-label="Toggle radio">{radioPlaying ? '❚❚' : '▶'} <span>{radioTitle || 'AzerbaiJazz'}</span></button>
      </div>
      <div class="top-actions">
        <button on:click={() => setTheme()} title="Toggle theme">{dark ? '☀' : '☾'}</button>
        <select value={language} on:change={(event) => setLanguage(event.currentTarget.value)} aria-label="Language"><option value="en">EN</option><option value="ru">RU</option><option value="az">AZ</option><option value="it">IT</option></select>
        <button on:click={() => (currency = currency === 'AZN' ? 'USD' : 'AZN')} title="Toggle currency">{currency}</button>
        <button on:click={() => signOut(auth)} title="Sign out">↪</button>
      </div>
    </header>
    <div class="layout">
      <aside class="sidebar">
        <p class="nav-label">WORKSPACE</p>
        {#each tabs as tab}<button class:active={activeTab === tab.id} on:click={() => (activeTab = tab.id)}><span class="nav-icon">{tab.icon}</span>{tab.label}</button>{/each}
        <div class="sidebar-bottom"><button on:click={() => openCreate('calculator')}>⌗ <span>Calculator</span></button><button on:click={() => openCreate('shopping')}>▣ <span>Shopping list</span></button></div>
      </aside>
      <main class="content">
        <div class="page-heading"><div><p class="eyebrow">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1></div><div class="quick-actions"><button class="primary" on:click={() => openCreate(activeTab === 'tasks' ? 'task' : activeTab === 'calendar' ? 'event' : activeTab === 'debts' ? 'debt' : activeTab === 'recurring' ? 'recurring' : 'expense')}>＋ Add new</button></div></div>

        {#if activeTab === 'dashboard'}
          <section class="stats-grid"><article><span>Spent this month</span><strong>{formatMoney(totalExpenses)}</strong><small class="positive">Live from Firebase</small></article><article><span>Outstanding debts</span><strong>{formatMoney(totalDebt)}</strong><small>{debts.length} active records</small></article><article><span>Tasks completed</span><strong>{completedTasks}<small> / {tasks.length}</small></strong><small>{tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0}% progress</small></article><article><span>Upcoming events</span><strong>{events.filter((item) => item.date >= dateId).length}</strong><small>in your calendar</small></article></section>
          <div class="dashboard-grid"><section class="panel chart-panel"><div class="panel-head"><div><p class="eyebrow">FINANCE OVERVIEW</p><h2>Monthly spending</h2></div><span class="pill">{monthId}</span></div><div class="bars">{#each Array(12) as _, index}<div class="bar-wrap"><div class="bar" style:height={getBarHeight(index) + '%'}></div><small>{['J','F','M','A','M','J','J','A','S','O','N','D'][index]}</small></div>{/each}</div></section><section class="panel"><div class="panel-head"><div><p class="eyebrow">TODAY</p><h2>Tasks</h2></div><button class="icon-button" on:click={() => (activeTab = 'tasks')}>→</button></div>{#if displayedTasks.length}{#each displayedTasks.slice(0, 4) as task}<label class="task-row"><input type="checkbox" checked={task.status === 'Выполнено' || task.done} on:change={() => toggleTask(task)} /><span class:done={task.status === 'Выполнено' || task.done}>{task.name}</span></label>{/each}{:else}<div class="empty">No tasks yet. Add one to get started.</div>{/if}</section></div>
          <div class="dashboard-grid lower"><section class="panel"><div class="panel-head"><div><p class="eyebrow">MARKETS</p><h2>Watchlist</h2></div><button class="icon-button" on:click={loadStocks}>{stocksLoading ? '…' : '↻'}</button></div>{#if stocks.length}{#each stocks.slice(0, 5) as quote}<div class="market-row"><span>{quote.symbol}</span><strong>{quote.price?.toFixed(2)}</strong><em class:negative={quote.percentChange < 0}>{quote.percentChange >= 0 ? '+' : ''}{quote.percentChange?.toFixed(2)}%</em></div>{/each}{:else}<div class="empty">Market data will appear here.</div>{/if}</section><section class="panel news-panel"><div class="panel-head"><div><p class="eyebrow">INFORMATION</p><h2>Latest news</h2></div><button class="icon-button" on:click={loadNews}>{newsLoading ? '…' : '↻'}</button></div>{#if news.length}{#each news.slice(0, 3) as article}<a class="news-row" href={article.url} target="_blank" rel="noreferrer"><span>{article.source}</span><strong>{article.title}</strong></a>{/each}{:else}<div class="empty">News is loading.</div>{/if}</section></div>
        {:else if activeTab === 'expenses'}
          <section class="panel"><div class="panel-head"><div><p class="eyebrow">MONTHLY DATA / {monthId}</p><h2>Expenses</h2></div><strong class="total">{formatMoney(totalExpenses)}</strong></div><DataTable items={expenses} kind="expenses" onRemove={removeEntity} /></section>
        {:else if activeTab === 'debts'}
          <section class="panel"><div class="panel-head"><div><p class="eyebrow">FINANCIAL COMMITMENTS</p><h2>Debts</h2></div><strong class="total">{formatMoney(totalDebt)}</strong></div><DataTable items={debts} kind="debts" onRemove={removeEntity} /></section>
        {:else if activeTab === 'recurring'}
          <section class="panel"><div class="panel-head"><div><p class="eyebrow">AUTOMATIC PLANNING</p><h2>Recurring expenses</h2></div></div><DataTable items={recurring} kind="recurringExpenses" onRemove={removeEntity} /></section>
        {:else if activeTab === 'tasks'}
          <section class="panel"><div class="panel-head"><div><p class="eyebrow">DAILY FOCUS</p><h2>Tasks</h2></div><span class="pill">{completedTasks} completed</span></div>{#if tasks.length}{#each tasks as task}<div class="list-row"><label class="task-row"><input type="checkbox" checked={task.status === 'Выполнено' || task.done} on:change={() => toggleTask(task)} /><span class:done={task.status === 'Выполнено' || task.done}>{task.name}</span></label><small>{task.date || 'Any day'}</small><button class="danger-link" on:click={() => removeEntity('tasks', task.id)}>Delete</button></div>{/each}{:else}<div class="empty">Your task list is clear.</div>{/if}</section>
        {:else}
          <section class="panel"><div class="panel-head"><div><p class="eyebrow">PLAN AHEAD</p><h2>Calendar</h2></div></div>{#if events.length}{#each events as event}<div class="list-row"><div><strong>{event.name}</strong><small>{event.date} · {event.type}</small></div><button class="danger-link" on:click={() => removeEntity('events', event.id)}>Delete</button></div>{/each}{:else}<div class="empty">No events scheduled.</div>{/if}</section>
        {/if}
      </main>
    </div>
  </div>
{/if}
{#if !authResolved}<main class={appClass + ' auth-screen'}><div class="loading-overlay">Loading ORDINA…</div></main>{/if}

{#if modal}
  <div class="modal-backdrop" role="presentation" on:click={(event) => event.target === event.currentTarget && (modal = null)}>
    <section class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" on:click={() => (modal = null)}>×</button>
      {#if modal === 'calculator'}
        <p class="eyebrow">QUICK TOOL</p><h2>Calculator</h2><input class="calculator-display" bind:value={calculator} readonly /><div class="calculator-grid">{#each ['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'] as key}<button on:click={() => key === '=' ? (calculator = String(Function(`return ${calculator.replace('×', '*').replace('÷', '/')}`)())) : key === '−' ? (calculator += '-') : (calculator += key)}>{key}</button>{/each}</div><button class="ghost wide" on:click={() => (calculator = '')}>Clear</button>
      {:else if modal === 'shopping'}
        <p class="eyebrow">QUICK TOOL</p><h2>Shopping list</h2><div class="shopping-add"><input bind:value={shoppingItem} placeholder="Add an item" on:keydown={(event) => event.key === 'Enter' && addShopping()} /><button class="primary" on:click={addShopping}>Add</button></div>{#each shopping as item}<label class="task-row"><input type="checkbox" checked={item.done} on:change={() => { item.done = !item.done; shopping = [...shopping]; storage?.setItem('ordina-shopping', JSON.stringify(shopping)); }} /><span class:done={item.done}>{item.name}</span></label>{/each}
      {:else}
        <p class="eyebrow">NEW RECORD</p><h2>{modal === 'task' ? 'Add task' : modal === 'event' ? 'Add calendar event' : modal === 'debt' ? 'Add debt' : modal === 'recurring' ? 'Add recurring expense' : 'Add expense'}</h2>
        <form on:submit|preventDefault={() => saveEntity(modal === 'task' ? 'tasks' : modal === 'event' ? 'events' : modal === 'debt' ? 'debts' : modal === 'recurring' ? 'recurringExpenses' : 'expenses')}><label>Name<input bind:value={form.name} required placeholder="What is this for?" /></label>{#if ['expense','debt','recurring'].includes(modal)}<label>Amount<input type="number" min="0" step="0.01" bind:value={form.amount} required placeholder="0.00" /></label>{/if}{#if modal === 'expense'}<label>Category<input bind:value={form.category} placeholder="General" /></label>{/if}{#if modal === 'recurring'}<label>Due day<input type="number" min="1" max="31" bind:value={form.dueDay} /></label>{/if}{#if modal === 'event'}<label>Type<select bind:value={form.type}><option value="event">Event</option><option value="meeting">Meeting</option><option value="birthday">Birthday</option><option value="wedding">Wedding</option></select></label>{/if}<label>Date<input type="date" bind:value={form.date} /></label><label>Notes<textarea bind:value={form.notes} rows="3" placeholder="Optional details"></textarea></label><button class="primary wide" disabled={busy}>{busy ? 'Saving…' : 'Save record'}</button></form>
      {/if}
    </section>
  </div>
{/if}
{#if toast}<div class="toast">{toast}</div>{/if}
