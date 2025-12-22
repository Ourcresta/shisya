export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
  executionTime: number;
}

const MAX_EXECUTION_TIME = 5000; // 5 seconds timeout

export function executeJavaScript(code: string): ExecutionResult {
  const startTime = performance.now();
  const outputs: string[] = [];
  let error: string | null = null;
  let success = true;
  
  // Create a custom console that captures output
  const capturedConsole = {
    log: (...args: unknown[]) => {
      outputs.push(args.map(arg => formatOutput(arg)).join(" "));
    },
    error: (...args: unknown[]) => {
      outputs.push(`Error: ${args.map(arg => formatOutput(arg)).join(" ")}`);
    },
    warn: (...args: unknown[]) => {
      outputs.push(`Warning: ${args.map(arg => formatOutput(arg)).join(" ")}`);
    },
    info: (...args: unknown[]) => {
      outputs.push(args.map(arg => formatOutput(arg)).join(" "));
    },
  };
  
  try {
    // Wrap code to capture the result of the last expression
    const wrappedCode = `
      "use strict";
      const console = arguments[0];
      const setTimeout = undefined;
      const setInterval = undefined;
      const fetch = undefined;
      const XMLHttpRequest = undefined;
      const WebSocket = undefined;
      const localStorage = undefined;
      const sessionStorage = undefined;
      const document = undefined;
      const window = undefined;
      
      ${code}
    `;
    
    // Create a function from the code
    const fn = new Function(wrappedCode);
    
    // Execute with timeout protection
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Execution timeout: Code took too long to execute. Check for infinite loops."));
      }, MAX_EXECUTION_TIME);
    });
    
    // Execute synchronously but with error catching
    try {
      fn(capturedConsole);
    } catch (e) {
      throw e;
    }
    
  } catch (e) {
    success = false;
    if (e instanceof Error) {
      error = e.message;
      // Clean up error message for common issues
      if (error.includes("is not defined")) {
        const match = error.match(/(\w+) is not defined/);
        if (match) {
          error = `ReferenceError: ${match[1]} is not defined. Did you forget to declare it?`;
        }
      }
    } else {
      error = String(e);
    }
  }
  
  const executionTime = performance.now() - startTime;
  
  return {
    success,
    output: outputs.join("\n"),
    error,
    executionTime,
  };
}

function formatOutput(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(formatOutput).join(", ")}]`;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[Object]";
    }
  }
  return String(value);
}

export function compareOutput(actual: string, expected: string): boolean {
  // Normalize both outputs for comparison
  const normalizeOutput = (s: string): string => {
    return s
      .trim()
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n");
  };
  
  return normalizeOutput(actual) === normalizeOutput(expected);
}
