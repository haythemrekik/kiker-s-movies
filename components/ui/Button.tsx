import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const classNames = [
      styles.button,
      styles[variant],
      styles[`size-${size}`],
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        className={classNames}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
