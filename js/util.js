
const Util = {};

Util.hexToRgb = (hex) =>
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

Util.rgbToHex = (r, g, b) =>
{
    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
};

Util.getColorFromMap = (map, position) =>
{
    let prevEntry = null;
    for (const entry of map.gradient)
    {
        if(position < entry.value)
        {
            if(prevEntry == null)
            {   
                // First entry
                return Util.hexToRgb(entry.color);
            }
            // Between prev and current
            const rgbPrev = Util.hexToRgb(prevEntry.color);
            const rgb = Util.hexToRgb(entry.color);
            const f = (position - prevEntry.value) / (entry.value - prevEntry.value)
            return ({
                r: rgb.r * f + (1 - f) * rgbPrev.r,
                g: rgb.g * f + (1 - f) * rgbPrev.g,
                b: rgb.b * f + (1 - f) * rgbPrev.b
            });
        }

        prevEntry = entry;
    }
    return Util.hexToRgb(prevEntry.color); // Last entry
};

export default Util;
