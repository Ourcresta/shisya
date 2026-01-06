import type { RuleCondition, ConditionOperator, StudentSignals } from "@shared/schema";

export function evaluateCondition(
  condition: RuleCondition,
  signals: StudentSignals
): boolean {
  const { field, operator, value, value2 } = condition;
  const actualValue = signals[field as keyof StudentSignals];

  if (actualValue === undefined || actualValue === null) {
    return false;
  }

  const numValue = typeof actualValue === "number" ? actualValue : parseFloat(String(actualValue));
  const targetValue = typeof value === "number" ? value : parseFloat(String(value));

  switch (operator as ConditionOperator) {
    case "eq":
      return numValue === targetValue;
    case "neq":
      return numValue !== targetValue;
    case "gt":
      return numValue > targetValue;
    case "gte":
      return numValue >= targetValue;
    case "lt":
      return numValue < targetValue;
    case "lte":
      return numValue <= targetValue;
    case "between":
      const targetValue2 = typeof value2 === "number" ? value2 : parseFloat(String(value2 || 0));
      return numValue >= targetValue && numValue <= targetValue2;
    case "in":
      if (Array.isArray(value)) {
        return (value as (number | string)[]).includes(numValue);
      }
      return false;
    case "not_in":
      if (Array.isArray(value)) {
        return !(value as (number | string)[]).includes(numValue);
      }
      return true;
    default:
      return false;
  }
}

export function evaluateAllConditions(
  conditions: RuleCondition[],
  signals: StudentSignals
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }
  return conditions.every((condition) => evaluateCondition(condition, signals));
}

export function parseConditions(conditionsJson: string): RuleCondition[] {
  try {
    const parsed = JSON.parse(conditionsJson);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    console.error("[RuleEvaluator] Failed to parse conditions:", conditionsJson);
    return [];
  }
}
