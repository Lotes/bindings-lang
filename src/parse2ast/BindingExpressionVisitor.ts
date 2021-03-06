import { BindingLanguageParserVisitor } from "../parser/generated/BindingLanguageParserVisitor";
import { Unit, ExtendedBindingExpression } from "../ast/SyntaxTree";
import { AbstractParseTreeVisitor } from "antlr4ts/tree/AbstractParseTreeVisitor";
import { IdExpressionContext, NumberLiteralContext, StringLiteralContext, ParameterContext, BindingContext, BindingExpressionContext, TrueLiteralContext, FalseLiteralContext, NullLiteralContext } from "../parser/generated/BindingLanguageParser";
import { TailVisitor, MemberAccessKind } from "./TailVisitor";
import { newIdentifier, newNumber, newNull, newString, newBoolean, newUnitAnnotation, newPropertyAccess, newFunctionCall } from "../ast/factory";
import { ExpressionKind } from "../ast/ExpressionKind";
import { LocatableExtension } from "../ast/TokenExtensions";
import { Token } from "antlr4ts";

export type LocatableExpression = ExtendedBindingExpression<LocatableExtension>;

export class LocatableExpressionVisitor extends AbstractParseTreeVisitor<LocatableExpression> implements BindingLanguageParserVisitor<LocatableExpression> {
  private tailVisitor = new TailVisitor(this);

  visitIdExpression = (ctx: IdExpressionContext) => {
    const tail = ctx._next != null ? this.tailVisitor.visit(ctx._next) : [];
    const leaf = newIdentifier<LocatableExtension>(ctx._name.text!, {
      kind: ExpressionKind.Identifier,
      tokenStart: ctx._start,
      tokenStop: ctx._stop ?? ctx._start,
    });
    return tail.reduce<LocatableExpression>((lhs, rhs) => {
      const kind = rhs.kind === MemberAccessKind.Property
        ? ExpressionKind.PropertyAccess
        : ExpressionKind.FunctionCall;
      const operand = lhs;
      if (kind === ExpressionKind.PropertyAccess) {
        return newPropertyAccess<LocatableExtension>(operand, rhs.payload as string, {
          ...rhs.locations,
          tokenStart: ctx._start,
          tokenStop: ctx._stop ?? ctx._start,
        });
      } else {
        return newFunctionCall<LocatableExtension>(operand, rhs.payload as LocatableExpression[], {
          ...rhs.locations,
          tokenStart: ctx._start,
          tokenStop: ctx._stop ?? ctx._start,
        });
      }
    }, leaf);
  };

  visitNumberLiteral = (ctx: NumberLiteralContext) => newNumber<LocatableExtension>(parseFloat(ctx._value.text!), {
    kind: ExpressionKind.Number,
    tokenStart: ctx._start,
    tokenStop: ctx._stop ?? ctx._start,
  });

  visitStringLiteral = (ctx: StringLiteralContext) => newString<LocatableExtension>(
    ctx._value.text!
      .substr(1, ctx._value.text!.length - 2)
      .replace("\\\\", "\\")
      .replace("\\\"", "\""), {
    kind: ExpressionKind.String,
    tokenStart: ctx._start,
    tokenStop: ctx._stop ?? ctx._start,
  });

  visitTrueLiteral = (ctx: TrueLiteralContext) => newBoolean<LocatableExtension>(true, {
    kind: ExpressionKind.Boolean,
    tokenStart: ctx._start,
    tokenStop: ctx._stop ?? ctx._start,
  });

  visitFalseLiteral = (ctx: FalseLiteralContext) => newBoolean<LocatableExtension>(false, {
    kind: ExpressionKind.Boolean,
    tokenStart: ctx._start,
    tokenStop: ctx._stop ?? ctx._start,
  });

  visitNullLiteral = (ctx: NullLiteralContext) => newNull<LocatableExtension>({
    kind: ExpressionKind.Boolean,
    tokenStart: ctx._start,
    tokenStop: ctx._stop ?? ctx._start,
  });

  visitBinding = (ctx: BindingContext) => this.visit(ctx.bindingExpression());

  visitBindingExpression = (ctx: BindingExpressionContext) => {
    let unit: Unit;
    const operand = this.visit(ctx._value);
    switch (ctx._unit?.text) {
      case "px": unit = Unit.Pixels; break;
      case "cm": unit = Unit.Centimeter; break;
      case "mm": unit = Unit.Millimeter; break;
      case "inch": unit = Unit.Inch; break;
      case "pt": unit = Unit.Points; break;
      default:
        return operand;
    }
    return newUnitAnnotation(operand, unit, {
      kind: ExpressionKind.UnitAnnotation,
      tokenStart: ctx._start,
      tokenStop: ctx._stop ?? ctx._start,
      tokenUnit: ctx._unit,
    });
  };

  visitParameter = (ctx: ParameterContext) => this.visit(ctx.bindingExpression());

  protected defaultResult(): LocatableExpression {
    const nullToken: Token = {
      channel: 0,
      charPositionInLine: 0,
      inputStream: undefined,
      line: 0,
      startIndex: 0,
      stopIndex: 0,
      text: "",
      tokenIndex: -1,
      tokenSource: undefined,
      type: 0
    };
    return newString<LocatableExtension>("", {
      kind: ExpressionKind.Null,
      tokenStart: nullToken,
      tokenStop: nullToken,
    });
  }
}