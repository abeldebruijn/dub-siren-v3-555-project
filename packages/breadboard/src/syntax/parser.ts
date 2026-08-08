import { CstParser, EOF, tokenMatcher } from "chevrotain";

import {
  Arrow,
  AnnotationKeyword,
  AtKeyword,
  BandsKeyword,
  BreadboardKeyword,
  breadboardTokens,
  ButtonKeyword,
  CapacitanceKeyword,
  CapacitorKeyword,
  ChipKeyword,
  ColorKeyword,
  ColumnsKeyword,
  Comma,
  DecimalLiteral,
  DisplayedKeyword,
  DisplayLegsKeyword,
  Dot,
  FalseKeyword,
  FlipKeyword,
  FromKeyword,
  HeightKeyword,
  HexColorLiteral,
  Identifier,
  IntegerLiteral,
  InvalidHexColorLiteral,
  LeftBrace,
  LedKeyword,
  LineContent,
  MaxVoltageKeyword,
  NameLike,
  Newline,
  OnKeyword,
  OptionsKeyword,
  OutsideKeyword,
  PercentageLiteral,
  PinKeyword,
  PinsPerSideKeyword,
  Pipe,
  PlaceKeyword,
  PotentiometerKeyword,
  ResistanceKeyword,
  ResistorKeyword,
  RightKeyword,
  RightBrace,
  RowCoordinate,
  RowsKeyword,
  SaturationKeyword,
  SuffixedResistanceLiteral,
  SwitchKeyword,
  ToKeyword,
  topLevelKeywords,
  TrueKeyword,
  TypeKeyword,
  ValueKeyword,
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
        GATE: () => this.LA(1).tokenType === LedKeyword,
        ALT: () => this.SUBRULE(this.ledStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === CapacitorKeyword,
        ALT: () => this.SUBRULE(this.capacitorStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === ResistorKeyword,
        ALT: () => this.SUBRULE(this.resistorStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === ButtonKeyword,
        ALT: () => this.SUBRULE(this.buttonStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === PotentiometerKeyword,
        ALT: () => this.SUBRULE(this.potentiometerStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === SwitchKeyword,
        ALT: () => this.SUBRULE(this.switchStatement),
      },
      {
        GATE: () => this.LA(1).tokenType === AnnotationKeyword,
        ALT: () => this.SUBRULE(this.annotationStatement),
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
      this.OPTION2(() => {
        this.CONSUME(AtKeyword);
        this.CONSUME(RowCoordinate);
        this.OPTION3(() => this.CONSUME(FlipKeyword));
      });
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

  public readonly ledStatement = this.RULE("ledStatement", () => {
    this.CONSUME(LedKeyword);
    this.CONSUME(NameLike);
    this.CONSUME(FromKeyword);
    this.SUBRULE(this.endpoint);
    this.CONSUME(ToKeyword);
    this.SUBRULE2(this.endpoint);
    this.CONSUME(LeftBrace);
    this.CONSUME(Newline);
    this.MANY({
      GATE: () =>
        this.LA(1).tokenType !== RightBrace && this.LA(1).tokenType !== EOF,
      DEF: () => {
        this.OR([
          { ALT: () => this.CONSUME2(Newline) },
          {
            ALT: () => {
              this.SUBRULE(this.ledMemberLine);
              this.CONSUME3(Newline);
            },
          },
        ]);
      },
    });
    this.CONSUME(RightBrace);
  });

  public readonly ledMemberLine = this.RULE("ledMemberLine", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === ColorKeyword,
        ALT: () => this.SUBRULE(this.colorMember),
      },
      {
        GATE: () => this.LA(1).tokenType === OnKeyword,
        ALT: () => this.SUBRULE(this.onMember),
      },
      {
        GATE: () => this.LA(1).tokenType === DisplayLegsKeyword,
        ALT: () => this.SUBRULE(this.displayLegsMember),
      },
      { ALT: () => this.SUBRULE(this.invalidComponentMember) },
    ]);
  });

  public readonly onMember = this.RULE("onMember", () => {
    this.CONSUME(OnKeyword);
    this.SUBRULE(this.booleanValue);
  });

  public readonly displayLegsMember = this.RULE("displayLegsMember", () => {
    this.CONSUME(DisplayLegsKeyword);
    this.SUBRULE(this.booleanValue);
  });

  public readonly booleanValue = this.RULE("booleanValue", () => {
    this.OR([
      { ALT: () => this.CONSUME(TrueKeyword) },
      { ALT: () => this.CONSUME(FalseKeyword) },
      {
        GATE: () =>
          this.LA(1).tokenType !== TrueKeyword &&
          this.LA(1).tokenType !== FalseKeyword,
        ALT: () => this.CONSUME(NameLike),
      },
    ]);
  });

  public readonly capacitorStatement = this.RULE(
    "capacitorStatement",
    () => {
      this.CONSUME(CapacitorKeyword);
      this.CONSUME(NameLike);
      this.CONSUME(FromKeyword);
      this.SUBRULE(this.endpoint);
      this.CONSUME(ToKeyword);
      this.SUBRULE2(this.endpoint);
      this.CONSUME(LeftBrace);
      this.CONSUME(Newline);
      this.MANY({
        GATE: () =>
          this.LA(1).tokenType !== RightBrace && this.LA(1).tokenType !== EOF,
        DEF: () => {
          this.OR([
            { ALT: () => this.CONSUME2(Newline) },
            {
              ALT: () => {
                this.SUBRULE(this.capacitorMemberLine);
                this.CONSUME3(Newline);
              },
            },
          ]);
        },
      });
      this.CONSUME(RightBrace);
    },
  );

  public readonly capacitorMemberLine = this.RULE(
    "capacitorMemberLine",
    () => {
      this.OR([
        {
          GATE: () => this.LA(1).tokenType === TypeKeyword,
          ALT: () => this.SUBRULE(this.capacitorTypeMember),
        },
        {
          GATE: () => this.LA(1).tokenType === ColorKeyword,
          ALT: () => this.SUBRULE(this.colorMember),
        },
        {
          GATE: () => this.LA(1).tokenType === CapacitanceKeyword,
          ALT: () => this.SUBRULE(this.capacitanceMember),
        },
        {
          GATE: () => this.LA(1).tokenType === MaxVoltageKeyword,
          ALT: () => this.SUBRULE(this.maxVoltageMember),
        },
        {
          GATE: () => this.LA(1).tokenType === DisplayedKeyword,
          ALT: () => this.SUBRULE(this.displayedMember),
        },
        { ALT: () => this.SUBRULE(this.invalidComponentMember) },
      ]);
    },
  );

  public readonly capacitorTypeMember = this.RULE(
    "capacitorTypeMember",
    () => {
      this.CONSUME(TypeKeyword);
      this.CONSUME(NameLike);
    },
  );

  public readonly capacitanceMember = this.RULE("capacitanceMember", () => {
    this.CONSUME(CapacitanceKeyword);
    this.SUBRULE(this.decimalValue);
  });

  public readonly maxVoltageMember = this.RULE("maxVoltageMember", () => {
    this.CONSUME(MaxVoltageKeyword);
    this.SUBRULE(this.decimalValue);
  });

  public readonly displayedMember = this.RULE("displayedMember", () => {
    this.CONSUME(DisplayedKeyword);
    this.AT_LEAST_ONE(() => this.CONSUME(NameLike));
  });

  public readonly decimalValue = this.RULE("decimalValue", () => {
    this.OR([
      { ALT: () => this.CONSUME(DecimalLiteral) },
      { ALT: () => this.CONSUME(IntegerLiteral) },
    ]);
  });

  public readonly resistorStatement = this.RULE("resistorStatement", () => {
    this.CONSUME(ResistorKeyword);
    this.CONSUME(NameLike);
    this.CONSUME(FromKeyword);
    this.SUBRULE(this.endpoint);
    this.CONSUME(ToKeyword);
    this.SUBRULE2(this.endpoint);
    this.CONSUME(LeftBrace);
    this.CONSUME(Newline);
    this.MANY({
      GATE: () =>
        this.LA(1).tokenType !== RightBrace && this.LA(1).tokenType !== EOF,
      DEF: () => {
        this.OR([
          { ALT: () => this.CONSUME2(Newline) },
          {
            ALT: () => {
              this.SUBRULE(this.resistorMemberLine);
              this.CONSUME3(Newline);
            },
          },
        ]);
      },
    });
    this.CONSUME(RightBrace);
  });

  public readonly resistorMemberLine = this.RULE(
    "resistorMemberLine",
    () => {
      this.OR([
        {
          GATE: () => this.LA(1).tokenType === ValueKeyword,
          ALT: () => this.SUBRULE(this.resistorValueMember),
        },
        {
          GATE: () => this.LA(1).tokenType === BandsKeyword,
          ALT: () => this.SUBRULE(this.bandsMember),
        },
        { ALT: () => this.SUBRULE(this.invalidComponentMember) },
      ]);
    },
  );

  public readonly resistorValueMember = this.RULE(
    "resistorValueMember",
    () => {
      this.CONSUME(ValueKeyword);
      this.SUBRULE(this.resistanceValue);
    },
  );

  public readonly bandsMember = this.RULE("bandsMember", () => {
    this.CONSUME(BandsKeyword);
    this.CONSUME(IntegerLiteral);
  });

  public readonly resistanceValue = this.RULE("resistanceValue", () => {
    this.OR([
      { ALT: () => this.CONSUME(SuffixedResistanceLiteral) },
      { ALT: () => this.CONSUME(DecimalLiteral) },
      { ALT: () => this.CONSUME(IntegerLiteral) },
    ]);
  });

  public readonly buttonStatement = this.RULE("buttonStatement", () => {
    this.CONSUME(ButtonKeyword);
    this.CONSUME(NameLike);
    this.CONSUME(LeftBrace);
    this.CONSUME(Newline);
    this.MANY({
      GATE: () =>
        this.LA(1).tokenType !== RightBrace && this.LA(1).tokenType !== EOF,
      DEF: () => {
        this.OR([
          { ALT: () => this.CONSUME2(Newline) },
          {
            ALT: () => {
              this.SUBRULE(this.buttonMemberLine);
              this.CONSUME3(Newline);
            },
          },
        ]);
      },
    });
    this.CONSUME(RightBrace);
    this.CONSUME(AtKeyword);
    this.CONSUME(RowCoordinate);
    this.OPTION(() => this.CONSUME(OutsideKeyword));
  });

  public readonly buttonMemberLine = this.RULE("buttonMemberLine", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === PinsPerSideKeyword,
        ALT: () => this.SUBRULE(this.pinsPerSideMember),
      },
      {
        GATE: () => this.LA(1).tokenType === OnKeyword,
        ALT: () => this.SUBRULE(this.onMember),
      },
      { ALT: () => this.SUBRULE(this.invalidComponentMember) },
    ]);
  });

  public readonly pinsPerSideMember = this.RULE(
    "pinsPerSideMember",
    () => {
      this.CONSUME(PinsPerSideKeyword);
      this.CONSUME(IntegerLiteral);
    },
  );

  public readonly potentiometerStatement = this.RULE(
    "potentiometerStatement",
    () => {
      this.CONSUME(PotentiometerKeyword);
      this.CONSUME(NameLike);
      this.CONSUME(LeftBrace);
      this.CONSUME(Newline);
      this.MANY({
        GATE: () =>
          this.LA(1).tokenType !== RightBrace && this.LA(1).tokenType !== EOF,
        DEF: () => {
          this.OR([
            { ALT: () => this.CONSUME2(Newline) },
            {
              ALT: () => {
                this.SUBRULE(this.potentiometerMemberLine);
                this.CONSUME3(Newline);
              },
            },
          ]);
        },
      });
      this.CONSUME(RightBrace);
      this.CONSUME(AtKeyword);
      this.CONSUME(RowCoordinate);
      this.OPTION(() => this.CONSUME(RightKeyword));
      this.OPTION2(() => this.CONSUME(OutsideKeyword));
    },
  );

  public readonly potentiometerMemberLine = this.RULE(
    "potentiometerMemberLine",
    () => {
      this.OR([
        {
          GATE: () => this.LA(1).tokenType === ResistanceKeyword,
          ALT: () => this.SUBRULE(this.resistanceMember),
        },
        {
          GATE: () => this.LA(1).tokenType === ValueKeyword,
          ALT: () => this.SUBRULE(this.controlDecimalValueMember),
        },
        { ALT: () => this.SUBRULE(this.invalidComponentMember) },
      ]);
    },
  );

  public readonly resistanceMember = this.RULE("resistanceMember", () => {
    this.CONSUME(ResistanceKeyword);
    this.SUBRULE(this.resistanceValue);
  });

  public readonly controlDecimalValueMember = this.RULE(
    "controlDecimalValueMember",
    () => {
      this.CONSUME(ValueKeyword);
      this.SUBRULE(this.decimalValue);
    },
  );

  public readonly switchStatement = this.RULE("switchStatement", () => {
    this.CONSUME(SwitchKeyword);
    this.CONSUME(NameLike);
    this.CONSUME(LeftBrace);
    this.CONSUME(Newline);
    this.MANY({
      GATE: () =>
        this.LA(1).tokenType !== RightBrace && this.LA(1).tokenType !== EOF,
      DEF: () => {
        this.OR([
          { ALT: () => this.CONSUME2(Newline) },
          {
            ALT: () => {
              this.SUBRULE(this.switchMemberLine);
              this.CONSUME3(Newline);
            },
          },
        ]);
      },
    });
    this.CONSUME(RightBrace);
    this.CONSUME(AtKeyword);
    this.CONSUME(RowCoordinate);
    this.OPTION(() => this.CONSUME(RightKeyword));
    this.OPTION2(() => this.CONSUME(OutsideKeyword));
  });

  public readonly switchMemberLine = this.RULE("switchMemberLine", () => {
    this.OR([
      {
        GATE: () => this.LA(1).tokenType === OptionsKeyword,
        ALT: () => this.SUBRULE(this.optionsMember),
      },
      {
        GATE: () => this.LA(1).tokenType === ValueKeyword,
        ALT: () => this.SUBRULE(this.controlIntegerValueMember),
      },
      { ALT: () => this.SUBRULE(this.invalidComponentMember) },
    ]);
  });

  public readonly optionsMember = this.RULE("optionsMember", () => {
    this.CONSUME(OptionsKeyword);
    this.CONSUME(IntegerLiteral);
  });

  public readonly controlIntegerValueMember = this.RULE(
    "controlIntegerValueMember",
    () => {
      this.CONSUME(ValueKeyword);
      this.CONSUME(IntegerLiteral);
    },
  );

  public readonly annotationStatement = this.RULE(
    "annotationStatement",
    () => {
      this.CONSUME(AnnotationKeyword);
      this.CONSUME(IntegerLiteral);
      this.CONSUME(AtKeyword);
      this.SUBRULE(this.endpoint);
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

  public readonly invalidComponentMember = this.RULE(
    "invalidComponentMember",
    () => {
      this.CONSUME(LineContent);
      this.MANY(() => this.CONSUME2(LineContent));
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
