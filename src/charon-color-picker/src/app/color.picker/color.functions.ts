import { SpecificationDictionary } from "charon-extensions";
import { ColorPickerService, Hsva, Rgba } from "ngx-color-picker";

export type ColorOutputFormat = 'rgba' | 'hsla' | 'hex';
/**
 * Determine output format for current `valueControl` or return default `hex` format.
 */
export function determineOutputFormat(specification: SpecificationDictionary) {
    let outputFormat: ColorOutputFormat = 'hex';
    for (const format of specification.get('format') ?? []) {
        switch (format) {
            case 'rgba':
                outputFormat = 'rgba';
                break;
            case 'hsla':
                outputFormat = 'hsla';
                break;
            case 'hex':
            default:
                outputFormat = 'hex';
                break;
        }
    }
    return outputFormat;
}

/**
 * Take HSVA color value and encode it into int32 (ARGB)
 * @returns ARGB value of color
 */
export function encodeColor(value: Hsva | null, colorPickerService: ColorPickerService): number {
    if (!value) {
        return 0;
    }
    var rgba = colorPickerService.hsvaToRgba(value);
    const a = Math.max(0, Math.min(Math.round(rgba.a * 255), 255)) << 24; // Alpha (shifted to the highest byte)
    const r = rgba.r << 16; // Red (shifted to second-highest byte)
    const g = rgba.g << 8;  // Green (shifted to second-lowest byte)
    const b = rgba.b;       // Blue (lowest byte)
    return (a | r | g | b) | 0;
}
/**
 * Take HSVA color value and format it as a string in `outputFormat` format
 * @returns String formatted color value
 */
export function formatColor(value: Hsva | null, outputFormat: ColorOutputFormat, colorPickerService: ColorPickerService): string {
    return value ? colorPickerService.outputFormat(value, outputFormat, null) : ''
}
/**
 * Try to parse a string color value or decode an int32 ARGB color value and return an HSVA color.
 * @returns HSVA color value or null if parsing failed.
 */
export function parseColorOrNull(value: any, colorPickerService: ColorPickerService): Hsva | null {
    let parsedHsva: Hsva | null = null;
    if (typeof value === 'number') {
        const argbInteger = value | 0;
        var rgba: Rgba = {
            r: (argbInteger >> 16) & 0xFF,         // Extract red
            g: (argbInteger >> 8) & 0xFF,          // Extract green
            b: argbInteger & 0xFF,                 // Extract blue
            a: ((argbInteger >> 24) & 0xFF) / 255, // Extract alpha and normalize to [0,1]
        };
        parsedHsva = colorPickerService.rgbaToHsva(rgba);
    } else {
        parsedHsva = colorPickerService.stringToHsva(value + '', true);
    }
    return parsedHsva;
}