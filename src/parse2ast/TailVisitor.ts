import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { BindingLanguageParserVisitor } from "../parser/generated/BindingLanguageParserVisitor";
import { BindingExpression } from "../ast/SyntaxTree";
import { PropertyContext, FunctionCallContext, ParametersContext } from "../parser/generated/BindingLanguageParser";
import { BindingExpressionVisitor } from "./BindingExpressionVisitor";

export enum MemberAccessKind {
  Property,
  FunctionCall
}

export interface MemberAccess {
  kind: MemberAccessKind,
  payload: string | BindingExpression[];
}

export class TailVisitor extends AbstractParseTreeVisitor<MemberAccess[]> implements BindingLanguageParserVisitor<MemberAccess[]> {
  private expressionVisitor: BindingExpressionVisitor;
  constructor(expressionVisitor: BindingExpressionVisitor) {
    super();
    this.expressionVisitor = expressionVisitor;
  }
  protected defaultResult(): MemberAccess[] {
    return [];
  }
  visitProperty = (ctx: PropertyContext) => {
    const tail = ctx._next != null ? this.visit(ctx._next) : [];
    return [{
      kind: MemberAccessKind.Property,
      payload: ctx._name.text
    } as MemberAccess].concat(tail);
  };

  visitFunctionCall = (ctx: FunctionCallContext) => {
    const tail = ctx._next != null ? this.visit(ctx._next) : [];
    const parameters = ctx._list != null ? this.visitCustomParameters(ctx._list) : [];
    return [{
      kind: MemberAccessKind.FunctionCall,
      payload: parameters
    } as MemberAccess].concat(tail);
  };

  visitCustomParameters(ctx: ParametersContext): BindingExpression[] {
    const lhs = [this.expressionVisitor.visit(ctx._lhs)];
    const rhs = ctx._rhs != null ? this.visitCustomParameters(ctx._rhs) : [];
    return lhs.concat(rhs);
  }
}