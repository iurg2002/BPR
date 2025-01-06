export interface Log{
    action: string;
    user: string;
    actionDate: Date;
}

export enum LogActions {
    Confirm = 'confirm',
    Cancel = 'cancel',
    CreateNewOrder = 'create_new_order',
    CallLater = 'call_later',
    Next = 'next', 
    Save = 'save', 
    Search = 'search',
    Pause = 'pause',
  }
