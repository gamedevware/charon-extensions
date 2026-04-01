import { ValueControl } from 'charon-extensions';
import { memo, useCallback } from 'react';
import { useControlValue, useControlDisabledStatus } from './reactive';

function __COMPONENT_NAME__({ valueControl }: { valueControl: ValueControl<any> }) {
  const [value, setValue] = useControlValue(valueControl);
  const [disabled] = useControlDisabledStatus(valueControl);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, [setValue]);

  // TODO: Replace this placeholder input with your actual editor UI.
  // Use setValue(newValue) to write changes back to Charon.
  // Import useControlReadOnlyStatus from './reactive' if you need readOnly support.
  // Call valueControl.registerDoFocus(...) in a useEffect to support keyboard navigation.
  return (
    <input
      className="placeholder-input"
      value={value ?? ''}
      disabled={disabled}
      onChange={handleChange}
    />
  );
}

export default memo(__COMPONENT_NAME__);
