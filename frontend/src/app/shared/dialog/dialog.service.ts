import { Injectable, signal } from '@angular/core';

export type DialogVariant = 'primary' | 'danger' | 'success' | 'secondary';

export type DialogState =
  | {
      type: 'none';
      open: false;
    }
  | {
      type: 'confirm';
      open: true;
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
      variant: DialogVariant;
    }
  | {
      type: 'input';
      open: true;
      title: string;
      message: string;
      placeholder: string;
      value: string;
      required: boolean;
      confirmText: string;
      cancelText: string;
      variant: DialogVariant;
    };

@Injectable({ providedIn: 'root' })
export class DialogService {
  state = signal<DialogState>({ type: 'none', open: false });

  private confirmResolver?: (value: boolean) => void;
  private inputResolver?: (value: string | null) => void;

  confirm(opts: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: DialogVariant;
  }): Promise<boolean> {
    // Close any existing dialog
    this.close();
    return new Promise<boolean>((resolve) => {
      this.confirmResolver = resolve;
      this.state.set({
        type: 'confirm',
        open: true,
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
        variant: opts.variant || 'primary',
      });
    });
  }

  input(opts: {
    title: string;
    message: string;
    placeholder?: string;
    initialValue?: string;
    required?: boolean;
    confirmText?: string;
    cancelText?: string;
    variant?: DialogVariant;
  }): Promise<string | null> {
    this.close();
    return new Promise<string | null>((resolve) => {
      this.inputResolver = resolve;
      this.state.set({
        type: 'input',
        open: true,
        title: opts.title,
        message: opts.message,
        placeholder: opts.placeholder || '',
        value: opts.initialValue || '',
        required: !!opts.required,
        confirmText: opts.confirmText || 'Submit',
        cancelText: opts.cancelText || 'Cancel',
        variant: opts.variant || 'primary',
      });
    });
  }

  updateInputValue(value: string) {
    const s = this.state();
    if (s.type !== 'input') return;
    this.state.set({ ...s, value });
  }

  resolveConfirm(value: boolean) {
    const resolve = this.confirmResolver;
    this.close();
    resolve?.(value);
  }

  resolveInput(value: string | null) {
    const resolve = this.inputResolver;
    this.close();
    resolve?.(value);
  }

  close() {
    this.state.set({ type: 'none', open: false });
    this.confirmResolver = undefined;
    this.inputResolver = undefined;
  }
}

