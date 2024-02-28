import { ConditionNode, ParserError, isParserError } from "media-query-parser";
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
  condition: ConditionNode | ParserError,
  configInput?: SolverConfigInput,
): Kleene3 =>
  isParserError(condition)
    ? "false"
    : solveMediaCondition_(condition, createSolverConfig(configInput));

export const solveMediaCondition_ = (condition: ConditionNode, config: SolverConfig): Kleene3 => {
  if (condition.op === "and") {
    return and(...condition.nodes.map((inParens) => solveMediaInParens_(inParens, config)));
  } else if (condition.op === "or") {
    return or(...condition.nodes.map((inParens) => solveMediaInParens_(inParens, config)));
  } else {
    return not(solveMediaInParens_(condition.nodes[0], config));
  }
};
