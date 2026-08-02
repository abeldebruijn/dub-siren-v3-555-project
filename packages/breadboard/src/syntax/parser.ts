import { CstParser, EOF, tokenMatcher } from "chevrotain";

import {
  Arrow,
  AtKeyword,
  BreadboardKeyword,
  breadboardTokens,
  ChipKeyword,
  ColorKeyword,
  ColumnsKeyword,
  Comma,
  Dot,
  FlipKeyword,
  HeightKeyword,
  HexColorLiteral,
  Identifier,
  IntegerLiteral,
  InvalidHexColorLiteral,
  LeftBrace,
  LineContent,
  NameLike,
  Newline,
  PercentageLiteral,
  PinKeyword,
  Pipe,
  PlaceKeyword,
  RightBrace,
  RowCoordinate,
  RowsKeyword,
  SaturationKeyword,
  topLevelKeywords,
  ViaKeyword,
  WidthKeyword,
  WireKeyword,
} from "./tokens.js";

export class BreadboardParser extends CstParser {
  public readonly document = this.RULE("document", () => {
    this.MANY(() => this.CONSUME(Newline));
    this.MANY2(() => {
      this.SUBRULE(this.statement);
      this.OPTION(() => this.CONSUME2(Newline));
      this.MANY3(() => this.CONSUME3(Newline));
    });
    this.CONSUME(EOF);
  });

  public readonly statement = this.RULE("statement", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === BreadboardKeyword,
        ALT: () => this.SUBRULE(this.breadboardStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === ChipKeyword,
        ALT: () => this.SUBRULE(this.chipDefinitionStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === PlaceKeyword,
        ALT: () => this.SUBRULE(this.placementStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === WireKeyword,
        ALT: () => this.SUBRULE(this.wireStatement),
      },
      {
        GATE: () => !topLevelKeywords.includes(this.LA(1).tokenType),
        ALT: () => this.SUBRULE(this.invalidStatement),
      },
    ]);
  });

  public readonly breadboardStatement = this.RULE(
    "breadboardStatement",
    () => {
      this.CONSUME(BreadboardKeyword);
      this.OPTION({
        GATE: () =>
          this.LA(1).tokenType !== RowsKeyword &&
          tokenMatcher(this.LA(1), NameLike),
        DEF: () => this.CONSUME(NameLike),
      });
      this.CONSUME(RowsKeyword);
      this.CONSUME(IntegerLiteral);
      this.OPTION2(() => {
        this.CONSUME(ColumnsKeyword);
        this.CONSUME2(IntegerLiteral);
      });
    },
  );

  public readonly chipDefinitionStatement = this.RULE(
    "chipDefinitionStatement",
    () => {
      this.CONSUME(ChipKeyword);
      this.CONSUME(NameLike);
      this.CONSUME(LeftBrace);
      this.CONSUME(Newline);
      this.MANY({
        GATE: () =>
          this.LA(1).tokenType !== RightBrace &&
          this.LA(1).tokenType !== EOF,
        DEF: () => {
          this.OR([
            { ALT: () => this.CONSUME2(Newline) },
            {
              ALT: () => {
                this.SUBRULE(this.chipMemberLine);
                this.CONSUME3(Newline);
              },
            },
          ]);
        },
      });
      this.CONSUME(RightBrace);
    },
  );

  public readonly chipMemberLine = this.RULE("chipMemberLine", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === HeightKeyword,
        ALT: () => this.SUBRULE(this.heightMember),
      },
      {
        GATE: () => this.LA(1).tokenType === WidthKeyword,
        ALT: () => this.SUBRULE(this.widthMember),
      },
      {
        GATE: () => this.LA(1).tokenType === ColorKeyword,
        ALT: () => this.SUBRULE(this.colorMember),
      },
      {
        GATE: () => this.LA(1).tokenType === PinKeyword,
        ALT: () => this.SUBRULE(this.pinMember),
      },
      {
        GATE: () => this.LA(1).tokenType === Identifier,
        ALT: () => this.SUBRULE(this.invalidChipMember),
      },
    ]);
  });

  public readonly heightMember = this.RULE("heightMember", () => {
    this.CONSUME(HeightKeyword);
    this.CONSUME(IntegerLiteral);
  });

  public readonly widthMember = this.RULE("widthMember", () => {
    this.CONSUME(WidthKeyword);
    this.CONSUME(IntegerLiteral);
  });

  public readonly colorMember = this.RULE("colorMember", () => {
    this.CONSUME(ColorKeyword);
    this.SUBRULE(this.colorValue);
  });

  public readonly pinMember = this.RULE("pinMember", () => {
    this.CONSUME(PinKeyword);
    this.CONSUME(IntegerLiteral);
    this.OR([
      { ALT: () => this.CONSUME(NameLike) },
      { ALT: () => this.CONSUME2(IntegerLiteral) },
    ]);
    this.MANY(() => {
      this.CONSUME(Pipe);
      this.OR2([
        { ALT: () => this.CONSUME2(NameLike) },
        { ALT: () => this.CONSUME3(IntegerLiteral) },
      ]);
    });
  });

  public readonly placementStatement = this.RULE(
    "placementStatement",
    () => {
      this.CONSUME(PlaceKeyword);
      this.CONSUME(NameLike);
      this.CONSUME2(NameLike);
      this.CONSUME(AtKeyword);
      this.CONSUME(RowCoordinate);
      this.OPTION(() => this.CONSUME(FlipKeyword));
      this.OPTION2(() => {
        this.CONSUME(ColorKeyword);
        this.SUBRULE(this.colorValue);
      });
    },
  );

  public readonly wireStatement = this.RULE("wireStatement", () => {
    this.CONSUME(WireKeyword);
    this.SUBRULE(this.endpoint);
    this.CONSUME(Arrow);
    this.SUBRULE2(this.endpoint);
    this.OPTION(() => {
      this.CONSUME(ViaKeyword);
      this.SUBRULE(this.exactRoutePoint);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.exactRoutePoint);
      });
    });
    this.OPTION2(() => {
      this.CONSUME(ColorKeyword);
      this.SUBRULE(this.colorValue);
    });
    this.OPTION3(() => {
      this.CONSUME(SaturationKeyword);
      this.CONSUME(PercentageLiteral);
    });
  });

  public readonly endpoint = this.RULE("endpoint", () => {
    this.OR([
      {
        GATE: () => this.LA(2).tokenType === Dot,
        ALT: () => this.SUBRULE(this.pinSelector),
      },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });

  public readonly pinSelector = this.RULE("pinSelector", () => {
    this.CONSUME(NameLike);
    this.CONSUME(Dot);
    this.OR([
      { ALT: () => this.CONSUME(IntegerLiteral) },
      { ALT: () => this.CONSUME2(NameLike) },
    ]);
  });

  public readonly exactRoutePoint = this.RULE("exactRoutePoint", () => {
    this.CONSUME(Identifier);
  });

  public readonly colorValue = this.RULE("colorValue", () => {
    this.OR([
      { ALT: () => this.CONSUME(HexColorLiteral) },
      { ALT: () => this.CONSUME(InvalidHexColorLiteral) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });

  public readonly invalidStatement = this.RULE("invalidStatement", () => {
    this.AT_LEAST_ONE(() => this.CONSUME(LineContent));
  });

  public readonly invalidChipMember = this.RULE(
    "invalidChipMember",
    () => {
      this.CONSUME(Identifier);
      this.MANY(() => this.CONSUME(LineContent));
    },
  );

  public constructor() {
    super(breadboardTokens, {
      maxLookahead: 1,
      nodeLocationTracking: "full",
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }
}

export const breadboardParser = new BreadboardParser();
