/**
 * @license
 * Copyright (c) 2022 Handsoncode. All rights reserved.
 */
/**
 * This is a class for detailed error messages across HyperFormula.
 */
export class ErrorMessage {
}
ErrorMessage.DistinctSigns = 'Distinct signs.';
ErrorMessage.WrongArgNumber = 'Wrong number of arguments.';
ErrorMessage.EmptyArg = 'Empty function argument.';
ErrorMessage.EmptyArray = 'Empty array not allowed.';
ErrorMessage.ArrayDimensions = 'Array dimensions are not compatible.';
ErrorMessage.NoSpaceForArrayResult = 'No space for array result.';
ErrorMessage.ValueSmall = 'Value too small.';
ErrorMessage.ValueLarge = 'Value too large.';
ErrorMessage.BadCriterion = 'Incorrect criterion.';
ErrorMessage.RangeManySheets = 'Range spans more than one sheet.';
ErrorMessage.CellRangeExpected = 'Cell range expected.';
ErrorMessage.WrongDimension = 'Wrong range dimension.';
ErrorMessage.ScalarExpected = 'Cell range not allowed.';
ErrorMessage.NumberCoercion = 'Value cannot be coerced to number.';
ErrorMessage.NumberExpected = 'Number argument expected.';
ErrorMessage.IntegerExpected = 'Value needs to be an integer.';
ErrorMessage.BadMode = 'Mode not recognized.';
ErrorMessage.DateBounds = 'Date outside of bounds.';
ErrorMessage.OutOfSheet = 'Resulting reference is out of the sheet.';
ErrorMessage.WrongType = 'Wrong type of argument.';
ErrorMessage.NaN = 'NaN or infinite value encountered.';
ErrorMessage.EqualLength = 'Ranges need to be of equal length.';
ErrorMessage.Negative = 'Value cannot be negative.';
ErrorMessage.NotBinary = 'String does not represent a binary number.';
ErrorMessage.NotOctal = 'String does not represent an octal number.';
ErrorMessage.NotHex = 'String does not represent a hexadecimal number.';
ErrorMessage.EndStartPeriod = 'End period needs to be at least start period.';
ErrorMessage.CellRefExpected = 'Cell reference expected.';
ErrorMessage.EmptyRange = 'Empty range not allowed.';
ErrorMessage.BadRef = 'Address is not correct.';
ErrorMessage.NumberRange = 'Number-only range expected.';
ErrorMessage.ValueNotFound = 'Value not found.';
ErrorMessage.ValueBaseLarge = 'Value in base too large.';
ErrorMessage.ValueBaseSmall = 'Value in base too small.';
ErrorMessage.ValueBaseLong = 'Value in base too long.';
ErrorMessage.NegativeLength = 'Length cannot be negative.';
ErrorMessage.PatternNotFound = 'Pattern not found.';
ErrorMessage.OneValue = 'Needs at least one value.';
ErrorMessage.TwoValues = 'Range needs to contain at least two elements.';
ErrorMessage.ThreeValues = 'Range needs to contain at least three elements.';
ErrorMessage.IndexBounds = 'Index out of bounds.';
ErrorMessage.IndexLarge = 'Index too large.';
ErrorMessage.Formula = 'Expected formula.';
ErrorMessage.NegativeCount = 'Count cannot be negative.';
ErrorMessage.ParseError = 'Parsing error.';
ErrorMessage.SheetRef = 'Sheet does not exist.';
ErrorMessage.PeriodLong = 'Period number cannot exceed life length.';
ErrorMessage.InvalidDate = 'Invalid date.';
ErrorMessage.BitshiftLong = 'Result of bitshift is too long.';
ErrorMessage.EmptyString = 'Empty-string argument not allowed.';
ErrorMessage.LengthBounds = 'Length out of bounds.';
ErrorMessage.NegativeTime = 'Time cannot be negative.';
ErrorMessage.NoDefault = 'No default option.';
ErrorMessage.Selector = 'Selector cannot exceed the number of arguments.';
ErrorMessage.StartEndDate = 'Start date needs to be earlier than end date.';
ErrorMessage.IncorrectDateTime = 'String does not represent correct DateTime.';
ErrorMessage.CharacterCodeBounds = 'Character code out of bounds.';
ErrorMessage.NonZero = 'Argument cannot be 0.';
ErrorMessage.LessThanOne = 'Argument cannot be less than 1.';
ErrorMessage.WeekendString = 'Incorrect weekend bitmask string.';
ErrorMessage.InvalidRoman = 'Invalid roman numeral.';
ErrorMessage.WrongOrder = 'Wrong order of values.';
ErrorMessage.ComplexNumberExpected = 'Complex number expected.';
ErrorMessage.ShouldBeIorJ = 'Should be \'i\' or \'j\'.';
ErrorMessage.SizeMismatch = 'Array dimensions mismatched.';
ErrorMessage.FunctionName = (arg) => `Function name ${arg} not recognized.`;
ErrorMessage.NamedExpressionName = (arg) => `Named expression ${arg} not recognized.`;
ErrorMessage.LicenseKey = (arg) => `License key is ${arg}.`;
