/**
 * Router - Navigation and routing management
 * Handles navigation between modules and UI updates
 */
export class Router {
  constructor(app) {
    this.app = app;
    this.routes = new Map();
    this.currentRoute = null;
    this.defaultRoute = 'dashboard';
    this.isInitialized = false;
  }

  /**
   * Register a route with its corresponding module
   * @param {string} path - Route path (e.g., 'dashboard', 'expenses')
   * @param {string} moduleName - Name of the module to load
   * @param {Object} options - Additional route options
   */
  register(path, moduleName, options = {}) {
    if (this.routes.has(path)) {
      console.warn(`Route "${path}" is already registered. Overwriting.`);
    }

    this.routes.set(path, {
      moduleName,
      requiresAuth: options.requiresAuth === true, // Default to false for testing
      title: options.title || path
    });

    console.log(`Route registered: ${path} -> ${moduleName}`);
  }

  /**
   * Initialize the router
   * Sets up event listeners and loads initial route
   */
  init() {
    if (this.isInitialized) {
      console.warn('Router already initialized');
      return;
    }

    // Setup tab navigation listeners
    this.setupTabListeners();

    // Setup browser history listeners (optional)
    this.setupHistoryListeners();

    // Load initial route
    const initialRoute = this.getInitialRoute();
    this.navigate(initialRoute, { replace: true });

    this.isInitialized = true;
    console.log('✓ Router initialized');
  }

  /**
   * Setup click listeners for tab buttons
   */
  setupTabListeners() {
    document.addEventListener('click', (event) => {
      const tabButton = event.target.closest('[data-route]');
      
      if (tabButton) {
        event.preventDefault();
        const route = tabButton.dataset.route;
        
        if (route) {
          this.navigate(route);
        }
      }
    });
  }

  /**
   * Setup browser history listeners for back/forward navigation
   */
  setupHistoryListeners() {
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.route) {
        this.navigate(event.state.route, { skipHistory: true });
      }
    });
  }

  /**
   * Get the initial route from URL hash or default
   * @returns {string} Initial route path
   */
  getInitialRoute() {
    // Check URL hash
    const hash = window.location.hash.slice(1);
    if (hash && this.routes.has(hash)) {
      return hash;
    }

    // Return default route (dashboard)
    // Auth is optional for now
    return this.defaultRoute;
  }

  /**
   * Navigate to a route
   * @param {string} path - Route path to navigate to
   * @param {Object} options - Navigation options
   */
  async navigate(path, options = {}) {
    try {
      // Check if route exists
      const route = this.routes.get(path);
      if (!route) {
        console.error(`Route "${path}" not found`);
        return;
      }

      // Check authentication requirement (disabled for now)
      // if (route.requiresAuth && !this.app.state.user) {
      //   console.warn(`Route "${path}" requires authentication`);
      //   this.navigate('auth', { replace: true });
      //   return;
      // }

      // Don't navigate if already on this route
      if (this.currentRoute === path && !options.force) {
        console.log(`Already on route: ${path}`);
        return;
      }

      console.log(`Navigating to: ${path}`);

      // Update browser history
      if (!options.skipHistory) {
        this.updateHistory(path, options.replace);
      }

      // Update URL hash
      window.location.hash = path;

      // Update UI (tabs)
      this.updateUI(path);

      // Load the module
      await this.app.loadModule(route.moduleName);

      // Update current route
      this.currentRoute = path;

      // Update page title
      if (route.title) {
        document.title = `ORDINA - ${route.title}`;
      }

      console.log(`✓ Navigated to: ${path}`);

    } catch (error) {
      console.error(`Navigation error to "${path}":`, error);
      
      // Try to navigate to default route on error
      if (path !== this.defaultRoute) {
        console.log('Attempting to navigate to default route...');
        this.navigate(this.defaultRoute, { force: true });
      }
    }
  }

  /**
   * Update browser history
   * @param {string} path - Route path
   * @param {boolean} replace - Whether to replace current history entry
   */
  updateHistory(path, replace = false) {
    const state = { route: path };
    const url = `#${path}`;

    if (replace) {
      window.history.replaceState(state, '', url);
    } else {
      window.history.pushState(state, '', url);
    }
  }

  /**
   * Update UI to reflect current route
   * Highlights active tab and shows/hides content
   * @param {string} path - Current route path
   */
  updateUI(path) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('[data-route]');
    tabButtons.forEach(button => {
      const buttonRoute = button.dataset.route;
      const isActive = buttonRoute === path;
      
      // Toggle active class
      button.classList.toggle('tab-active', isActive);
      button.classList.toggle('active', isActive);
      
      // Update aria-selected for accessibility
      button.setAttribute('aria-selected', isActive);
    });

    // Update content visibility
    const contentSections = document.querySelectorAll('[data-module-content]');
    contentSections.forEach(section => {
      const sectionModule = section.dataset.moduleContent;
      const route = this.routes.get(path);
      
      if (route && sectionModule === route.moduleName) {
        section.classList.remove('hidden');
        section.style.display = '';
      } else {
        section.classList.add('hidden');
        section.style.display = 'none';
      }
    });
  }

  /**
   * Get current route
   * @returns {string|null} Current route path
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if a route exists
   * @param {string} path - Route path to check
   * @returns {boolean} True if route exists
   */
  hasRoute(path) {
    return this.routes.has(path);
  }

  /**
   * Get all registered routes
   * @returns {Array} Array of route paths
   */
  getRoutes() {
    return Array.from(this.routes.keys());
  }

  /**
   * Set default route
   * @param {string} path - Default route path
   */
  setDefaultRoute(path) {
    if (!this.routes.has(path)) {
      console.warn(`Cannot set default route to "${path}" - route not registered`);
      return;
    }
    this.defaultRoute = path;
    console.log(`Default route set to: ${path}`);
  }

  /**
   * Navigate back in history
   */
  back() {
    window.history.back();
  }

  /**
   * Navigate forward in history
   */
  forward() {
    window.history.forward();
  }

  /**
   * Reload current route
   */
  reload() {
    if (this.currentRoute) {
      this.navigate(this.currentRoute, { force: true });
    }
  }
}
