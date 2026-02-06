/**
 * Critical User Flow Testing Utilities
 * 
 * Provides utilities to test critical user flows for errors
 * and ensure all operations complete successfully.
 * 
 * Requirements: 8.5
 * Validates: Property 29 (Critical Flow Completion)
 */

import { logger } from './logger';

/**
 * Flow test result
 */
export interface FlowTestResult {
  flowName: string;
  success: boolean;
  duration: number;
  error?: Error;
  steps: StepResult[];
}

/**
 * Step test result
 */
export interface StepResult {
  stepName: string;
  success: boolean;
  duration: number;
  error?: Error;
}

/**
 * Flow tester class
 */
export class FlowTester {
  private flowName: string;
  private steps: StepResult[] = [];
  private startTime: number = 0;
  
  constructor(flowName: string) {
    this.flowName = flowName;
  }
  
  /**
   * Start the flow test
   */
  start(): void {
    this.startTime = performance.now();
    this.steps = [];
    logger.debug(`Starting flow test: ${this.flowName}`);
  }
  
  /**
   * Test a step in the flow
   */
  async testStep<T>(
    stepName: string,
    stepFn: () => Promise<T>
  ): Promise<T> {
    const stepStartTime = performance.now();
    
    try {
      logger.debug(`Testing step: ${stepName}`);
      const result = await stepFn();
      
      const duration = performance.now() - stepStartTime;
      this.steps.push({
        stepName,
        success: true,
        duration
      });
      
      logger.debug(`Step completed: ${stepName} (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - stepStartTime;
      this.steps.push({
        stepName,
        success: false,
        duration,
        error: error as Error
      });
      
      logger.error(`Step failed: ${stepName}`, error);
      throw error;
    }
  }
  
  /**
   * Complete the flow test and return results
   */
  complete(): FlowTestResult {
    const duration = performance.now() - this.startTime;
    const success = this.steps.every(step => step.success);
    
    const result: FlowTestResult = {
      flowName: this.flowName,
      success,
      duration,
      steps: this.steps
    };
    
    if (success) {
      logger.info(`Flow test completed successfully: ${this.flowName} (${duration.toFixed(2)}ms)`);
    } else {
      logger.error(`Flow test failed: ${this.flowName}`);
    }
    
    return result;
  }
}

/**
 * Test a complete user flow
 * 
 * @param flowName - Name of the flow being tested
 * @param flowFn - Function that executes the flow steps
 * @returns Flow test result
 */
export async function testFlow(
  flowName: string,
  flowFn: (tester: FlowTester) => Promise<void>
): Promise<FlowTestResult> {
  const tester = new FlowTester(flowName);
  tester.start();
  
  try {
    await flowFn(tester);
    return tester.complete();
  } catch (error) {
    const result = tester.complete();
    result.error = error as Error;
    return result;
  }
}

/**
 * Critical flows to test
 */
export const CRITICAL_FLOWS = {
  ADD_EXPENSE: 'add-expense',
  PAY_DEBT: 'pay-debt',
  CREATE_TASK: 'create-task',
  ADD_RECURRING: 'add-recurring',
  CREATE_EVENT: 'create-event',
  SWITCH_MONTH: 'switch-month',
  SWITCH_LANGUAGE: 'switch-language',
  SWITCH_THEME: 'switch-theme'
} as const;

/**
 * Run all critical flow tests
 * 
 * This function should be called during development/testing
 * to verify all critical user flows work correctly.
 */
export async function runAllCriticalFlowTests(): Promise<FlowTestResult[]> {
  logger.info('Running all critical flow tests...');
  
  const results: FlowTestResult[] = [];
  
  // Note: Actual flow implementations would be added here
  // For now, this provides the framework for testing
  
  logger.info(`Completed ${results.length} flow tests`);
  return results;
}

/**
 * Generate flow test report
 */
export function generateFlowTestReport(results: FlowTestResult[]): string {
  const totalFlows = results.length;
  const successfulFlows = results.filter(r => r.success).length;
  const failedFlows = totalFlows - successfulFlows;
  
  let report = `\n=== Critical Flow Test Report ===\n`;
  report += `Total Flows: ${totalFlows}\n`;
  report += `Successful: ${successfulFlows}\n`;
  report += `Failed: ${failedFlows}\n`;
  report += `Success Rate: ${((successfulFlows / totalFlows) * 100).toFixed(1)}%\n\n`;
  
  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    report += `${status} ${result.flowName} (${result.duration.toFixed(2)}ms)\n`;
    
    if (!result.success) {
      result.steps.forEach(step => {
        if (!step.success) {
          report += `  ✗ ${step.stepName}: ${step.error?.message || 'Unknown error'}\n`;
        }
      });
    }
  });
  
  return report;
}
