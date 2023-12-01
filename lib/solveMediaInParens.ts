import { InParensNode } from "media-query-parser";
import {
  Kleene3,
  SolverConfig,
  SolverConfigInput,
  createSolverConfig,
} from "./solveMediaQueryList.js";
import { solveMediaCondition_ } from "./solveMediaCondition.js";
import { solveMediaFeature_ } from "./solveMediaFeature.js";

export const solveMediaInParens = (
  inParens: InParensNode,
  configInput: SolverConfigInput
): Kleene3 => solveMediaInParens_(inParens, createSolverConfig(configInput));

export const solveMediaInParens_ = (inParens: InParensNode, config: SolverConfig): Kleene3 => {
  if (inParens.v.n === "condition") {
    return solveMediaCondition_(inParens.v, config);
  } else if (inParens.v.n === "feature") {
    return solveMediaFeature_(inParens.v, config);
  } else {
    return "unknown";
  }
};