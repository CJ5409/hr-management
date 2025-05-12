export interface User {
    id: number;
    email: string;
    role: string;
    department: string;
    position: string;
  }
  
  export interface Notification {
    id: number;
    message: string;
    role: string;
  }
  
  export interface Activity {
    id: number;
    message: string;
    timestamp: string;
  }
  
  export interface SalesOrder {
    id: number;
    item: string;
    quantity: number;
    timestamp: string;
  }
  
  export interface SalesData {
    month: string;
    sales: number;
  }
  
  export interface SalesmanData {
    id: number;
    email: string;
    sales: SalesData[];
  }
  
  export interface Message {
    sender: string;
    message: string;
    timestamp: string;
  }