import { RadioGroup as ArkRadioGroup } from '@ark-ui/react/radio-group';
import { css } from '@styled-system/css';

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
}

export interface RadioGroupProps<T extends string = string> {
  options: RadioOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  label?: string;
  className?: string;
}

export function RadioGroup<T extends string = string>({
  options,
  value,
  onValueChange,
  label,
  className,
}: RadioGroupProps<T>) {
  const handleValueChange = (details: { value: string | null }) => {
    if (details.value) {
      onValueChange(details.value as T);
    }
  };

  return (
    <ArkRadioGroup.Root
      value={value}
      onValueChange={handleValueChange}
      className={`${css({
        display: 'flex',
        flexDir: 'column',
        gap: '2',
      })} ${className || ''}`}
    >
      {label && (
        <ArkRadioGroup.Label className={css({ fontWeight: 'medium' })}>{label}</ArkRadioGroup.Label>
      )}
      <div className={css({ display: 'flex', gap: '4', flexWrap: 'wrap' })}>
        {options.map((option) => (
          <ArkRadioGroup.Item
            key={option.value}
            value={option.value}
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              cursor: 'pointer',
            })}
          >
            <ArkRadioGroup.ItemControl
              className={css({
                width: '4',
                height: '4',
                borderRadius: 'full',
                border: '2px solid',
                position: 'relative',
                '&::after': {
                  transition: 'background-color 0.2s',
                  backgroundColor: 'transparent',
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '2',
                  height: '2',
                  borderRadius: 'full',
                },
                _checked: {
                  '&::after': {
                    backgroundColor: 'blue.500',
                  },
                },
              })}
            />
            <ArkRadioGroup.ItemText>{option.label}</ArkRadioGroup.ItemText>
            <ArkRadioGroup.ItemHiddenInput />
          </ArkRadioGroup.Item>
        ))}
      </div>
    </ArkRadioGroup.Root>
  );
}
