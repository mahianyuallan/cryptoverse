import millify from 'millify';

// Some values come back from the API as null, and millify crashes on null
const formatValue = (value, suffix = '') => (value == null ? 'N/A' : `${millify(value)}${suffix}`);

export default formatValue;
