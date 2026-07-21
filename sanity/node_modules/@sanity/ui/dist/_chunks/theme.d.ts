import { ColorHueKey, ColorTint, ColorTintKey } from "@sanity/color";
import * as CSS from "csstype";
/**
 * @public
 */
interface ThemeFocusRing {
  offset: number;
  width: number;
}
/**
 * @public
 */
interface ThemeAvatar_v2 {
  sizes: {
    /** Spacing between avatars in an <AvatarStack> component (px) */distance: number; /** Diameter of the avatar (px) */
    size: number;
  }[];
  focusRing: ThemeFocusRing;
}
/** @public */
declare const THEME_COLOR_SCHEMES: readonly ["light", "dark"];
/** @public */
declare const THEME_COLOR_BLEND_MODES: readonly ["multiply", "screen"];
/** @public */
declare const THEME_COLOR_CARD_TONES: readonly ["transparent", "default", "neutral", "primary", "suggest", "positive", "caution", "critical"];
/** @public */
declare const THEME_COLOR_STATE_TONES: readonly ["default", "neutral", "primary", "suggest", "positive", "caution", "critical"];
/** @public */
declare const THEME_COLOR_STATES: readonly ["enabled", "hovered", "pressed", "selected", "disabled"];
/** @public */
declare const THEME_COLOR_BUTTON_MODES: readonly ["default", "ghost", "bleed"];
/** @public */
declare const THEME_COLOR_INPUT_MODES: readonly ["default", "invalid"];
/** @public */
declare const THEME_COLOR_INPUT_STATES: readonly ["enabled", "hovered", "readOnly", "disabled"];
/** @public */
declare const THEME_COLOR_AVATAR_COLORS: import("@sanity/color").ColorHueKey[];
/**
 * @public
 */
type ThemeColorSchemeKey = (typeof THEME_COLOR_SCHEMES)[number];
/** @public */
type ThemeColorBlendModeKey = (typeof THEME_COLOR_BLEND_MODES)[number];
/** @public */
type ThemeColorCardToneKey = (typeof THEME_COLOR_CARD_TONES)[number];
/** @public */
type ThemeColorButtonModeKey = (typeof THEME_COLOR_BUTTON_MODES)[number];
/** @public */
type ThemeColorStateKey = (typeof THEME_COLOR_STATES)[number];
/** @public */
type ThemeColorStateToneKey = (typeof THEME_COLOR_STATE_TONES)[number];
/** @public */
type ThemeColorInputModeKey = (typeof THEME_COLOR_INPUT_MODES)[number];
/** @public */
type ThemeColorInputStateKey = (typeof THEME_COLOR_INPUT_STATES)[number];
/** @public */
type ThemeColorAvatarColorKey = (typeof THEME_COLOR_AVATAR_COLORS)[number];
/** @internal */
declare function isColorBlendModeValue(str: string): str is ThemeColorBlendModeKey;
/** @internal */
declare function isColorHueKey(str: string): str is ColorHueKey;
/** @internal */
declare function isColorTintKey(str: string): str is ColorTintKey;
/** @internal */
declare function isColorButtonMode(str: string): str is ThemeColorButtonModeKey;
/**
 * @public
 */
interface ThemeColorAvatarHue_v2 {
  _blend?: ThemeColorBlendModeKey;
  bg: string;
  fg: string;
}
/**
 * @public
 */
type ThemeColorAvatar_v2 = Record<ThemeColorAvatarColorKey, ThemeColorAvatarHue_v2>;
/**
 * @public
 */
interface ThemeColorBadgeTone_v2 {
  bg: string;
  fg: string;
  dot: string;
  icon: string;
}
/**
 * @public
 */
type ThemeColorBadge_v2 = Record<ThemeColorStateToneKey, ThemeColorBadgeTone_v2>;
/**
 * @public
 */
interface ThemeColorKBD {
  bg: string;
  fg: string;
  border: string;
}
/**
 * @public
 */
interface ThemeColorState_v2 {
  /** @internal */
  _blend?: ThemeColorBlendModeKey;
  accent: {
    fg: string;
  };
  /**
   * @internal  This may be removed in a future release
   * */
  avatar: ThemeColorAvatar_v2;
  /**
   * @internal  This may be removed in a future release
   * */
  badge: ThemeColorBadge_v2;
  bg: string;
  border: string;
  code: {
    bg: string;
    fg: string;
  };
  fg: string;
  icon: string;
  kbd: ThemeColorKBD;
  link: {
    fg: string;
  };
  muted: {
    bg: string;
    fg: string;
  };
  skeleton: {
    from: string;
    to: string;
  };
}
/**
 * @public
 */
type ThemeColorButtonTone_v2 = Record<ThemeColorStateKey, ThemeColorState_v2>;
/**
 * @public
 */
type ThemeColorButtonMode_v2 = Record<ThemeColorStateToneKey, ThemeColorButtonTone_v2>;
/**
 * @public
 */
type ThemeColorButton_v2 = Record<ThemeColorButtonModeKey, ThemeColorButtonMode_v2>;
/**
 * @public
 */
interface ThemeColorInputState_v2 {
  _blend?: ThemeColorBlendModeKey;
  bg: string;
  border: string;
  fg: string;
  muted: {
    bg: string;
  };
  placeholder: string;
}
/**
 * @public
 */
type ThemeColorInputMode_v2 = Record<ThemeColorInputStateKey, ThemeColorInputState_v2>;
/**
 * @public
 */
type ThemeColorInput_v2 = Record<ThemeColorInputModeKey, ThemeColorInputMode_v2>;
/**
 * @public
 */
type ThemeColorSelectableTone_v2 = Record<ThemeColorStateKey, ThemeColorState_v2>;
/**
 * @public
 */
type ThemeColorSelectable_v2 = Record<ThemeColorStateToneKey, ThemeColorSelectableTone_v2>;
/** @public */
interface ThemeColorShadow {
  outline: string;
  umbra: string;
  penumbra: string;
  ambient: string;
}
/**
 * @public
 */
interface ThemeColorSyntax {
  atrule: string;
  attrName: string;
  attrValue: string;
  attribute: string;
  boolean: string;
  builtin: string;
  cdata: string;
  char: string;
  class: string;
  className: string;
  comment: string;
  constant: string;
  deleted: string;
  doctype: string;
  entity: string;
  function: string;
  hexcode: string;
  id: string;
  important: string;
  inserted: string;
  keyword: string;
  number: string;
  operator: string;
  prolog: string;
  property: string;
  pseudoClass: string;
  pseudoElement: string;
  punctuation: string;
  regex: string;
  selector: string;
  string: string;
  symbol: string;
  tag: string;
  unit: string;
  url: string;
  variable: string;
}
/**
 * @public
 */
interface ThemeColorCard_v2 extends ThemeColorState_v2 {
  /** @internal */
  _blend: ThemeColorBlendModeKey;
  _dark: boolean;
  backdrop: string;
  button: ThemeColorButton_v2;
  focusRing: string;
  input: ThemeColorInput_v2;
  selectable: ThemeColorSelectable_v2;
  shadow: ThemeColorShadow;
  syntax: ThemeColorSyntax;
}
/**
 * @public
 */
type ThemeColorScheme_v2 = Record<ThemeColorCardToneKey, ThemeColorCard_v2>;
/**
 * @public
 */
type ThemeColorSchemes_v2 = Record<ThemeColorSchemeKey, ThemeColorScheme_v2>;
/**
 * A CSS-in-JS style object: standard CSS properties plus an index signature that allows nested
 * selectors, at-rules and custom properties.
 *
 * This is a self-owned definition (based on `csstype`) so the published `.d.ts` types stay fully
 * controlled by us and do not reference any external CSS-in-JS library types.
 *
 * @internal
 */
interface CSSObject extends CSS.Properties<number | (string & {})> {
  [key: string]: CSSObject | string | number | undefined;
}
/**
 * @public
 */
type ThemeFontKey = 'code' | 'heading' | 'label' | 'text';
/**
 * @public
 */
type ThemeFontWeightKey = 'regular' | 'medium' | 'semibold' | 'bold';
/**
 * @public
 */
interface ThemeFontSize {
  ascenderHeight: number;
  descenderHeight: number;
  fontSize: number;
  iconSize: number;
  letterSpacing: number;
  lineHeight: number;
}
/**
 * @public
 */
interface ThemeFontWeight {
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
}
/**
 * @public
 */
interface ThemeFont {
  family: string;
  weights: ThemeFontWeight;
  sizes: ThemeFontSize[];
  /** @deprecated No longer supported. */
  horizontalOffset?: number;
}
/**
 * @public
 */
interface ThemeFonts {
  code: ThemeFont;
  heading: ThemeFont;
  label: ThemeFont;
  text: ThemeFont;
}
/**
 * @public
 */
interface ThemeInput_v2 {
  checkbox: {
    size: number;
    focusRing: ThemeFocusRing;
  };
  radio: {
    size: number;
    markSize: number;
    focusRing: ThemeFocusRing;
  };
  switch: {
    width: number;
    height: number;
    padding: number;
    transitionDurationMs: number;
    transitionTimingFunction: string;
    focusRing: ThemeFocusRing;
  };
  border: {
    width: number;
  };
  select: {
    focusRing: ThemeFocusRing;
  };
  text: {
    focusRing: ThemeFocusRing;
  };
}
/**
 * @public
 */
interface ThemeLayer {
  dialog: {
    zOffset: number;
  };
  popover: {
    zOffset: number;
  };
  tooltip: {
    zOffset: number;
  };
}
/**
 * @public
 */
type ThemeBoxShadow = [number, number, number, number];
/**
 * @public
 */
interface ThemeShadow {
  umbra: ThemeBoxShadow;
  penumbra: ThemeBoxShadow;
  ambient: ThemeBoxShadow;
}
/**
 * @internal
 */
interface ThemeStyles {
  button?: {
    root?: CSSObject;
  };
  card?: {
    root?: CSSObject;
  };
}
/**
 * @public
 * @deprecated Use `ThemeAvatar_v2` from `@sanity/ui/theme` instead.
 */
interface ThemeAvatar {
  sizes: {
    distance: number;
    size: number;
  }[];
}
/**
 * @public
 * @deprecated Use `ThemeColorState_v2` instead.
 */
interface ThemeColorGenericState {
  /** @internal */
  _blend?: ThemeColorBlendModeKey;
  bg: string;
  /**
   * @beta
   */
  bg2?: string;
  border: string;
  fg: string;
  icon: string;
  muted: {
    fg: string;
  };
  accent: {
    fg: string;
  };
  link: {
    fg: string;
  };
  code: {
    bg: string;
    fg: string;
  };
  skeleton?: {
    from: string;
    to: string;
  };
}
/**
 * @public
 * @deprecated Use `ThemeColorCardToneKey` instead.
 */
type ThemeColorName = 'transparent' | 'default' | 'primary' | 'positive' | 'caution' | 'critical';
/**
 * @public
 * @deprecated Use `ThemeColorCardToneKey` instead.
 */
type ThemeColorToneKey = ThemeColorName;
/**
 * @public
 * @deprecated Use `ThemeColorCard_v2` instead.
 */
interface ThemeColorBase {
  bg: string;
  fg: string;
  border: string;
  focusRing: string;
  backdrop?: string;
  shadow: {
    outline: string;
    umbra: string;
    penumbra: string;
    ambient: string;
  };
  skeleton?: {
    from: string;
    to: string;
  };
}
/**
 * @public
 * @deprecated Use `ThemeColorState_v2` instead.
 */
type ThemeColorButtonState = ThemeColorGenericState;
/**
 * @public
 * @deprecated Use `ThemeColorButtonStates_v2` instead.
 */
interface ThemeColorButtonStates {
  enabled: ThemeColorGenericState;
  hovered: ThemeColorGenericState;
  pressed: ThemeColorGenericState;
  selected: ThemeColorGenericState;
  disabled: ThemeColorGenericState;
}
/**
 * TODO: Rename to `ThemeColorButtonMode`.
 * @public
 * @deprecated Use `ThemeColorButtonTones_v2` instead.
 */
interface ThemeColorButtonTones {
  default: ThemeColorButtonStates;
  primary: ThemeColorButtonStates;
  positive: ThemeColorButtonStates;
  caution: ThemeColorButtonStates;
  critical: ThemeColorButtonStates;
}
/**
 * @public
 * @deprecated Use `ThemeColorButton_v2` instead.
 */
interface ThemeColorButton {
  default: ThemeColorButtonTones;
  ghost: ThemeColorButtonTones;
  bleed: ThemeColorButtonTones;
}
/**
 * @public
 * @deprecated Use `ThemeColorState_v2` instead.
 */
type ThemeColorCardState = ThemeColorGenericState;
/**
 * @public
 * @deprecated Use `ThemeColorSelectable_v2` instead.
 */
interface ThemeColorCard {
  enabled: ThemeColorGenericState;
  hovered: ThemeColorGenericState;
  pressed: ThemeColorGenericState;
  selected: ThemeColorGenericState;
  disabled: ThemeColorGenericState;
}
/**
 * @public
 * @deprecated Use `ThemeColorInputState_v2` instead.
 */
interface ThemeColorInputState {
  _blend?: ThemeColorBlendModeKey;
  bg: string;
  bg2: string;
  border: string;
  fg: string;
  placeholder: string;
}
/**
 * @public
 * @deprecated Use `ThemeColorInputMode_v2` instead.
 */
interface ThemeColorInputStates {
  enabled: ThemeColorInputState;
  disabled: ThemeColorInputState;
  hovered: ThemeColorInputState;
  readOnly: ThemeColorInputState;
}
/**
 * @public
 * @deprecated Use `ThemeColorInput_v2` instead.
 */
interface ThemeColorInput {
  default: ThemeColorInputStates;
  invalid: ThemeColorInputStates;
}
/**
 * @public
 * @deprecated Use `ThemeColorSelectableTone_v2` instead.
 */
interface ThemeColorMutedTone {
  enabled: ThemeColorGenericState;
  disabled: ThemeColorGenericState;
  hovered: ThemeColorGenericState;
  pressed: ThemeColorGenericState;
  selected: ThemeColorGenericState;
}
/**
 * @public
 * @deprecated Use `ThemeColorSelectable_v2` instead.
 */
interface ThemeColorMuted {
  default: ThemeColorMutedTone;
  transparent: ThemeColorMutedTone;
  primary: ThemeColorMutedTone;
  positive: ThemeColorMutedTone;
  caution: ThemeColorMutedTone;
  critical: ThemeColorMutedTone;
}
/**
 * @public
 * @deprecated Use `ThemeColorState_v2` instead.
 */
type ThemeColorSelectableState = ThemeColorGenericState;
/**
 * @public
 * @deprecated Use `ThemeColorSelectableStates_v2` instead.
 */
interface ThemeColorSelectableStates {
  enabled: ThemeColorSelectableState;
  hovered: ThemeColorSelectableState;
  pressed: ThemeColorSelectableState;
  selected: ThemeColorSelectableState;
  disabled: ThemeColorSelectableState;
}
/**
 * @public
 * @deprecated Use `ThemeColorSelectable_v2` instead.
 */
interface ThemeColorSelectable {
  default: ThemeColorSelectableStates;
  primary: ThemeColorSelectableStates;
  positive: ThemeColorSelectableStates;
  caution: ThemeColorSelectableStates;
  critical: ThemeColorSelectableStates;
}
/**
 * @public
 * @deprecated Use `ThemeColorSelectableTone_v2` instead.
 */
interface ThemeColorSolidTone {
  enabled: ThemeColorGenericState;
  disabled: ThemeColorGenericState;
  hovered: ThemeColorGenericState;
  pressed: ThemeColorGenericState;
  selected: ThemeColorGenericState;
}
/**
 * @public
 * @deprecated Use `ThemeColorSelectable_v2` instead.
 */
interface ThemeColorSolid {
  default: ThemeColorSolidTone;
  transparent: ThemeColorSolidTone;
  primary: ThemeColorSolidTone;
  positive: ThemeColorSolidTone;
  caution: ThemeColorSolidTone;
  critical: ThemeColorSolidTone;
}
/**
 * @public
 * @deprecated Use `ThemeColorAvatarColorKey` instead
 */
type ThemeColorSpotKey = ThemeColorAvatarColorKey;
/**
 * @public
 * @deprecated Use `ThemeColorAvatar_v2` instead
 */
type ThemeColorSpot = Record<ThemeColorSpotKey, string>;
/**
 * @public
 * @deprecated Use `ThemeColor_v2` instead.
 */
interface ThemeColor extends Partial<Omit<ThemeColorGenericState, 'muted'>> {
  base: ThemeColorBase;
  button: ThemeColorButton;
  card: ThemeColorCard;
  dark: boolean;
  input: ThemeColorInput;
  muted: ThemeColorMuted;
  selectable?: ThemeColorSelectable;
  solid: ThemeColorSolid;
  spot: ThemeColorSpot;
  syntax: ThemeColorSyntax;
}
/**
 * @public
 * @deprecated Use `ThemeColorScheme_v2` instead.
 */
type ThemeColorScheme = Record<ThemeColorName, ThemeColor>;
/**
 * @public
 * @deprecated Use `ThemeColorSchemes_v2` instead.
 */
type ThemeColorSchemes = Record<ThemeColorSchemeKey, ThemeColorScheme>;
/**
 * @public
 * @deprecated Use `ThemeInput_v2` instead
 */
interface ThemeInput {
  checkbox: {
    size: number;
  };
  radio: {
    size: number;
    markSize: number;
  };
  switch: {
    width: number;
    height: number;
    padding: number;
    transitionDurationMs: number;
    transitionTimingFunction: string;
  };
  border: {
    width: number;
  };
}
/**
 * @public
 */
interface RootTheme_v2 {
  _version: 2;
  avatar: ThemeAvatar_v2;
  button: {
    border: {
      width: number;
    };
    focusRing: ThemeFocusRing;
    textWeight: ThemeFontWeightKey;
  };
  card: {
    border: {
      width: number;
    };
    focusRing: ThemeFocusRing;
    shadow: {
      outline: number;
    };
  };
  color: ThemeColorSchemes_v2;
  container: number[];
  font: ThemeFonts;
  input: ThemeInput_v2;
  layer: ThemeLayer;
  media: number[];
  radius: number[];
  shadow: Array<ThemeShadow | null>;
  space: number[];
  /** @internal */
  style?: ThemeStyles;
}
/**
 * @public
 */
interface BaseTheme {
  _version?: 0;
  /**
   * @deprecated Use `v2.avatar` instead
   */
  avatar: ThemeAvatar;
  /**
   * @deprecated Use `v2.button` instead
   */
  button: {
    textWeight: ThemeFontWeightKey;
  };
  /**
   * @deprecated Use `v2.color` instead
   */
  color: ThemeColorSchemes;
  /**
   * @deprecated Use `v2.container` instead
   */
  container: number[];
  /**
   * @deprecated Use component-specific `v2.{button | card | input}.focusRing` values instead
   */
  focusRing: {
    offset: number;
    width: number;
  };
  /**
   * @deprecated Use `v2.font` instead
   */
  fonts: ThemeFonts;
  /**
   * @deprecated Use `v2.input` instead
   */
  input: ThemeInput;
  /**
   * THIS API MAY BE UNSTABLE. DO NOT USE IN PRODUCTION.
   * @beta
   * @deprecated Use `v2.layer` instead
   */
  layer?: ThemeLayer;
  /**
   * @deprecated Use `v2.media` instead
   */
  media: number[];
  /**
   * @deprecated Use `v2.radius` instead
   */
  radius: number[];
  /**
   * @deprecated Use `v2.shadow` instead
   */
  shadows: Array<ThemeShadow | null>;
  /**
   * @deprecated Use `v2.space` instead
   */
  space: number[];
  /**
   * @internal
   * @deprecated Use `v2.style` instead
   */
  styles?: ThemeStyles;
  v2?: RootTheme_v2;
}
/**
 * @public
 */
type RootTheme = BaseTheme;
/**
 * @public
 */
type Theme_v2 = Omit<RootTheme_v2, 'color'> & {
  color: ThemeColorCard_v2;
  /**
   * Indicates whether the theme is resolved or raw, it's necessary to avoid issues
   * with sanity V2 components accessing a v1 <ThemeProvider>.
   * See https://github.com/sanity-io/ui/pull/1203 for more info.
   */
  _resolved: boolean;
};
/**
 * @public
 */
interface Theme {
  sanity: Omit<RootTheme, 'color' | 'v2'> & {
    /**
     * @deprecated Use `v2.color` instead
     */
    color: ThemeColor;
    v2?: Theme_v2;
  };
}
/**
 * @public
 * @deprecated Use `buildColorTheme` instead.
 */
interface ThemeColorBuilderOpts {
  base: (opts: {
    dark: boolean;
    name: ThemeColorName;
  }) => ThemeColorBase;
  solid: (opts: {
    base: ThemeColorBase;
    dark: boolean;
    tone: ThemeColorName;
    name: ThemeColorName;
    state: 'enabled' | 'disabled' | 'hovered' | 'pressed' | 'selected';
  }) => ThemeColorGenericState;
  muted: (opts: {
    base: ThemeColorBase;
    dark: boolean;
    tone: ThemeColorToneKey;
    name: ThemeColorName;
    state: 'enabled' | 'disabled' | 'hovered' | 'pressed' | 'selected';
  }) => ThemeColorGenericState;
  card: (opts: {
    base: ThemeColorBase;
    dark: boolean;
    muted: ThemeColorMuted;
    name: ThemeColorName;
    solid: ThemeColorSolid;
    state: 'enabled' | 'disabled' | 'hovered' | 'pressed' | 'selected';
  }) => ThemeColorGenericState;
  button: (opts: {
    dark: boolean;
    mode: ThemeColorButtonModeKey;
    base: ThemeColorBase;
    solid: ThemeColorSolidTone;
    muted: ThemeColorMutedTone;
  }) => ThemeColorButtonStates;
  input: (opts: {
    base: ThemeColorBase;
    solid: ThemeColorSolidTone;
    muted: ThemeColorMutedTone;
    dark: boolean;
    mode: 'default' | 'invalid';
    state: 'enabled' | 'disabled' | 'hovered' | 'readOnly';
  }) => ThemeColorInputState;
  selectable: (opts: {
    dark: boolean;
    base: ThemeColorBase;
    solid: ThemeColorSolid;
    muted: ThemeColorMuted;
    state: 'enabled' | 'disabled' | 'hovered' | 'pressed' | 'selected';
    tone: 'default' | 'primary' | 'positive' | 'caution' | 'critical';
  }) => ThemeColorGenericState;
  syntax: (opts: {
    base: ThemeColorBase;
    dark: boolean;
  }) => ThemeColorSyntax;
  spot: (opts: {
    base: ThemeColorBase;
    dark: boolean;
    key: ThemeColorSpotKey;
  }) => string;
}
/**
 * @public
 * @deprecated Use `ThemeConfig` instead.
 */
type PartialThemeColorBuilderOpts = Partial<ThemeColorBuilderOpts>;
/**
 * @public
 * @deprecated Use `buildColorTheme` instead.
 */
declare function createColorTheme(partialOpts?: PartialThemeColorBuilderOpts): ThemeColorSchemes;
/** @public */
declare const COLOR_CONFIG_STATE_KEYS: readonly ["_hue", "bg", "fg", "border", "focusRing", "muted/fg", "accent/fg", "link/fg", "code/bg", "code/fg", "skeleton/from", "skeleton/to", "status/dot", "status/icon"];
/** @public */
type ColorConfigStateKey = (typeof COLOR_CONFIG_STATE_KEYS)[number];
/** @public */
declare const COLOR_CONFIG_CARD_KEYS: readonly ["_hue", "bg", "fg", "border", "focusRing", "muted/fg", "accent/fg", "link/fg", "code/bg", "code/fg", "skeleton/from", "skeleton/to", "status/dot", "status/icon", "_hue", "bg", "fg", "border", "focusRing", "shadow/outline", "shadow/umbra", "shadow/penumbra", "shadow/ambient"];
/** @public */
type ColorConfigCardKey = (typeof COLOR_CONFIG_CARD_KEYS)[number];
/** @public */
declare const COLOR_CONFIG_BLEND_KEYS: readonly ["_blend"];
/** @public */
type ColorConfigBlendKey = (typeof COLOR_CONFIG_BLEND_KEYS)[number];
/** @public */
type ColorConfigOpacityValue = `0` | `0.${number}` | `1`;
/** @public */
type ColorConfigValue = `black` | `white` | `black/${ColorConfigOpacityValue}` | `white/${ColorConfigOpacityValue}` | `${ColorHueKey}` | `${ColorHueKey} ${number}%` | `${ColorHueKey}/${ColorTintKey}` | `${ColorHueKey}/${ColorTintKey} ${number}%` | `${ColorHueKey}/${ColorTintKey}/${ColorConfigOpacityValue}` | `${ColorTintKey}` | `${ColorTintKey} ${number}%` | `${ColorTintKey}/${ColorConfigOpacityValue}`;
/** @public */
type ThemeColorTokenValue = [ColorConfigValue, ColorConfigValue];
/** @public */
type ColorBlendModeTokenValue = [ThemeColorBlendModeKey, ThemeColorBlendModeKey];
/** @public */
declare const COLOR_CONFIG_AVATAR_COLORS: readonly ["*", ...ColorHueKey[]];
/** @public */
type ColorConfigAvatarColor = (typeof COLOR_CONFIG_AVATAR_COLORS)[number];
/** @public */
declare const COLOR_CONFIG_CARD_TONES: readonly ["*", "transparent", "default", "neutral", "primary", "suggest", "positive", "caution", "critical"];
/** @public */
type ColorConfigCardTone = (typeof COLOR_CONFIG_CARD_TONES)[number];
/** @public */
declare const COLOR_CONFIG_STATE_TONES: readonly ["*", "default", "neutral", "primary", "suggest", "positive", "caution", "critical"];
/** @public */
type ColorConfigStateTone = (typeof COLOR_CONFIG_STATE_TONES)[number];
/** @public */
declare const COLOR_CONFIG_STATES: readonly ["*", "enabled", "hovered", "pressed", "selected", "disabled"];
/** @public */
type ColorConfigState = (typeof COLOR_CONFIG_STATES)[number];
/** @public */
declare const COLOR_CONFIG_INPUT_MODES: readonly ["*", "default", "invalid"];
/** @public */
type ColorConfigInputMode = (typeof COLOR_CONFIG_INPUT_MODES)[number];
/** @public */
declare const COLOR_CONFIG_INPUT_STATES: readonly ["*", "enabled", "hovered", "readOnly", "disabled"];
/** @public */
type ColorConfigInputState = (typeof COLOR_CONFIG_INPUT_STATES)[number];
/** @internal */
declare function isColorConfigBaseTone(str: string): str is ColorConfigCardTone;
/** @internal */
declare function isColorConfigBaseKey(str: string): str is ColorConfigCardKey;
/** @internal */
declare function isColorConfigStateKey(str: string): str is ColorConfigStateKey;
/** @internal */
declare function isColorConfigStateTone(str: string): str is ColorConfigStateTone;
/** @internal */
declare function isColorConfigBlendKey(str: string): str is ColorConfigBlendKey;
/** @internal */
declare function isColorTokenValue(str: string): str is ColorConfigValue;
/** @internal */
declare function isColorValue(str: string): str is 'black' | 'white';
/** @internal */
declare function isColorOpacityValue(str: string): str is ColorConfigOpacityValue;
/** @public */
interface ThemeColorAvatarHueTokens {
  _blend?: ColorBlendModeTokenValue;
  _hue?: ColorHueKey;
  bg?: ThemeColorTokenValue;
  fg?: ThemeColorTokenValue;
}
/** @public */
interface ThemeColorAvatarTokens {
  '*'?: ThemeColorAvatarHueTokens;
  'gray'?: ThemeColorAvatarHueTokens;
  'blue'?: ThemeColorAvatarHueTokens;
  'purple'?: ThemeColorAvatarHueTokens;
  'magenta'?: ThemeColorAvatarHueTokens;
  'red'?: ThemeColorAvatarHueTokens;
  'orange'?: ThemeColorAvatarHueTokens;
  'yellow'?: ThemeColorAvatarHueTokens;
  'green'?: ThemeColorAvatarHueTokens;
  'cyan'?: ThemeColorAvatarHueTokens;
}
/** @public */
interface ThemeColorBaseTokens extends ThemeColorStateTokens {
  focusRing?: ThemeColorTokenValue;
  backdrop?: ThemeColorTokenValue;
  shadow?: {
    outline?: ThemeColorTokenValue;
    umbra?: ThemeColorTokenValue;
    penumbra?: ThemeColorTokenValue;
    ambient?: ThemeColorTokenValue;
  };
}
/** @public */
interface ThemeColorBadgeToneTokens {
  _blend?: ColorBlendModeTokenValue;
  _hue?: ColorHueKey;
  bg?: ThemeColorTokenValue;
  dot?: ThemeColorTokenValue;
  fg?: ThemeColorTokenValue;
  icon?: ThemeColorTokenValue;
}
/** @public */
type ThemeColorBadgeTokens = Partial<Record<'*' | ThemeColorStateToneKey, ThemeColorBadgeToneTokens>>;
/** @public */
interface ThemeColorStateTokens {
  _blend?: ColorBlendModeTokenValue;
  _hue?: ColorHueKey;
  accent?: {
    fg?: ThemeColorTokenValue;
  };
  avatar?: ThemeColorAvatarTokens;
  badge?: ThemeColorBadgeTokens;
  bg?: ThemeColorTokenValue;
  border?: ThemeColorTokenValue;
  code?: {
    bg?: ThemeColorTokenValue;
    fg?: ThemeColorTokenValue;
  };
  fg?: ThemeColorTokenValue;
  icon?: ThemeColorTokenValue;
  kbd?: {
    bg?: ThemeColorTokenValue;
    fg?: ThemeColorTokenValue;
    border?: ThemeColorTokenValue;
  };
  link?: {
    fg?: ThemeColorTokenValue;
  };
  muted?: {
    bg?: ThemeColorTokenValue;
    fg?: ThemeColorTokenValue;
  };
  skeleton?: {
    from?: ThemeColorTokenValue;
    to?: ThemeColorTokenValue;
  };
}
/** @public */
type ThemeColorStatesTokens = Partial<Record<ColorConfigState, ThemeColorStateTokens>>;
/** @public */
interface ThemeColorButtonTokens extends Partial<Record<ColorConfigStateTone, ThemeColorStatesTokens>> {
  _hue?: ColorHueKey;
}
/** @public */
interface ThemeColorInputStateTokens {
  _blend?: ColorBlendModeTokenValue;
  _hue?: ColorHueKey;
  bg?: ThemeColorTokenValue;
  border?: ThemeColorTokenValue;
  fg?: ThemeColorTokenValue;
  muted?: {
    bg?: ThemeColorTokenValue;
  };
  placeholder?: ThemeColorTokenValue;
}
/** @public */
interface ThemeColorInputTokens extends Partial<Record<ColorConfigInputState, ThemeColorInputStateTokens>> {
  _hue?: ColorHueKey;
}
/** @public */
interface ThemeColorTokens {
  base?: Partial<Record<ColorConfigCardTone, ThemeColorBaseTokens>>;
  button?: Partial<Record<ThemeColorButtonModeKey, ThemeColorButtonTokens>>;
  input?: Partial<Record<ColorConfigInputMode, ThemeColorInputTokens>>;
  selectable?: Partial<Record<ColorConfigStateTone, {
    _hue?: ColorHueKey;
  } & ThemeColorStatesTokens>>;
  syntax?: Partial<Record<keyof ThemeColorSyntax, ThemeColorTokenValue>>;
}
/** @internal */
interface TokenBaseKeyNode {
  type: 'base';
  tone: ColorConfigCardTone;
  key: ColorConfigCardKey | ColorConfigBlendKey;
}
/** @internal */
interface TokenButtonKeyNode {
  type: 'button';
  tone: ColorConfigStateTone;
  mode: ThemeColorButtonModeKey;
  key: ColorConfigStateKey | ColorConfigBlendKey;
}
/** @internal */
type TokenKeyNode = TokenBaseKeyNode | TokenButtonKeyNode;
/** @internal */
interface TokenColorValueNode {
  type: 'color';
  key?: 'black' | 'white';
  hue?: ColorHueKey;
  mix?: number;
  opacity?: number;
  tint?: ColorTintKey;
}
/** @internal */
interface TokenHueValueNode {
  type: 'hue';
  value?: ColorHueKey;
}
/** @internal */
interface TokenBlendModeValueNode {
  type: 'blendMode';
  value?: ThemeColorBlendModeKey;
}
/** @internal */
type TokenValueNode = TokenColorValueNode | TokenHueValueNode | TokenBlendModeValueNode;
/** @internal */
declare function parseTokenKey(str: string): TokenKeyNode | undefined;
/** @internal */
declare function parseTokenValue(str: string): TokenValueNode | undefined;
/** @public */
type ThemeColorPalette = {
  black: string | ColorTint;
  white: string | ColorTint;
} & Record<ColorHueKey, Record<ColorTintKey, string | ColorTint>>;
/** @public */
interface ThemeConfig {
  avatar?: ThemeAvatar_v2;
  button?: {
    border: {
      width: number;
    };
    focusRing: ThemeFocusRing;
    textWeight: ThemeFontWeightKey;
  };
  card?: {
    border: {
      width: number;
    };
    focusRing: ThemeFocusRing;
    shadow: {
      outline: number;
    };
  };
  color?: ThemeColorTokens;
  container?: number[];
  font?: ThemeFonts;
  input?: ThemeInput_v2;
  layer?: ThemeLayer;
  media?: number[];
  palette?: ThemeColorPalette;
  radius?: number[];
  shadow?: Array<ThemeShadow | null>;
  space?: number[];
  /** @internal */
  style?: ThemeStyles;
}
/** @internal */
declare function buildTheme(config?: ThemeConfig): RootTheme;
/**
 * @internal
 */
interface RGB {
  r: number;
  g: number;
  b: number;
  a?: undefined;
}
/**
 * @internal
 */
interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}
/**
 * @internal
 */
interface HSL {
  h: number;
  s: number;
  l: number;
}
/**
 * Apply the \`mix\` blend mode
 * @internal
 */
declare function mix(b: RGB | RGBA, s: RGB | RGBA, weight: number): RGB;
/**
 * Apply the \`multiply\` blend mode
 * Source: https://www.w3.org/TR/compositing-1/#blendingmultiply
 * @internal
 */
declare function multiply(b: RGB | RGBA, s: RGB | RGBA): RGB;
/**
 * Apply the \`screen\` blend mode
 * Source: https://www.w3.org/TR/compositing-1/#blendingscreen
 * @internal
 */
declare function screen(b: RGB | RGBA, s: RGB | RGBA): RGB;
/** @internal */
declare function getContrastRatio(bg: string, fg: string): number;
/**
 * @internal
 */
declare function hexToRgb(hex: string): RGB;
/**
 * @internal
 */
declare function rgbaToRGBA(rgba: string): RGBA;
/**
 * @internal
 */
declare function rgbToHex(color: RGB | RGBA): string;
/**
 * @internal
 * @see https://css-tricks.com/converting-color-spaces-in-javascript/
 */
declare function rgbToHsl({
  r,
  g,
  b
}: RGB): HSL;
/**
 * @internal
 */
declare function hslToRgb(hsl: HSL): RGB;
/**
 * @internal
 */
declare function parseColor(color: unknown): RGB | RGBA;
/**
 * @internal
 */
declare function rgba(color: unknown, a: number): string;
/** @internal */
declare function getScopedTheme(themeProp: RootTheme | RootTheme_v2, scheme: ThemeColorSchemeKey, tone: ThemeColorCardToneKey): Theme;
/** @public */
declare function getTheme_v2(theme: Theme): Theme_v2;
/** @internal */
declare function is_v0(themeProp: RootTheme | RootTheme_v2): themeProp is RootTheme;
/** @internal */
declare function is_v2(themeProp: RootTheme | RootTheme_v2): themeProp is RootTheme_v2;
/** @internal */
declare function v0_v2(v0: RootTheme): RootTheme_v2;
/** @internal */
declare function v2_v0(v2: RootTheme_v2): RootTheme;
export { COLOR_CONFIG_BLEND_KEYS as $, THEME_COLOR_STATE_TONES as $n, ThemeColorGenericState as $t, TokenHueValueNode as A, ThemeColorAvatarHue_v2 as An, ThemeColorScheme as At, ThemeColorInputTokens as B, ThemeColorInputModeKey as Bn, ThemeColorMutedTone as Bt, ThemeConfig as C, ThemeColorButtonMode_v2 as Cn, BaseTheme as Ct, TokenBlendModeValueNode as D, ThemeColorKBD as Dn, Theme_v2 as Dt, TokenBaseKeyNode as E, ThemeColorState_v2 as En, Theme as Et, ThemeColorBadgeTokens as F, isColorTintKey as Fn, ThemeColorSolidTone as Ft, isColorConfigBaseTone as G, THEME_COLOR_AVATAR_COLORS as Gn, ThemeColorCardState as Gt, ThemeColorStatesTokens as H, ThemeColorSchemeKey as Hn, ThemeColorInputState as Ht, ThemeColorBadgeToneTokens as I, ThemeColorAvatarColorKey as In, ThemeColorSelectable as It, isColorConfigStateTone as J, THEME_COLOR_CARD_TONES as Jn, ThemeColorButtonStates as Jt, isColorConfigBlendKey as K, THEME_COLOR_BLEND_MODES as Kn, ThemeColorButton as Kt, ThemeColorBaseTokens as L, ThemeColorBlendModeKey as Ln, ThemeColorSelectableState as Lt, TokenValueNode as M, isColorBlendModeValue as Mn, ThemeColorSpot as Mt, ThemeColorAvatarHueTokens as N, isColorButtonMode as Nn, ThemeColorSpotKey as Nt, TokenButtonKeyNode as O, ThemeColorBadgeTone_v2 as On, ThemeInput as Ot, ThemeColorAvatarTokens as P, isColorHueKey as Pn, ThemeColorSolid as Pt, COLOR_CONFIG_AVATAR_COLORS as Q, THEME_COLOR_STATES as Qn, ThemeColorToneKey as Qt, ThemeColorButtonTokens as R, ThemeColorButtonModeKey as Rn, ThemeColorSelectableStates as Rt, ThemeColorPalette as S, ThemeColorInput_v2 as Sn, createColorTheme as St, parseTokenKey as T, ThemeColorButton_v2 as Tn, RootTheme_v2 as Tt, ThemeColorTokens as U, ThemeColorStateKey as Un, ThemeColorInputStates as Ut, ThemeColorStateTokens as V, ThemeColorInputStateKey as Vn, ThemeColorInput as Vt, isColorConfigBaseKey as W, ThemeColorStateToneKey as Wn, ThemeColorCard as Wt, isColorTokenValue as X, THEME_COLOR_INPUT_STATES as Xn, ThemeColorBase as Xt, isColorOpacityValue as Y, THEME_COLOR_INPUT_MODES as Yn, ThemeColorButtonTones as Yt, isColorValue as Z, THEME_COLOR_SCHEMES as Zn, ThemeColorName as Zt, mix as _, ThemeColorShadow as _n, ColorConfigStateTone as _t, getTheme_v2 as a, ThemeInput_v2 as an, COLOR_CONFIG_STATE_KEYS as at, RGBA as b, ThemeColorInputMode_v2 as bn, PartialThemeColorBuilderOpts as bt, parseColor as c, ThemeFontSize as cn, ColorConfigAvatarColor as ct, rgbToHex as d, ThemeFonts as dn, ColorConfigCardTone as dt, ThemeAvatar as en, ThemeAvatar_v2 as er, COLOR_CONFIG_CARD_KEYS as et, rgbToHsl as f, CSSObject as fn, ColorConfigInputMode as ft, multiply as g, ThemeColorSyntax as gn, ColorConfigStateKey as gt, screen as h, ThemeColorSchemes_v2 as hn, ColorConfigState as ht, is_v0 as i, ThemeLayer as in, COLOR_CONFIG_STATES as it, TokenKeyNode as j, ThemeColorAvatar_v2 as jn, ThemeColorSchemes as jt, TokenColorValueNode as k, ThemeColorBadge_v2 as kn, ThemeColor as kt, hexToRgb as l, ThemeFontWeight as ln, ColorConfigBlendKey as lt, getContrastRatio as m, ThemeColorScheme_v2 as mn, ColorConfigOpacityValue as mt, v0_v2 as n, ThemeBoxShadow as nn, COLOR_CONFIG_INPUT_MODES as nt, getScopedTheme as o, ThemeFont as on, COLOR_CONFIG_STATE_TONES as ot, rgbaToRGBA as p, ThemeColorCard_v2 as pn, ColorConfigInputState as pt, isColorConfigStateKey as q, THEME_COLOR_BUTTON_MODES as qn, ThemeColorButtonState as qt, is_v2 as r, ThemeShadow as rn, COLOR_CONFIG_INPUT_STATES as rt, rgba as s, ThemeFontKey as sn, ColorBlendModeTokenValue as st, v2_v0 as t, ThemeStyles as tn, ThemeFocusRing as tr, COLOR_CONFIG_CARD_TONES as tt, hslToRgb as u, ThemeFontWeightKey as un, ColorConfigCardKey as ut, HSL as v, ThemeColorSelectableTone_v2 as vn, ColorConfigValue as vt, parseTokenValue as w, ThemeColorButtonTone_v2 as wn, RootTheme as wt, buildTheme as x, ThemeColorInputState_v2 as xn, ThemeColorBuilderOpts as xt, RGB as y, ThemeColorSelectable_v2 as yn, ThemeColorTokenValue as yt, ThemeColorInputStateTokens as z, ThemeColorCardToneKey as zn, ThemeColorMuted as zt };
//# sourceMappingURL=theme.d.ts.map