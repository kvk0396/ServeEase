import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export type ThemedSelectOption = { value: string; label: string };
export type Option = ThemedSelectOption;

interface ThemedSelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: ThemedSelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export default function ThemedSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select',
  className = '',
  buttonClassName = '',
}: ThemedSelectProps) {
  const selectedLabel = options.find(o => o.value === value)?.label || '';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-primary-700 mb-2">{label}</label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button 
            className={cn(
              'w-full flex justify-between items-center input text-left',
              'transition-all duration-500 ease-in-out',
              buttonClassName
            )}
            style={{
              color: value ? '#C73866' : '#6B7280'
            }}
          >
            <span 
              className={cn(
                'truncate font-medium', 
                value ? 'text-primary-700' : 'text-gray-500'
              )}
              style={{
                color: value ? '#C73866' : '#6B7280'
              }}
            >
              {selectedLabel || placeholder}
            </span>
            <ChevronRight className="w-4 h-4 rotate-90 text-primary-600" />
          </Listbox.Button>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Listbox.Options
              className="absolute z-20 mt-2 max-h-60 overflow-auto rounded-lg shadow-lg border focus:outline-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #FE676E',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                minWidth: '100%',
                width: 'max-content',
                maxWidth: '300px',
              }}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    cn(
                      'relative cursor-pointer select-none py-3 pl-3 pr-9 text-sm whitespace-nowrap',
                      active 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-gray-900 hover:bg-gray-50'
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span 
                        className={cn(
                          'block', 
                          selected ? 'font-semibold text-primary-700' : 'font-normal',
                          active ? 'text-primary-700' : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600">
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
} 