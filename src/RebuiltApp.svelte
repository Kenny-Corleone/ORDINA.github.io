<script lang="ts">
  import { onMount } from 'svelte';

  type Section = 'dashboard' | 'expenses' | 'debts' | 'recurring' | 'tasks' | 'calendar';
  type RecordItem = { id: string; name: string; amount?: number; date?: string; category?: string; done?: boolean; notes?: string; type?: string };
  type Language = 'en' | 'ru' | 'az' | 'it';

  const copy: Record<Language, Record<string, string>> = {
    en: { dashboard: 'Dashboard', expenses: 'Expenses', debts: 'Debts', recurring: 'Recurring', tasks: 'Tasks', calendar: 'Calendar', add: 'Add new', spent: 'Spent this month', balance: 'Outstanding debts', progress: 'Task progress', events: 'Upcoming events', save: 'Save', cancel: 'Cancel', delete: 'Delete', complete: 'Complete', signIn: 'Open workspace', welcome: 'Your calm command centre', email: 'Email', password: 'Password', demo: 'Demo mode is active', name: 'Name', amount: 'Amount', date: 'Date', category: 'Category', notes: 'Notes', empty: 'Nothing here yet', calculator: 'Calculator', shopping: 'Shopping list', item: 'Item', addItem: 'Add item', clear: 'Clear', light: 'Light', dark: 'Dark', offline: 'Local mode', synced: 'Firebase ready' },
    ru: { dashboard: 'Обзор', expenses: 'Расходы', debts: 'Долги', recurring: 'Регулярные', tasks: 'Задачи', calendar: 'Календарь', add: 'Добавить', spent: 'Расходы за месяц', balance: 'Долги к оплате', progress: 'Прогресс задач', events: 'Предстоящие события', save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', complete: 'Готово', signIn: 'Открыть приложение', welcome: 'Ваш спокойный центр управления', email: 'Эл. почта', password: 'Пароль', demo: 'Работает демо-режим', name: 'Название', amount: 'Сумма', date: 'Дата', category: 'Категория', notes: 'Заметки', empty: 'Здесь пока ничего нет', calculator: 'Калькулятор', shopping: 'Список покупок', item: 'Товар', addItem: 'Добавить', clear: 'Очистить', light: 'Светлая', dark: 'Тёмная', offline: 'Локальный режим', synced: 'Firebase готов' },
    az: { dashboard: 'İdarə paneli', expenses: 'Xərclər', debts: 'Borclar', recurring: 'Təkrarlanan', tasks: 'Tapşırıqlar', calendar: 'Təqvim', add: 'Əlavə et', spent: 'Bu ay xərclər', balance: 'Ödəniləcək borclar', progress: 'Tapşırıq irəliləyişi', events: 'Gələcək tədbirlər', save: 'Yadda saxla', cancel: 'Ləğv et', delete: 'Sil', complete: 'Tamamlandı', signIn: 'Tətbiqi aç', welcome: 'Sakit idarəetmə mərkəziniz', email: 'E-poçt', password: 'Şifrə', demo: 'Demo rejimi aktivdir', name: 'Ad', amount: 'Məbləğ', date: 'Tarix', category: 'Kateqoriya', notes: 'Qeydlər', empty: 'Hələ heç nə yoxdur', calculator: 'Kalkulyator', shopping: 'Alış-veriş siyahısı', item: 'Məhsul', addItem: 'Əlavə et', clear: 'Təmizlə', light: 'İşıqlı', dark: 'Qaranlıq', offline: 'Lokal rejim', synced: 'Firebase hazır' },
    it: { dashboard: 'Dashboard', expenses: 'Spese', debts: 'Debiti', recurring: 'Ricorrenti', tasks: 'Attività', calendar: 'Calendario', add: 'Aggiungi', spent: 'Spese del mese', balance: 'Debiti aperti', progress: 'Progresso attività', events: 'Prossimi eventi', save: 'Salva', cancel: 'Annulla', delete: 'Elimina', complete: 'Completato', signIn: 'Apri area', welcome: 'Il tuo centro di controllo', email: 'Email', password: 'Password', demo: 'Modalità demo attiva', name: 'Nome', amount: 'Importo', date: 'Data', category: 'Categoria', notes: 'Note', empty: 'Ancora nulla', calculator: 'Calcolatrice', shopping: 'Lista della spesa', item: 'Articolo', addItem: 'Aggiungi', clear: 'Cancella', light: 'Chiaro', dark: 'Scuro', offline: 'Modalità locale', synced: 'Firebase pronto' }
  };
  const icons: Record<Section, string> = { dashboard: '⌂', expenses: '↕', debts: '◈', recurring: '⟳', tasks: '✓', calendar: '□' };
  const today = () => new Date().toISOString().slice(0, 10);
  const key = (section: string) => `ordina-${section}`;

  let language: Language = 'en';
  let dark = false;
  let section: Section = 'dashboard';
  let signedIn = false;
  let email = '';
  let password = '';
  let error = '';
  let modal: 'record' | 'calculator' | 'shopping' | null = null;
  let records: Record<Exclude<Section, 'dashboard'>, RecordItem[]> = { expenses: [], debts: [], recurring: [], tasks: [], calendar: [] };
  let form = { name: '', amount: '', date: today(), category: 'General', notes: '' };
  let calculator = '';
  let shoppingInput = '';
  let shopping: { id: string; name: string; done: boolean }[] = [];
  let toast = '';
  let now = new Date();

  $: t = (id: string) => copy[language][id] || copy.en[id] || id;
  $: currency = localStorage?.getItem('ordina-currency') || 'AZN';
  $: expensesTotal = records.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  $: debtTotal = records.debts.reduce((sum, item) => sum + (item.amount || 0), 0);
  $: completeCount = records.tasks.filter((item) => item.done).length;
  $: monthLabel = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(now);
  $: appClass = `app ${dark ? 'dark' : ''}`;

  function money(value: number) {
    return new Intl.NumberFormat(language, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  }
  function notify(message: string) {
    toast = message;
    window.setTimeout(() => (toast = ''), 2200);
  }
  function persist() {
    Object.entries(records).forEach(([name, items]) => localStorage.setItem(key(name), JSON.stringify(items)));
    localStorage.setItem('ordina-shopping', JSON.stringify(shopping));
  }
  function enter() {
    if (email && !email.includes('@')) { error = 'Please enter a valid email.'; return; }
    signedIn = true; error = ''; localStorage.setItem('ordina-session', 'demo');
  }
  function openRecord(target = section) {
    section = target === 'dashboard' ? 'expenses' : target;
    form = { name: '', amount: '', date: today(), category: 'General', notes: '' };
    modal = 'record';
  }
  function saveRecord() {
    if (!form.name.trim()) return notify('Add a name first');
    const item: RecordItem = { id: crypto.randomUUID(), name: form.name.trim(), amount: Number(form.amount) || 0, date: form.date, category: form.category, notes: form.notes, done: false };
    records = { ...records, [section]: [...records[section], item] };
    persist(); modal = null; notify(t('save'));
  }
  function removeRecord(target: Exclude<Section, 'dashboard'>, id: string) {
    records = { ...records, [target]: records[target].filter((item) => item.id !== id) }; persist(); notify(t('delete'));
  }
  function toggleTask(id: string) {
    records = { ...records, tasks: records.tasks.map((item) => item.id === id ? { ...item, done: !item.done } : item) }; persist();
  }
  function calculate(value: string) {
    if (value === '=') {
      try { calculator = String(Function(`"use strict"; return (${calculator.replace(/[^0-9+\-*/().]/g, '')})`)()); } catch { calculator = 'Error'; }
    } else if (value === 'C') calculator = ''; else calculator += value;
  }
  function addShopping() {
    if (!shoppingInput.trim()) return;
    shopping = [...shopping, { id: crypto.randomUUID(), name: shoppingInput.trim(), done: false }]; shoppingInput = ''; persist();
  }
  function setLanguage(value: Language) { language = value; localStorage.setItem('ordina-language', value); }
  function selectLanguage(event: Event) { setLanguage((event.currentTarget as HTMLSelectElement).value as Language); }
  function selectSection(value: string) { if (value in icons) section = value as Section; }
  function iconFor(value: string) { return icons[value as Section] || ''; }

  onMount(() => {
    language = (localStorage.getItem('ordina-language') as Language) || 'en';
    dark = localStorage.getItem('ordina-theme') === 'dark';
    signedIn = localStorage.getItem('ordina-session') === 'demo';
    (Object.keys(records) as Exclude<Section, 'dashboard'>[]).forEach((name) => {
      try { records[name] = JSON.parse(localStorage.getItem(key(name)) || '[]'); } catch { records[name] = []; }
    });
    try { shopping = JSON.parse(localStorage.getItem('ordina-shopping') || '[]'); } catch { shopping = []; }
    const timer = window.setInterval(() => now = new Date(), 1000);
    const shortcut = (event: KeyboardEvent) => { if (event.key === 'Escape') modal = null; if (event.key === 'n' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); openRecord(); } };
    window.addEventListener('keydown', shortcut);
    return () => { clearInterval(timer); window.removeEventListener('keydown', shortcut); };
  });
</script>

{#if !signedIn}
  <main class={appClass + ' auth-screen'}>
    <div class="loading-overlay" hidden aria-hidden="true"></div>
    <section class="auth-card">
      <div class="brand-mark">O</div><p class="eyebrow">LIFE ORDER ASSISTANT</p><h1>ORDINA</h1>
      <p class="muted">{t('welcome')}</p>
      <form on:submit|preventDefault={enter}>
        <label>{t('email')}<input bind:value={email} type="email" placeholder="you@example.com" /></label>
        <label>{t('password')}<input bind:value={password} type="password" minlength="6" placeholder="••••••••" /></label>
        {#if error}<p class="error">{error}</p>{/if}
        <button class="primary wide" type="submit">{t('signIn')}</button>
      </form>
      <button class="ghost wide" on:click={enter}>Continue with Google</button>
      <p class="demo-note">✓ {t('demo')} · {t('offline')}</p>
    </section>
  </main>
{:else}
  <div class={appClass}>
    <div class="ambient"><span></span><span></span><span></span></div>
    <header class="topbar">
      <button class="brand" on:click={() => section = 'dashboard'}><span class="brand-mark small">O</span><span><strong>ORDINA</strong><small>life, in order</small></span></button>
      <div class="top-widgets"><div class="mini-widget"><span>☼</span><strong>{now.getHours()}:{String(now.getMinutes()).padStart(2, '0')}</strong><small>{monthLabel}</small></div><div class="mini-widget"><span>☁</span><strong>22°</strong><small>Baku</small></div></div>
      <div class="top-actions"><button on:click={() => { dark = !dark; localStorage.setItem('ordina-theme', dark ? 'dark' : 'light'); }} aria-label="Toggle theme">{dark ? '☀' : '☾'}</button><select value={language} on:change={selectLanguage} aria-label="Language">{#each Object.keys(copy) as code}<option value={code}>{code.toUpperCase()}</option>{/each}</select><button on:click={() => localStorage.setItem('ordina-currency', currency === 'AZN' ? 'USD' : 'AZN')}>{currency}</button><button on:click={() => { signedIn = false; localStorage.removeItem('ordina-session'); }}>↪</button></div>
    </header>
    <div class="layout">
      <aside class="sidebar"><p class="nav-label">WORKSPACE</p>{#each Object.keys(icons) as item}<button class:active={section === item} on:click={() => selectSection(item)}><span class="nav-icon">{iconFor(item)}</span><span>{t(item)}</span></button>{/each}<div class="sidebar-bottom"><button on:click={() => modal = 'calculator'}>⌗ <span>{t('calculator')}</span></button><button on:click={() => modal = 'shopping'}>▣ <span>{t('shopping')}</span></button></div></aside>
      <main class="content">
        <div class="page-heading"><div><p class="eyebrow">{new Intl.DateTimeFormat(language, { weekday: 'long', month: 'long', day: 'numeric' }).format(now)}</p><h1>{t(section)}</h1></div>{#if section !== 'dashboard'}<button class="primary" on:click={() => openRecord()}>＋ {t('add')}</button>{/if}</div>
        {#if section === 'dashboard'}
          <section class="stats-grid"><article><span>{t('spent')}</span><strong>{money(expensesTotal)}</strong><small class="positive">{t('offline')}</small></article><article><span>{t('balance')}</span><strong>{money(debtTotal)}</strong><small>{records.debts.length} records</small></article><article><span>{t('progress')}</span><strong>{completeCount}/{records.tasks.length || 0}</strong><small>{records.tasks.length ? Math.round(completeCount / records.tasks.length * 100) : 0}%</small></article><article><span>{t('events')}</span><strong>{records.calendar.length}</strong><small>{monthLabel}</small></article></section>
          <div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><p class="eyebrow">OVERVIEW</p><h2>{monthLabel}</h2></div><button class="icon-button" on:click={() => openRecord('expenses')}>＋</button></div><div class="bars">{#each Array(12) as _, index}<div class="bar-wrap"><div class="bar" style={`height:${Math.max(8, Math.min(100, expensesTotal ? (index === now.getMonth() ? 100 : 24) : 8))}%`}></div><small>{['J','F','M','A','M','J','J','A','S','O','N','D'][index]}</small></div>{/each}</div></section><section class="panel"><div class="panel-head"><h2>{t('tasks')}</h2><button class="icon-button" on:click={() => section = 'tasks'}>→</button></div>{#if records.tasks.length}{#each records.tasks.slice(0, 5) as task}<label class="task-row"><input type="checkbox" checked={task.done} on:change={() => toggleTask(task.id)} /><span class:done={task.done}>{task.name}</span></label>{/each}{:else}<p class="empty">{t('empty')}</p>{/if}</section></div>
          <div class="dashboard-grid lower"><section class="panel"><div class="panel-head"><h2>Markets</h2><span class="pill">LIVE</span></div><div class="market-row"><span>AZN / USD</span><strong>0.588</strong><em>+0.12%</em></div><div class="market-row"><span>BTC / USD</span><strong>$62,430</strong><em>+1.84%</em></div></section><section class="panel"><div class="panel-head"><h2>News & radio</h2><button class="icon-button" on:click={() => notify('Radio preview ready')}>▶</button></div><p class="empty">Curated updates will appear here when connected.</p></section></div>
        {:else}
          <section class="panel"><div class="panel-head"><h2>{t(section)}</h2><strong class="total">{section === 'expenses' ? money(expensesTotal) : section === 'debts' ? money(debtTotal) : records[section].length}</strong></div>{#if records[section].length}{#each records[section] as item}<div class="list-row">{#if section === 'tasks'}<input type="checkbox" checked={item.done} on:change={() => toggleTask(item.id)} />{/if}<div class="data-main"><strong class:done={item.done}>{item.name}</strong><small>{item.date || item.category || t('complete')} {item.amount ? ` · ${money(item.amount)}` : ''}</small></div><button class="danger-link" on:click={() => removeRecord(section, item.id)}>{t('delete')}</button></div>{/each}{:else}<div class="empty large">{t('empty')}<br /><button class="text-button" on:click={() => openRecord()}>{t('add')}</button></div>{/if}</section>
        {/if}
      </main>
    </div>
  </div>
{/if}

{#if modal}
  <div class="modal-backdrop" role="presentation" on:click={(e) => e.target === e.currentTarget && (modal = null)}><section class="modal" role="dialog" aria-modal="true">
    <button class="modal-close" on:click={() => modal = null}>×</button>
    {#if modal === 'calculator'}<p class="eyebrow">QUICK TOOL</p><h2>{t('calculator')}</h2><input class="calculator-display" value={calculator} readonly /><div class="calculator-grid">{#each ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','C','='] as value}<button on:click={() => calculate(value)}>{value}</button>{/each}</div>
    {:else if modal === 'shopping'}<p class="eyebrow">QUICK TOOL</p><h2>{t('shopping')}</h2><div class="shopping-add"><input bind:value={shoppingInput} placeholder={t('item')} on:keydown={(e) => e.key === 'Enter' && addShopping()} /><button class="primary" on:click={addShopping}>{t('addItem')}</button></div>{#each shopping as item}<label class="task-row"><input type="checkbox" checked={item.done} on:change={() => { shopping = shopping.map((x) => x.id === item.id ? { ...x, done: !x.done } : x); persist(); }} /><span class:done={item.done}>{item.name}</span></label>{/each}
    {:else}<p class="eyebrow">NEW RECORD</p><h2>{t('add')} · {t(section)}</h2><form on:submit|preventDefault={saveRecord}><label>{t('name')}<input bind:value={form.name} required /></label>{#if section !== 'tasks' && section !== 'calendar'}<label>{t('amount')}<input type="number" min="0" step="0.01" bind:value={form.amount} /></label>{/if}<label>{t('date')}<input type="date" bind:value={form.date} /></label><label>{t('category')}<input bind:value={form.category} /></label><label>{t('notes')}<textarea bind:value={form.notes} rows="2"></textarea></label><button class="primary wide" type="submit">{t('save')}</button></form>{/if}
  </section></div>
{/if}
{#if toast}<div class="toast" role="status">{toast}</div>{/if}
