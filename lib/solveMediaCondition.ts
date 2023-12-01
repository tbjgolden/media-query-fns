import { ConditionNode } from "media-query-parser";
import {
  Kleene3,
  SolverConfig,
  SolverConfigInput,
  and,
  createSolverConfig,
  not,
  or,
} from "./solveMediaQueryList.js";
import { solveMediaInParens_ } from "./solveMediaInParens.js";

export const solveMediaCondition = (
  condition: ConditionNode,
  configInput: SolverConfigInput
): Kleene3 => solveMediaCondition_(condition, createSolverConfig(configInput));

export const solveMediaCondition_ = (condition: ConditionNode, config: SolverConfig): Kleene3 => {
  if (condition.op === "and") {
    return and(
      solveMediaInParens_(condition.a, config),
      ...(condition.bs ?? []).map((inParens) => solveMediaInParens_(inParens, config))
    );
  } else if (condition.op === "or") {
    return or(
      solveMediaInParens_(condition.a, config),
      ...(condition.bs ?? []).map((inParens) => solveMediaInParens_(inParens, config))
    );
  } else {
    return not(solveMediaInParens_(condition.a, config));
  }
};
