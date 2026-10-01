import React, { useEffect, useState } from 'react';

const AnimatedNumber = ({ value, duration = 900 }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === undefined || value === null) return;

    const strVal = String(value);
    const match = strVal.match(/^([^0-9.-]*)([0-9,.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || '';
    const numericStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetNum = parseFloat(numericStr);

    if (isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const isFloat = numericStr.includes('.');
    const decimalPlaces = isFloat ? numericStr.split('.')[1].length : 0;

    let startTime = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const current = targetNum * easedProgress;

      const formattedNum = isFloat
        ? current.toFixed(decimalPlaces)
        : Math.round(current).toString();

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(strVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export default AnimatedNumber;
