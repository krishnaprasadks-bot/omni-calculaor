export type UnitCategory = 
  | "Length"
  | "Weight/Mass"
  | "Temperature"
  | "Speed"
  | "Volume"
  | "Area"
  | "Time"
  | "Energy"
  | "Power"
  | "Pressure"
  | "Data"
  | "Frequency"
  | "Angle"
  | "Fuel Economy"
  | "Cooking";

export interface Unit {
  id: string; // e.g. "km"
  name: string; // e.g. "Kilometers"
  symbol: string;
  multiplier: number; // Multiplier relative to the base unit, or offset function
  isBase?: boolean;
}

export interface UnitData {
  category: UnitCategory;
  baseUnit: string;
  units: Unit[];
}

export const unitCategories: UnitData[] = [
  {
    category: "Length",
    baseUnit: "m",
    units: [
      { id: "m", name: "Meters", symbol: "m", multiplier: 1, isBase: true },
      { id: "mm", name: "Millimeters", symbol: "mm", multiplier: 0.001 },
      { id: "cm", name: "Centimeters", symbol: "cm", multiplier: 0.01 },
      { id: "km", name: "Kilometers", symbol: "km", multiplier: 1000 },
      { id: "in", name: "Inches", symbol: "in", multiplier: 0.0254 },
      { id: "ft", name: "Feet", symbol: "ft", multiplier: 0.3048 },
      { id: "yd", name: "Yards", symbol: "yd", multiplier: 0.9144 },
      { id: "mi", name: "Miles", symbol: "mi", multiplier: 1609.344 },
      { id: "nmi", name: "Nautical Miles", symbol: "nmi", multiplier: 1852 },
      { id: "ly", name: "Light Years", symbol: "ly", multiplier: 9.4607304725808e15 },
      { id: "au", name: "Astronomical Units", symbol: "AU", multiplier: 149597870700 },
    ]
  },
  {
    category: "Weight/Mass",
    baseUnit: "kg",
    units: [
      { id: "kg", name: "Kilograms", symbol: "kg", multiplier: 1, isBase: true },
      { id: "mg", name: "Milligrams", symbol: "mg", multiplier: 1e-6 },
      { id: "g", name: "Grams", symbol: "g", multiplier: 1e-3 },
      { id: "t", name: "Metric Tonnes", symbol: "t", multiplier: 1000 },
      { id: "oz", name: "Ounces", symbol: "oz", multiplier: 0.028349523125 },
      { id: "lb", name: "Pounds", symbol: "lb", multiplier: 0.45359237 },
      { id: "st", name: "Stones", symbol: "st", multiplier: 6.35029318 },
      { id: "slug", name: "Slugs", symbol: "slug", multiplier: 14.5939029 },
    ]
  },
  {
    category: "Area",
    baseUnit: "m2",
    units: [
      { id: "m2", name: "Square Meters", symbol: "m²", multiplier: 1, isBase: true },
      { id: "mm2", name: "Square Millimeters", symbol: "mm²", multiplier: 1e-6 },
      { id: "cm2", name: "Square Centimeters", symbol: "cm²", multiplier: 1e-4 },
      { id: "km2", name: "Square Kilometers", symbol: "km²", multiplier: 1e6 },
      { id: "in2", name: "Square Inches", symbol: "in²", multiplier: 0.00064516 },
      { id: "ft2", name: "Square Feet", symbol: "ft²", multiplier: 0.09290304 },
      { id: "acre", name: "Acres", symbol: "ac", multiplier: 4046.8564224 },
      { id: "ha", name: "Hectares", symbol: "ha", multiplier: 10000 },
    ]
  },
  {
    category: "Volume",
    baseUnit: "l",
    units: [
      { id: "l", name: "Liters", symbol: "L", multiplier: 1, isBase: true },
      { id: "ml", name: "Milliliters", symbol: "ml", multiplier: 1e-3 },
      { id: "m3", name: "Cubic Meters", symbol: "m³", multiplier: 1000 },
      { id: "flozUS", name: "Fluid Ounces (US)", symbol: "fl oz", multiplier: 0.0295735295625 },
      { id: "flozUK", name: "Fluid Ounces (UK)", symbol: "fl oz", multiplier: 0.0284130625 },
      { id: "cup", name: "Cups (US)", symbol: "cup", multiplier: 0.2365882365 },
      { id: "pt", name: "Pints (US)", symbol: "pt", multiplier: 0.473176473 },
      { id: "qt", name: "Quarts (US)", symbol: "qt", multiplier: 0.946352946 },
      { id: "galUS", name: "Gallons (US)", symbol: "gal", multiplier: 3.785411784 },
      { id: "galUK", name: "Gallons (UK)", symbol: "gal", multiplier: 4.54609 },
    ]
  },
  {
    category: "Speed",
    baseUnit: "m_s",
    units: [
      { id: "m_s", name: "Meters per second", symbol: "m/s", multiplier: 1, isBase: true },
      { id: "km_h", name: "Kilometers per hour", symbol: "km/h", multiplier: 0.27777777777778 },
      { id: "mph", name: "Miles per hour", symbol: "mph", multiplier: 0.44704 },
      { id: "kn", name: "Knots", symbol: "kn", multiplier: 0.51444444444444 },
      { id: "mach", name: "Mach (Standard)", symbol: "M", multiplier: 340.3 }, // rough approx
      { id: "c", name: "Speed of Light", symbol: "c", multiplier: 299792458 },
    ]
  },
  {
    category: "Time",
    baseUnit: "s",
    units: [
      { id: "s", name: "Seconds", symbol: "s", multiplier: 1, isBase: true },
      { id: "ms", name: "Milliseconds", symbol: "ms", multiplier: 0.001 },
      { id: "min", name: "Minutes", symbol: "min", multiplier: 60 },
      { id: "hr", name: "Hours", symbol: "hr", multiplier: 3600 },
      { id: "day", name: "Days", symbol: "d", multiplier: 86400 },
      { id: "wk", name: "Weeks", symbol: "wk", multiplier: 604800 },
      { id: "mo", name: "Months (30.44d)", symbol: "mo", multiplier: 2629746 },
      { id: "yr", name: "Years (365.24d)", symbol: "yr", multiplier: 31556952 },
      { id: "cen", name: "Centuries", symbol: "cen", multiplier: 3155695200 },
    ]
  },
  {
    category: "Energy",
    baseUnit: "j",
    units: [
      { id: "j", name: "Joules", symbol: "J", multiplier: 1, isBase: true },
      { id: "kj", name: "Kilojoules", symbol: "kJ", multiplier: 1000 },
      { id: "cal", name: "Calories", symbol: "cal", multiplier: 4.184 },
      { id: "kcal", name: "Kilocalories (Food)", symbol: "kcal", multiplier: 4184 },
      { id: "kwh", name: "Kilowatt-hours", symbol: "kWh", multiplier: 3600000 },
      { id: "btu", name: "British Thermal Units", symbol: "BTU", multiplier: 1055.05585262 },
      { id: "ev", name: "Electronvolts", symbol: "eV", multiplier: 1.602176634e-19 },
    ]
  },
  {
    category: "Power",
    baseUnit: "w",
    units: [
      { id: "w", name: "Watts", symbol: "W", multiplier: 1, isBase: true },
      { id: "kw", name: "Kilowatts", symbol: "kW", multiplier: 1000 },
      { id: "mw", name: "Megawatts", symbol: "MW", multiplier: 1e6 },
      { id: "hp", name: "Horsepower (Mechanical)", symbol: "HP", multiplier: 745.699872 },
      { id: "btu_hr", name: "BTU per hour", symbol: "BTU/hr", multiplier: 0.293071 },
    ]
  },
  {
    category: "Pressure",
    baseUnit: "pa",
    units: [
      { id: "pa", name: "Pascals", symbol: "Pa", multiplier: 1, isBase: true },
      { id: "kpa", name: "Kilopascals", symbol: "kPa", multiplier: 1000 },
      { id: "bar", name: "Bars", symbol: "bar", multiplier: 1e5 },
      { id: "psi", name: "Pounds per square inch", symbol: "psi", multiplier: 6894.757293168 },
      { id: "atm", name: "Standard Atmospheres", symbol: "atm", multiplier: 101325 },
      { id: "mmhg", name: "Millimeters of Mercury", symbol: "mmHg", multiplier: 133.322387415 },
      { id: "inhg", name: "Inches of Mercury", symbol: "inHg", multiplier: 3386.389 },
    ]
  },
  {
    category: "Data",
    baseUnit: "b",
    units: [
      { id: "bit", name: "Bits", symbol: "bit", multiplier: 0.125 },
      { id: "b", name: "Bytes", symbol: "B", multiplier: 1, isBase: true },
      { id: "kb", name: "Kilobytes (Metric)", symbol: "KB", multiplier: 1000 },
      { id: "kib", name: "Kibibytes (Binary)", symbol: "KiB", multiplier: 1024 },
      { id: "mb", name: "Megabytes", symbol: "MB", multiplier: 1000 ** 2 },
      { id: "mib", name: "Mebibytes", symbol: "MiB", multiplier: 1024 ** 2 },
      { id: "gb", name: "Gigabytes", symbol: "GB", multiplier: 1000 ** 3 },
      { id: "gib", name: "Gibibytes", symbol: "GiB", multiplier: 1024 ** 3 },
      { id: "tb", name: "Terabytes", symbol: "TB", multiplier: 1000 ** 4 },
      { id: "tib", name: "Tebibytes", symbol: "TiB", multiplier: 1024 ** 4 },
      { id: "pb", name: "Petabytes", symbol: "PB", multiplier: 1000 ** 5 },
      { id: "pib", name: "Pebibytes", symbol: "PiB", multiplier: 1024 ** 5 },
    ]
  },
  {
    category: "Frequency",
    baseUnit: "hz",
    units: [
      { id: "hz", name: "Hertz", symbol: "Hz", multiplier: 1, isBase: true },
      { id: "khz", name: "Kilohertz", symbol: "kHz", multiplier: 1e3 },
      { id: "mhz", name: "Megahertz", symbol: "MHz", multiplier: 1e6 },
      { id: "ghz", name: "Gigahertz", symbol: "GHz", multiplier: 1e9 },
      { id: "thz", name: "Terahertz", symbol: "THz", multiplier: 1e12 },
    ]
  },
  {
    category: "Angle",
    baseUnit: "deg",
    units: [
      { id: "deg", name: "Degrees", symbol: "°", multiplier: 1, isBase: true },
      { id: "rad", name: "Radians", symbol: "rad", multiplier: 180 / Math.PI },
      { id: "grad", name: "Gradians", symbol: "grad", multiplier: 0.9 },
      { id: "arcmin", name: "Arcminutes", symbol: "'", multiplier: 1 / 60 },
      { id: "arcsec", name: "Arcseconds", symbol: '"', multiplier: 1 / 3600 },
    ]
  },
  {
    category: "Fuel Economy", // SPECIAL HANDLING NEEDED IN convertValue
    baseUnit: "km_l",
    units: [
      { id: "km_l", name: "Kilometers per Liter", symbol: "km/L", multiplier: 1, isBase: true },
      { id: "l_100km", name: "Liters per 100km", symbol: "L/100km", multiplier: -1 }, // Custom logic required
      { id: "mpg_us", name: "Miles per Gallon (US)", symbol: "mpg", multiplier: 0.425143707 },
      { id: "mpg_uk", name: "Miles per Gallon (UK)", symbol: "mpg", multiplier: 0.35400619 },
    ]
  },
  {
    category: "Cooking",
    baseUnit: "ml",
    units: [
      { id: "ml_c", name: "Milliliters", symbol: "ml", multiplier: 1, isBase: true },
      { id: "tsp", name: "Teaspoons", symbol: "tsp", multiplier: 4.92892 },
      { id: "tbsp", name: "Tablespoons", symbol: "tbsp", multiplier: 14.7868 },
      { id: "cup_c", name: "Cups", symbol: "cup", multiplier: 236.588 },
      { id: "floz_c", name: "Fluid Ounces", symbol: "fl oz", multiplier: 29.5735 },
    ]
  },
  {
    category: "Temperature", // SPECIAL HANDLING NEEDED IN convertValue
    baseUnit: "c",
    units: [
      { id: "c", name: "Celsius", symbol: "°C", multiplier: 1, isBase: true },
      { id: "f", name: "Fahrenheit", symbol: "°F", multiplier: 0 }, // Handled via special logic
      { id: "k", name: "Kelvin", symbol: "K", multiplier: 0 },
      { id: "r", name: "Rankine", symbol: "°R", multiplier: 0 },
    ]
  }
];

export function convertValue(val: number, fromId: string, toId: string, categoryName: UnitCategory): number {
  if (val === null || isNaN(val)) return val;
  if (fromId === toId) return val;

  const category = unitCategories.find(c => c.category === categoryName);
  if (!category) return val;

  // Temperature special logic
  if (categoryName === "Temperature") {
    // Convert TO Celsius first
    let c = val;
    if (fromId === "f") c = (val - 32) * 5/9;
    else if (fromId === "k") c = val - 273.15;
    else if (fromId === "r") c = (val - 491.67) * 5/9;

    // Convert FROM Celsius to target
    if (toId === "c") return c;
    if (toId === "f") return (c * 9/5) + 32;
    if (toId === "k") return c + 273.15;
    if (toId === "r") return (c + 273.15) * 9/5;
  }

  // Fuel Economy special logic
  if (categoryName === "Fuel Economy") {
    // Base is km/L. 
    // l_100km to km_l = 100 / val
    // km_l to l_100km = 100 / val
    let kmL = val;
    if (fromId === "l_100km") {
        kmL = 100 / val;
    } else {
        const fromUnit = category.units.find(u => u.id === fromId);
        if (fromUnit) kmL = val * fromUnit.multiplier;
    }

    if (toId === "l_100km") {
        return 100 / kmL;
    } else {
        const toUnit = category.units.find(u => u.id === toId);
        if (toUnit) return kmL / toUnit.multiplier;
    }
  }

  const fromUnit = category.units.find(u => u.id === fromId);
  const toUnit = category.units.find(u => u.id === toId);

  if (!fromUnit || !toUnit) return val;

  // Convert to base unit: val * fromUnit.multiplier
  // Then space unit: (val * fromUnit.multiplier) / toUnit.multiplier
  return (val * fromUnit.multiplier) / toUnit.multiplier;
}
