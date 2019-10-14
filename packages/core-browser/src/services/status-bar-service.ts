import { IDisposable } from '@ali/ide-core-common/lib/disposable';

export const IStatusBarService = Symbol('IStatusBarService');

export interface IStatusBarService {
  getBackgroundColor(): string | undefined;
  setBackgroundColor(color?: string): void;
  setColor(color?: string): void;
  addElement(id: string, entry: StatusBarEntry): IDisposable;
  setElement(id: string, fields: object): void;
  removeElement(id: string): void;
  leftEntries: StatusBarEntry[];
  rightEntries: StatusBarEntry[];
}

export interface StatusBarEntry {
  id?: string;
  /**
   * 可以通过 text 设置图标
   * $(iconClassName) :text
   */
  text?: string;
  alignment: StatusBarAlignment;
  color?: string;
  className?: string;
  tooltip?: string;
  command?: string;
  arguments?: any[];
  priority?: number;
  iconClass?: string;
  onClick?: (e: any) => void;
}

export enum StatusBarAlignment {
  LEFT, RIGHT,
}
