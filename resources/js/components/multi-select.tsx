import { forwardRef } from 'react';
import { GroupBase, Props as ReactSelectProps } from 'react-select';
import AsyncSelect from 'react-select/async';

export type MultiSelectProps<Option, IsMulti extends boolean = true, Group extends GroupBase<Option> = GroupBase<Option>> = Omit<
    ReactSelectProps<Option, IsMulti, Group>,
    'theme' | 'classNames'
> & {
    isMulti?: boolean;
    placeholder?: string;
    defaultValue: any;
    onChange: (value: any) => void;
    loadOptions: (params: any) => Promise<any>;
    className?: string;
    isRequired?: boolean;
    menuPlacement?: 'auto' | 'bottom' | 'top';
    isReadOnly?: boolean;
    [key: string]: any;
};

export const MultiSelect = forwardRef<any, MultiSelectProps<any>>(({ className, ...props }, ref) => {
    return (
        <AsyncSelect
            ref={ref}
            cacheOptions
            name={props.name}
            loadOptions={props.loadOptions}
            defaultOptions
            isClearable
            defaultValue={props.defaultValue}
            onChange={(value) => {
                props.onChange(value);
            }}
            placeholder={props.placeholder}
            isMulti={props.isMulti}
            menuPlacement={props.menuPlacement}
            isDisabled={props.isReadOnly}
            className={className}
        />
    );
});

MultiSelect.displayName = 'MultiSelect';
