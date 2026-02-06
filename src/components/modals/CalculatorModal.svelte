<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let display = '';
  let currentValue = '';
  let previousValue = '';
  let operation = '';
  
  function handleNumber(num: string) {
    if (display === '0' || operation === '=') {
      display = num;
      operation = '';
    } else {
      display += num;
    }
  }
  
  function handleOperation(op: string) {
    if (previousValue && currentValue && operation && operation !== '=') {
      calculate();
    }
    previousValue = display;
    currentValue = '';
    operation = op;
    display = '';
  }
  
  function calculate() {
    const prev = parseFloat(previousValue);
    const curr = parseFloat(display);
    
    if (isNaN(prev) || isNaN(curr)) return;
    
    let result = 0;
    switch (operation) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '*':
        result = prev * curr;
        break;
      case '/':
        result = prev / curr;
        break;
    }
    
    display = result.toString();
    operation = '=';
    previousValue = '';
    currentValue = '';
  }
  
  function clear() {
    display = '';
    currentValue = '';
    previousValue = '';
    operation = '';
  }
  
  function backspace() {
    display = display.slice(0, -1);
  }
  
  function handleClose() {
    dispatch('close');
  }
</script>

<div class="calculator-modal">
  <!-- Display -->
  <div class="mb-3">
    <input
      id="calc-display"
      type="text"
      class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg w-full p-2.5 text-right font-mono text-gray-900 dark:text-gray-100"
      value={display || '0'}
      readonly
    />
  </div>
  
  <!-- Number pad -->
  <div class="grid grid-cols-4 gap-2">
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('7')}>7</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('8')}>8</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('9')}>9</button>
    <button class="calc-op bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700" on:click={() => handleOperation('/')}>÷</button>
    
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('4')}>4</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('5')}>5</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('6')}>6</button>
    <button class="calc-op bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700" on:click={() => handleOperation('*')}>×</button>
    
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('1')}>1</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('2')}>2</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('3')}>3</button>
    <button class="calc-op bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700" on:click={() => handleOperation('-')}>−</button>
    
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('0')}>0</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 opacity-50 cursor-not-allowed" disabled>,</button>
    <button class="calc-btn bg-gray-200 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={() => handleNumber('.')}>.</button>
    <button class="calc-op bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700" on:click={() => handleOperation('+')}>+</button>
  </div>
  
  <!-- Control buttons -->
  <div class="grid grid-cols-3 gap-2 mt-3">
    <button id="calc-clear" class="bg-red-600 text-white rounded-lg p-2 hover:bg-red-700" on:click={clear}>C</button>
    <button id="calc-back" class="bg-gray-300 dark:bg-gray-600 rounded-lg p-2 hover:bg-gray-400 dark:hover:bg-gray-500" on:click={backspace}>⌫</button>
    <button id="calc-eq" class="bg-green-600 text-white rounded-lg p-2 hover:bg-green-700" on:click={calculate}>=</button>
  </div>
  
  <!-- Close button -->
  <div class="flex justify-end gap-4 mt-6">
    <button
      type="button"
      class="cancel-btn text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      on:click={handleClose}
    >
      Закрыть
    </button>
  </div>
</div>

<style>
  .calculator-modal {
    padding: 0;
  }
  
  .calc-btn, .calc-op {
    font-size: 1.125rem;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .calc-btn:active, .calc-op:active {
    transform: scale(0.95);
  }
</style>
