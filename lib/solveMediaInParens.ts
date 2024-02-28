import { InParensNode, ParserError, isParserError } from "media-query-parser";
import {
  Kleene3,
  SolverConfig,
  SolverConfigInput,
  createSolverConfig,
} from "./solveMediaQueryList.js";
import { solveMediaCondition_ } from "./solveMediaCondition.js";
import { solveMediaFeature_ } from "./solveMediaFeature.js";

export const solveMediaInParens = (
  inParens: InParensNode | ParserError,
  configInput?: SolverConfigInput,
): Kleene3 =>
  isParserError(inParens)
    ? "false"
    : solveMediaInParens_(inParens, createSolverConfig(configInput));

export const solveMediaInParens_ = (inParens: InParensNode, config: SolverConfig): Kleene3 => {
  if (inParens.node._t === "condition") {
    return solveMediaCondition_(inParens.node, config);
  } else if (inParens.node._t === "feature") {
    return solveMediaFeature_(inParens.node, config);
  } else {
    return config.solveGeneralEnclosed(inParens.node);
  }
};
