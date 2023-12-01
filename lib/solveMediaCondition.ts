import { ConditionNode } from "media-query-parser";
import {
  Kleene3,
  SolverConfig,
  SolverConfigInput,
  createSolverConfig,
} from "./solveMediaQueryList.js";
import { solveMediaInParens_ } from "./solveMediaInParens.js";

export const solveMediaCondition = (
  condition: ConditionNode,
  configInput: SolverConfigInput
): Kleene3 => solveMediaCondition_(condition, createSolverConfig(configInput));

export const solveMediaCondition_ = (condition: ConditionNode, config: SolverConfig): Kleene3 => {
  if (condition.op === "and") {
    let result: Kleene3 = "true";
    for (const inParens of [condition.a, ...(condition.bs ?? [])]) {
      const nextResult = solveMediaInParens_(inParens, config);
      if (nextResult === "false") {
        return "false";
      } else if (nextResult === "unknown") {
        result = "unknown";
      }
    }
    return result;
  } else if (condition.op === "or") {
    let result: Kleene3 = "false";
    for (const inParens of [condition.a, ...(condition.bs ?? [])]) {
      const nextResult = solveMediaInParens_(inParens, config);
      if (nextResult === "true") {
        return "true";
      } else if (nextResult === "unknown") {
        result = "unknown";
      }
    }
    return result;
  } else {
    const inParensResult = solveMediaInParens_(condition.a, config);
    if (inParensResult === "true") {
      return "false";
    } else if (inParensResult === "false") {
      return "true";
    } else {
      return "unknown";
    }
  }
};
