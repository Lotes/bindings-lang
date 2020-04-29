export enum ChunkKind {
  Text,
  Binding
}

export type Chunk<TExtension> = TextChunk | BindingChunk<TExtension>;

export interface TextChunk {
  kind: ChunkKind.Text;
  text: string;
}

export interface BindingChunk<TExtension> {
  kind: ChunkKind.Binding;
  binding: ExtendedBindingExpression<TExtension>;
}

export enum BindingExpressionKind {
  String,
  Number,
  Boolean,
  Null,
  Identifier,
  PropertyAccess,
  FunctionCall,
  UnitAnnotation
}

export enum Unit {
  Pixels,
  Points,
  Centimeter,
  Millimeter,
  Inch
}

export type ExtendedBindingExpression<TExtension>
  = ExtendedStringLiteral<TExtension>
  | ExtendedNumberLiteral<TExtension>
  | ExtendedBooleanLiteral<TExtension>
  | ExtendedNullLiteral<TExtension>
  | ExtendedIdentifier<TExtension>
  | ExtendedPropertyAccess<TExtension>
  | ExtendedFunctionCall<TExtension>
  | ExtendedUnitAnnotation<TExtension>
  ;

export type ExtendedStringLiteral<TExtension> = BaseStringLiteral & TExtension;
export type ExtendedNumberLiteral<TExtension> = BaseNumberLiteral & TExtension;
export type ExtendedBooleanLiteral<TExtension> = BaseBooleanLiteral & TExtension;
export type ExtendedNullLiteral<TExtension> = BaseNullLiteral & TExtension;
export type ExtendedIdentifier<TExtension> = BaseIdentifier & TExtension;
export type ExtendedPropertyAccess<TExtension> = BasePropertyAccess<TExtension> & TExtension;
export type ExtendedFunctionCall<TExtension> = BaseFunctionCall<TExtension> & TExtension;
export type ExtendedUnitAnnotation<TExtension> = BaseUnitAnnotation<TExtension> & TExtension;

export interface BaseStringLiteral {
  kind: BindingExpressionKind.String;
  value: string;
}

export interface BaseNumberLiteral {
  kind: BindingExpressionKind.Number;
  value: number;
}

export interface BaseBooleanLiteral {
  kind: BindingExpressionKind.Boolean;
  value: boolean;
}

export interface BaseNullLiteral {
  kind: BindingExpressionKind.Null;
}

export interface BaseIdentifier {
  kind: BindingExpressionKind.Identifier;
  name: string;
}

export interface BaseFunctionCall<TExtension> {
  kind: BindingExpressionKind.FunctionCall;
  operand: ExtendedBindingExpression<TExtension>;
  actualParameters: ExtendedBindingExpression<TExtension>[];
}

export interface BasePropertyAccess<TExtension> {
  kind: BindingExpressionKind.PropertyAccess;
  operand: ExtendedBindingExpression<TExtension>;
  name: string;
}

export interface BaseUnitAnnotation<TExtension> {
  kind: BindingExpressionKind.UnitAnnotation;
  operand: ExtendedBindingExpression<TExtension>;
  unit: Unit;
}

export type BindingExpression = ExtendedBindingExpression<{}>;