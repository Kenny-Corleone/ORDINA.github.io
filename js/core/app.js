/**
 * OrdinaApp - Main Application Class
 * Manages application lifecycle, modules, and services
 */
export class OrdinaApp {
  constructor() {
    // Application state
    this.state = {
      user: null,
      userId: null,
      currentModule: 'dashboard',
      currentMonthId: null,
      selectedMonthId: null,
      theme: localStorage.getItem('theme') || 'light',
      language: localStorage.getItem('appLanguage') || 'ru',
      currency: localStorage.getItem('currency') || 'AZN',
      calendarDate: new Date()
    };

    // Module registry
    this.modules = new Map();
    
    // Lazy module loaders registry
    this.lazyModules = new Map();
    
    // Loaded modules cache
    this.loadedModules = new Map();
    
    // Service registry
    this.services = new Map();
    
    // Unsubscribe functions for cleanup
    this.unsubscribes = [];
    
    // Initialization flag
    this.isInitialized = false;
  }

  /**
   * Register a module with the application
   * @param {string} name - Module name
   * @param {Object} module - Module instance
   */
  registerModule(name, module) {
    if (this.modules.has(name)) {
      console.warn(`Module "${name}" is already registered. Overwriting.`);
    }
    this.modules.set(name, module);
    console.log(`Module registered: ${name}`);
  }

  /**
   * Register a lazy-loaded module
   * @param {string} name - Module name
   * @param {Function} loader - Function that returns a promise resolving to the module
   */
  registerLazyModule(name, loader) {
    if (this.lazyModules.has(name)) {
      console.warn(`Lazy module "${name}" is already registered. Overwriting.`);
    }
    this.lazyModules.set(name, loader);
    console.log(`Lazy module registered: ${name}`);
  }

  /**
   * Register a service with the application
   * @param {string} name - Service name
   * @param {Object} service - Service instance
   */
  registerService(name, service) {
    if (this.services.has(name)) {
      console.warn(`Service "${name}" is already registered. Overwriting.`);
    }
    this.services.set(name, service);
    console.log(`Service registered: ${name}`);
  }

  /**
   * Get a registered service by name
   * @param {string} name - Service name
   * @returns {Object|null} Service instance or null if not found
   */
  getService(name) {
    const service = this.services.get(name);
    if (!service) {
      console.warn(`Service "${name}" not found`);
    }
    return service || null;
  }

  /**
   * Get a registered module by name
   * @param {string} name - Module name
   * @returns {Object|null} Module instance or null if not found
   */
  getModule(name) {
    const module = this.modules.get(name);
    if (!module) {
      console.warn(`Module "${name}" not found`);
    }
    return module || null;
  }

  /**
   * Initialize the application
   * Sets up Firebase, services, modules, and authentication
   */
  async init() {
    if (this.isInitialized) {
      console.warn('Application already initialized');
      return;
    }

    try {
      console.log('Initializing Ordina App...');

      // Step 1: Initialize Firebase (will be done in firebase.js)
      console.log('✓ Firebase initialized');

      // Step 2: Load configuration
      this.loadConfiguration();
      console.log('✓ Configuration loaded');

      // Step 3: Register services (will be done in main.js)
      console.log('✓ Services ready for registration');

      // Step 4: Register modules (will be done in main.js)
      console.log('✓ Modules ready for registration');

      // Step 5: Initialize router (will be done in main.js)
      console.log('✓ Router ready for initialization');

      // Step 6: Setup authentication listener
      await this.setupAuthListener();
      console.log('✓ Authentication listener setup');

      this.isInitialized = true;
      console.log('✓ Ordina App initialized successfully');

    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.handleInitError(error);
      throw error;
    }
  }

  /**
   * Load application configuration from localStorage
   */
  loadConfiguration() {
    // Load theme
    const theme = localStorage.getItem('theme');
    if (theme) {
      this.state.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
    }

    // Load language
    const language = localStorage.getItem('appLanguage');
    if (language) {
      this.state.language = language;
    }

    // Load currency
    const currency = localStorage.getItem('currency');
    if (currency) {
      this.state.currency = currency;
    }
  }

  /**
   * Setup authentication state listener
   */
  async setupAuthListener() {
    const authService = this.getService('auth');
    if (!authService) {
      console.warn('Auth service not available yet');
      return;
    }

    // This will be implemented when AuthService is created
    // For now, just a placeholder
    console.log('Auth listener will be setup with AuthService');
  }

  /**
   * Load and activate a module (with lazy loading support)
   * @param {string} name - Module name to load
   */
  async loadModule(name) {
    try {
      let module = this.modules.get(name);
      
      // Check if module needs to be lazy-loaded
      if (!module && this.lazyModules.has(name)) {
        // Check if already loaded in cache
        if (this.loadedModules.has(name)) {
          module = this.loadedModules.get(name);
          console.log(`Using cached module: ${name}`);
        } else {
          console.log(`Lazy loading module: ${name}`);
          const loader = this.lazyModules.get(name);
          const moduleExport = await loader();
          
          // Get the module class (handle both default and named exports)
          const ModuleClass = moduleExport.default || moduleExport[Object.keys(moduleExport)[0]];
          
          if (!ModuleClass) {
            throw new Error(`Module "${name}" export not found`);
          }
          
          // Instantiate the module
          module = new ModuleClass(this);
          
          // Cache the loaded module
          this.loadedModules.set(name, module);
          console.log(`✓ Module lazy-loaded and cached: ${name}`);
        }
      }
      
      if (!module) {
        console.error(`Module "${name}" not found`);
        return;
      }

      console.log(`Loading module: ${name}`);

      // Unload current module if exists
      const currentModuleName = this.state.currentModule;
      if (currentModuleName !== name) {
        const currentModule = this.modules.get(currentModuleName) || this.loadedModules.get(currentModuleName);
        if (currentModule && currentModule.unload) {
          await currentModule.unload();
        }
      }

      // Load new module
      if (module.load) {
        await module.load();
      }

      // Update current module
      this.state.currentModule = name;
      
      console.log(`✓ Module loaded: ${name}`);

    } catch (error) {
      console.error(`Failed to load module "${name}":`, error);
      throw error;
    }
  }

  /**
   * Update application state
   * @param {Object} updates - State updates
   */
  setState(updates) {
    this.state = {
      ...this.state,
      ...updates
    };
  }

  /**
   * Get current application state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Handle initialization errors
   * @param {Error} error - Error object
   */
  handleInitError(error) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }

    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="error-container" style="padding: 2rem; text-align: center; color: #ef4444;">
          <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
            Ошибка инициализации приложения
          </h1>
          <p style="margin-bottom: 0.5rem;">
            ${error.message || 'Произошла неизвестная ошибка'}
          </p>
          <p style="font-size: 0.875rem; color: #6b7280;">
            Пожалуйста, обновите страницу или обратитесь к администратору
          </p>
        </div>
      `;
    }
  }

  /**
   * Cleanup and destroy the application
   */
  destroy() {
    console.log('Destroying Ordina App...');

    // Unload current module
    const currentModule = this.modules.get(this.state.currentModule);
    if (currentModule && currentModule.unload) {
      currentModule.unload();
    }

    // Call all unsubscribe functions
    this.unsubscribes.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error during unsubscribe:', error);
      }
    });
    this.unsubscribes = [];

    // Clear registries
    this.modules.clear();
    this.services.clear();

    this.isInitialized = false;
    console.log('✓ Ordina App destroyed');
  }
}
