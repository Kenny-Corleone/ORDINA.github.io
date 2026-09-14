/**
 * Privacy-safe error telemetry.
 *
 * Only operational metadata is sent. Callers must not pass user records,
 * request bodies, document data, or error messages containing financial data.
 */

export interface TelemetryError {
  module: string;
  action: string;
  errorType: string;
  fatal: boolean;
}

export interface ErrorTelemetry {
  captureError(error: TelemetryError): void;
}

const noopTelemetry: ErrorTelemetry = {
  captureError: () => undefined
};

function getTelemetry(): ErrorTelemetry {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return noopTelemetry;
  }

  const gtag = window.gtag;
  if (!gtag) return noopTelemetry;

  return {
    captureError: ({ module, action, errorType, fatal }) => {
      gtag('event', 'exception', {
        description: `${module}:${action}:${errorType}`,
        fatal
      });
    }
  };
}

export function captureErrorTelemetry(
  error: unknown,
  context: Pick<TelemetryError, 'module' | 'action'>,
  fatal = false
): void {
  const errorType = error instanceof Error ? error.name : 'UnknownError';

  try {
    getTelemetry().captureError({
      module: context.module,
      action: context.action,
      errorType,
      fatal
    });
  } catch {
    // Telemetry must never affect the user operation.
  }
}
